from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from passlib.context import CryptContext

from database.mongodb import db

router = APIRouter()

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


class StudentLogin(BaseModel):
    studentid: str
    password: str


@router.post("/student/login")
async def student_login(data: StudentLogin):

    student = db.student_auth_data.find_one({
        "roll_no": data.studentid
    })

    if not student:
        raise HTTPException(
            status_code=401,
            detail="Invalid Roll Number or Password"
        )

    if not pwd_context.verify(
        data.password,
        student["password"]
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid Roll Number or Password"
        )

    return {
        "message": "Login Successful",
        "roll_no": student.get("roll_no"),
        "_id": str(student["_id"])
    }
    