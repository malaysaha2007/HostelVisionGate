from fastapi import APIRouter, HTTPException
from database.mongodb import db

router = APIRouter()

@router.post("/login")
async def hostel_login(data: dict):

    username = data.get("username")
    password = data.get("password")
    hostel = data.get("hostel")
    role = data.get("role")

    user = db.hostel_staff.find_one({
        "username": username,
        "password": password,
        "hostel": hostel,
        "role": role,
        "status": "ACTIVE"
    })

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Invalid hostel credentials"
        )

    return {
        "message": "Login Successful",
        "user": {
            "username": user["username"],
            "hostel": user["hostel"],
            "role": user["role"]
        }
    }