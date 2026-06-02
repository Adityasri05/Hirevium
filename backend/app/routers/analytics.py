from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.user import User
from app.models.interview import Interview
from app.models.evaluation import Evaluation
from app.models.resume import Resume
from app.schemas.schemas import DashboardResponse
from app.utils.auth_utils import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the main dashboard data for the current user."""
    # Get latest evaluation
    eval_result = await db.execute(
        select(Evaluation)
        .where(Evaluation.user_id == user.id)
        .order_by(Evaluation.created_at.desc())
        .limit(1)
    )
    latest_eval = eval_result.scalar_one_or_none()

    # Get interview count
    count_result = await db.execute(
        select(func.count(Interview.id))
        .where(Interview.user_id == user.id)
        .where(Interview.status.in_(["completed", "terminated"]))
    )
    interview_count = count_result.scalar() or 0

    # Get recent interviews with evaluations
    recent_result = await db.execute(
        select(Interview, Evaluation)
        .outerjoin(Evaluation, Evaluation.interview_id == Interview.id)
        .where(Interview.user_id == user.id)
        .where(Interview.status.in_(["completed", "terminated"]))
        .order_by(Interview.created_at.desc())
        .limit(5)
    )
    recent_rows = recent_result.all()
    recent_interviews = []
    for interview, evaluation in recent_rows:
        recent_interviews.append({
            "id": interview.id,
            "type": interview.interview_type,
            "status": interview.status,
            "difficulty": interview.difficulty,
            "score": evaluation.hireiq_score if evaluation else 0,
            "recommendation": evaluation.recommendation if evaluation else "N/A",
            "date": interview.created_at.isoformat() if interview.created_at else "",
        })

    # Get skill data from latest resume
    resume_result = await db.execute(
        select(Resume).where(Resume.user_id == user.id).order_by(Resume.created_at.desc()).limit(1)
    )
    resume = resume_result.scalar_one_or_none()
    skill_data = []
    if resume and resume.skill_confidence:
        for skill, confidence in resume.skill_confidence.items():
            skill_data.append({"subject": skill, "A": confidence, "fullMark": 100})

    # Get score trends from past evaluations
    trend_result = await db.execute(
        select(Evaluation)
        .where(Evaluation.user_id == user.id)
        .order_by(Evaluation.created_at.asc())
        .limit(10)
    )
    trend_evals = trend_result.scalars().all()
    trend_data = [
        {"name": f"Session {i+1}", "score": round(e.hireiq_score, 1)}
        for i, e in enumerate(trend_evals)
    ]

    hireiq_score = latest_eval.hireiq_score if latest_eval else 0
    hire_prob = latest_eval.hire_probability if latest_eval else 0
    recommendation = latest_eval.recommendation if latest_eval else "N/A"

    readiness = "Strong Hire" if hireiq_score >= 85 else "Hire" if hireiq_score >= 70 else "Borderline" if hireiq_score >= 55 else "Needs Improvement"

    return DashboardResponse(
        hireiq_score=round(hireiq_score, 1),
        hire_probability=round(hire_prob, 1),
        readiness=readiness,
        technical_score=round(latest_eval.technical_score, 1) if latest_eval else 0,
        communication_score=round(latest_eval.communication_score, 1) if latest_eval else 0,
        pressure_score=round(latest_eval.pressure_score, 1) if latest_eval else 0,
        interviews_completed=interview_count,
        recent_interviews=recent_interviews,
        skill_data=skill_data,
        trend_data=trend_data,
        predictions=latest_eval.detailed_breakdown.get("predictions") if latest_eval and latest_eval.detailed_breakdown else None,
        risks=latest_eval.detailed_breakdown.get("risks") if latest_eval and latest_eval.detailed_breakdown else None,
        benchmarks=latest_eval.detailed_breakdown.get("benchmarks") if latest_eval and latest_eval.detailed_breakdown else None,
        learning_velocity=latest_eval.detailed_breakdown.get("learning_velocity") if latest_eval and latest_eval.detailed_breakdown else None,
    )


@router.get("/trends")
async def get_trends(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get score trends over time."""
    result = await db.execute(
        select(Evaluation)
        .where(Evaluation.user_id == user.id)
        .order_by(Evaluation.created_at.asc())
    )
    evaluations = result.scalars().all()

    return {
        "hireiq_trend": [{"session": i+1, "score": round(e.hireiq_score, 1)} for i, e in enumerate(evaluations)],
        "technical_trend": [{"session": i+1, "score": round(e.technical_score, 1)} for i, e in enumerate(evaluations)],
        "communication_trend": [{"session": i+1, "score": round(e.communication_score, 1)} for i, e in enumerate(evaluations)],
        "pressure_trend": [{"session": i+1, "score": round(e.pressure_score, 1)} for i, e in enumerate(evaluations)],
    }
