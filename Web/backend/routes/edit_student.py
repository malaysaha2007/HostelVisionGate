from fastapi import APIRouter
from bson import ObjectId

from database.mongodb import db

router = APIRouter()


@router.put("/student/edit/{student_id}")
async def edit_student(
    student_id: str,
    data: dict
):

    result = db.student_auth_data.update_one(
        {
            "_id": ObjectId(student_id)
        },
        {
            "$set": {
                "hostel": data.get("hostel", ""),
                "room": data.get("room", ""),
                "contact.student_no": data.get("student_no", ""),
                "contact.parent_no": data.get("parent_no", "")
            }
        }
    )

    if result.matched_count == 0:
        return {
            "message": "Student Not Found"
        }

    return {
        "message": "Student Updated Successfully"
    }