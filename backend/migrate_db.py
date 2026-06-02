import sqlite3
import os

def migrate():
    db_path = os.path.join(os.path.dirname(__file__), 'hireiq.db')
    print(f"Opening database at {db_path}...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get columns of evaluations table
    cursor.execute("PRAGMA table_info(evaluations)")
    columns = [row[1] for row in cursor.fetchall()]
    
    new_cols = [
        "company_context",
        "war_room",
        "predictions",
        "risks",
        "benchmarks",
        "learning_velocity"
    ]
    
    for col in new_cols:
        if col not in columns:
            print(f"Adding column {col} to evaluations table...")
            cursor.execute(f"ALTER TABLE evaluations ADD COLUMN {col} JSON")
            
    conn.commit()
    conn.close()
    print("Migration finished successfully.")

if __name__ == "__main__":
    migrate()
