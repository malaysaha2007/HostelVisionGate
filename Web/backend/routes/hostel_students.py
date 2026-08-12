from fastapi import APIRouter
from database.mongodb import db

router = APIRouter()


@router.get("/hostel/students/{hostel_name}")

async def get_hostel_students(hostel_name: str):

    student_collection = db.student_auth_data

    students = list(
        student_collection.find(
            {
                "hostel": hostel_name
            }
        )
    )

    final_students = []

    for student in students:

        final_students.append({

        "_id": str(student["_id"]),

        "name": student.get("name", ""),

        "roll_no": student.get("roll_no", ""),

        "room": student.get("room", ""),

        "hostel": student.get("hostel", ""),

        "email": student.get("contact", {}).get("email", ""),

        "student_no": student.get("contact", {}).get("student_no", ""),

        "parent_no": student.get("contact", {}).get("parent_no", ""),

        "branch": student.get("branch", ""),
        
        "face_images": student.get( "face_images",[]
),
        

    })

    return final_students