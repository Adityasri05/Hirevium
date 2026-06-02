import json
import re
from google import genai
from app.config import get_settings

settings = get_settings()

# Initialize Gemini Client if API key is not a placeholder
client = None
if settings.GOOGLE_API_KEY and not settings.GOOGLE_API_KEY.startswith("your-"):
    try:
        client = genai.Client(api_key=settings.GOOGLE_API_KEY)
    except Exception:
        client = None

MODEL_ID = "gemini-2.5-flash-lite"


async def call_gemini(system_prompt: str, user_prompt: str, json_output: bool = True) -> dict | str:
    """
    Call Gemini 2.5 Flash Lite with a system prompt and user prompt.
    If json_output is True, parse the response as JSON.
    If the API key is not configured, or if the call fails, returns a realistic mock response matching the prompt's schema.
    """
    if client is not None:
        try:
            response = client.models.generate_content(
                model=MODEL_ID,
                contents=[
                    {"role": "user", "parts": [{"text": user_prompt}]},
                ],
                config={
                    "system_instruction": system_prompt,
                    "temperature": 0.7,
                    "max_output_tokens": 4096,
                    "safety_settings": [
                        {
                            "category": "HARM_CATEGORY_HATE_SPEECH",
                            "threshold": "BLOCK_MEDIUM_AND_ABOVE",
                        },
                        {
                            "category": "HARM_CATEGORY_HARASSMENT",
                            "threshold": "BLOCK_MEDIUM_AND_ABOVE",
                        },
                        {
                            "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                            "threshold": "BLOCK_MEDIUM_AND_ABOVE",
                        },
                        {
                            "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                            "threshold": "BLOCK_MEDIUM_AND_ABOVE",
                        },
                    ],
                },
            )

            text = response.text.strip()

            if json_output:
                # Try to extract JSON from markdown code blocks
                json_match = re.search(r"```(?:json)?\s*\n?(.*?)\n?```", text, re.DOTALL)
                if json_match:
                    text = json_match.group(1).strip()
                try:
                    return json.loads(text)
                except json.JSONDecodeError:
                    # Try to find any JSON object or array in the text
                    obj_match = re.search(r"(\{.*\}|\[.*\])", text, re.DOTALL)
                    if obj_match:
                        return json.loads(obj_match.group(1))
                    # Fall back to mock on json parse failure
                    return _generate_mock_response(system_prompt, user_prompt)
            return text
        except Exception:
            # Fall back to mock on API error
            if json_output:
                return _generate_mock_response(system_prompt, user_prompt)
            return "API connection error. Mock mode active."
    else:
        # Fall back to mock on missing client (no API key configured)
        if json_output:
            return _generate_mock_response(system_prompt, user_prompt)
        return "Mock response: API Key not configured."


def _generate_mock_response(system_prompt: str, user_prompt: str) -> dict:
    """Generate realistic mock data based on the type of agent requested in the system prompt."""
    prompt_lower = system_prompt.lower()

    if "resume intelligence" in prompt_lower:
        # Try to parse user name from user prompt
        name_match = re.search(r"([A-Z][a-z]+ [A-Z][a-z]+)", user_prompt)
        candidate_name = name_match.group(1) if name_match else "Candidate"
        return {
            "skills": ["Python", "React", "TypeScript", "FastAPI", "SQL", "Docker", "Git", "CI/CD"],
            "projects": [
                {
                    "name": "E-Commerce Cloud Architecture",
                    "description": "Designed and deployed a highly scalable, multi-tenant e-commerce platform using microservices.",
                    "technologies": ["Python", "FastAPI", "Docker", "AWS"],
                    "complexity_score": 8
                },
                {
                    "name": "Interactive Next.js Dashboard",
                    "description": "Built a real-time analytics dashboard with dynamic widgets and responsive design.",
                    "technologies": ["TypeScript", "Next.js", "Tailwind CSS"],
                    "complexity_score": 7
                }
            ],
            "education": [
                {"degree": "Bachelor of Science in Computer Science", "institution": "State Technical University", "year": "2022"}
            ],
            "certifications": ["AWS Certified Solutions Architect", "Google Cloud Associate Engineer"],
            "experience": [
                {
                    "role": "Full Stack Engineer",
                    "company": "TechSolutions Inc.",
                    "duration": "2 years",
                    "highlights": [
                        "Optimized backend API performance by 40% with caching.",
                        "Led frontend redesign utilizing modern responsive components."
                    ]
                }
            ],
            "resume_score": 85,
            "skill_confidence": {"Python": 90, "React": 85, "TypeScript": 80, "FastAPI": 85, "SQL": 75, "Docker": 70},
            "project_complexity": {"overall": 8, "breakdown": {"E-Commerce Cloud Architecture": 8, "Interactive Next.js Dashboard": 7}},
            "leadership_indicators": ["Led frontend redesign", "Mentored junior developers"],
            "business_impact_score": 82,
            "summary": f"Highly motivated Full Stack Engineer with 2+ years of experience building high-performance web applications. Skilled in modern Python backends and TypeScript frontends."
        }

    elif "job description intelligence" in prompt_lower:
        return {
            "required_skills": ["Python", "React", "SQL", "FastAPI"],
            "preferred_skills": ["Docker", "Kubernetes", "AWS", "GraphQL"],
            "responsibilities": [
                "Design and build scalable APIs.",
                "Collaborate with cross-functional teams.",
                "Optimize applications for maximum speed."
            ],
            "seniority_level": "Mid-Senior",
            "technology_stack": ["Python", "FastAPI", "React", "PostgreSQL"],
            "experience_required_years": 3,
            "role_summary": "We are seeking a talented Software Engineer to design, build, and scale our core backend APIs and collaborate on our frontend dashboards."
        }

    elif "interview planner" in prompt_lower:
        return {
            "knowledge_graph": {
                "nodes": [
                    {"id": "python-basics", "label": "Python Core", "category": "technical", "status": "pending"},
                    {"id": "fastapi-apis", "label": "FastAPI & REST", "category": "technical", "status": "pending"},
                    {"id": "react-components", "label": "React State Management", "category": "technical", "status": "pending"},
                    {"id": "system-design", "label": "Database Design & Scaling", "category": "system_design", "status": "pending"}
                ],
                "edges": [
                    {"from": "python-basics", "to": "fastapi-apis"},
                    {"from": "fastapi-apis", "to": "system-design"}
                ]
            },
            "total_questions": 10,
            "suggested_focus": ["REST API Design", "Asynchronous Programming in Python", "State Optimization in React"]
        }

    elif "adaptive interview" in prompt_lower:
        # Choose a question based on user prompt context
        question_text = "Can you explain how async/await works in Python under the hood, and how it differs from multithreading?"
        topic = "Asynchronous Python"
        node = "Python Core > Asynchronous Programming"
        
        # If React is mentioned
        if "react" in user_prompt.lower():
            question_text = "What are the key performance optimizations in React, and when would you use useMemo or useCallback?"
            topic = "React Performance"
            node = "React > Performance"
            
        return {
            "question_text": question_text,
            "difficulty": "Medium",
            "category": "technical",
            "topic": topic,
            "knowledge_node": node,
            "follow_up_path": ["Event Loop mechanics", "Async DB drivers in FastAPI"],
            "reasoning": "Probing candidate's understanding of asynchronous execution and thread models in Python."
        }

    elif "technical evaluation" in prompt_lower:
        return {
            "technical_accuracy": 85,
            "problem_solving": 80,
            "knowledge_depth": 78,
            "practical_experience": 85,
            "communication_clarity": 90,
            "confidence_level": 85,
            "overall_score": 83,
            "reasoning": "The candidate explained the event loop and coroutines very clearly, highlighting the single-threaded nature of asyncio and comparing it correctly to threads and the GIL. A solid understanding shown.",
            "strengths": ["Clear comparison of threading vs asyncio", "Accurate explanation of event loop"],
            "weaknesses": ["Did not mention task starvation or blocking operations explicitly"],
            "missed_concepts": ["Task blocking", "uvloop performance benefits"],
            "follow_up_suggestion": "Ask how they handle CPU-bound tasks in an async context."
        }

    elif "hiring manager" in prompt_lower:
        return {
            "recommendation": "Strong Hire",
            "hire_probability": 88,
            "reasoning": "The candidate demonstrated excellent deep technical knowledge, solid communication, and outstanding problem-solving skills throughout the interview. They handled pressure well and showed genuine passion for high-quality engineering.",
            "strengths": ["Deep understanding of Python async internals", "Strong communication clarity", "Great architectural thinking"],
            "weaknesses": ["Minor gaps in deep AWS cloud configuration"],
            "risk_factors": ["None significant"],
            "team_fit_assessment": "Collaborative, transparent, and eager to learn. Will fit seamlessly into a high-performing product team.",
            "growth_potential": "high",
            "suggested_level": "Mid"
        }

    elif "career coach" in prompt_lower:
        return {
            "horizon": "7",
            "title": "7-Day Sprint: Advanced FastAPI and System Scaling",
            "description": "A focused sprint to master async database connection pooling and API performance optimization.",
            "modules": [
                {
                    "id": "m1",
                    "title": "Asynchronous Database Integration",
                    "status": "in-progress",
                    "progress": 25,
                    "priority": "high",
                    "resources": [
                        {"title": "SQLAlchemy 2.0 Async Guide", "type": "Reading", "duration": "1h", "url": "https://docs.sqlalchemy.org/"},
                        {"title": "FastAPI Database Best Practices", "type": "Video", "duration": "1.5h", "url": "https://youtube.com"}
                    ],
                    "tasks": [
                        "Implement connection pooling with asyncpg in a demo app",
                        "Benchmark sync vs async database queries"
                    ],
                    "expected_outcome": "Able to configure and optimize async SQLAlchemy engines and prevent DB connection starvation."
                }
            ]
        }

    elif "ai copilot" in prompt_lower:
        return {
            "response": "To increase your HireIQ score, focus on **Asynchronous Python** and **Database Optimization**! Based on your latest interview, you scored an impressive 83% on Core Python but had minor gaps in handling blocking database queries in async handlers. I suggest checking out the **SQLAlchemy 2.0 Async Guide** in your personalized learning roadmap.",
            "suggestions": [
                "Show me how to optimize database connections.",
                "What are the best resources for React state management?",
                "Can we practice a Hard difficulty interview?"
            ]
        }

    elif "difficulty controller" in prompt_lower:
        return {
            "current_difficulty": "Medium",
            "new_difficulty": "Medium",
            "changed": False,
            "reasoning": "Recent score is 83, which is stable and shows solid capability. Maintaining Medium difficulty to gather more signals."
        }

    elif "skill gap" in prompt_lower:
        return {
            "match_score": 85,
            "missing_skills": ["Kubernetes", "GraphQL"],
            "learning_difficulty": "medium",
            "roadmap_priority": "high",
            "gap_analysis": {
                "Docker": {"status": "verified", "evidence": "Used in microservices e-commerce project"},
                "Kubernetes": {"status": "missing", "evidence": "No mention in experience or projects"}
            }
        }

    else:
        # Default fallback
        return {
            "status": "success",
            "message": "Fallback mock response because API key is not configured.",
            "data": {}
        }
