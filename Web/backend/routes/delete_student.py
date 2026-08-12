from fastapi import APIRouter
from bson import ObjectId

from database.mongodb import db

router = APIRouter()


@router.delete("/student/delete/{student_id}")

async def delete_student(student_id: str):

    db.student_data.delete_one(

        {
            "_id": ObjectId(student_id)
        }

    )

    return {

        "message":
            "Student Deleted Successfully"

    }