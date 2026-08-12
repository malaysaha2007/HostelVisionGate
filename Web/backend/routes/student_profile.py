from fastapi import APIRouter

from database.mongodb import db

router = APIRouter()


@router.get("/student/profile/{roll_no}")
async def get_student_profile(roll_no: str):

    student = db.student_auth_data.find_one(
        {
            "roll_no": roll_no
        }
    )

    if not student:
        return {
            "message": "Student Not Found"
        }

    logs_cursor = db.entry_exit_logs.find(
        {
            "roll": roll_no
        }
    )

    logs = []

    for log in logs_cursor:

        logs.append({

            "_id": str(log.get("_id", "")),

            "outTime": log.get("outTime", ""),

            "inTime": log.get("inTime", ""),

            "purpose": log.get("purpose", "")

        })

    return {

        "student": {

            "_id": str(student["_id"]),

            "name": student.get("name", ""),

            "roll": student.get("roll_no", ""),

            "branch": student.get("branch", ""),

            "hostel": student.get("hostel", ""),

            "room": student.get("room", ""),
            
            "face_images": student.get("face_images", []),


            "contact": {

                "email": student.get("contact", {}).get("email", ""),

                "student_no": student.get("contact", {}).get("student_no", ""),

                "parent_no": student.get("contact", {}).get("parent_no", "")

            }

        },

        "logs": logs

    }