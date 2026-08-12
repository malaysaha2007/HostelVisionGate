from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database.mongodb import db

router = APIRouter()


class AdminLogin(BaseModel):
    username: str
    password: str
    level: str


@router.post("/admin/login")
async def admin_login(data: AdminLogin):

    admin = db.admins.find_one({
        "username": data.username
    })

    if not admin:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    if admin.get("password") != data.password:
        raise HTTPException(
            status_code=401,
            detail="Incorrect password"
        )

    role_map = {
        "Director": "Director",
        "Dean Academic": "Dean Academic",
        "Main Gate Guard": "Guard"
    }

    db_role = admin.get("role")

    if db_role not in role_map:
        raise HTTPException(
            status_code=400,
            detail="Invalid role configuration"
        )

    if role_map[db_role] != data.level:
        raise HTTPException(
            status_code=401,
            detail="Incorrect access level selected"
        )

    return {
        "message": "Login Successful",
        "admin": {
            "admin_id": admin.get("admin_id"),
            "name": admin.get("name"),
            "username": admin.get("username"),
            "role": admin.get("role"),
            "scope": admin.get("scope")
        }
    }