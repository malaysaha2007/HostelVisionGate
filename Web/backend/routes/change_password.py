from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database.mongodb import db

import random
import smtplib
import os

from email.message import EmailMessage
from datetime import datetime, timedelta
from dotenv import load_dotenv

from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

load_dotenv()

router = APIRouter()


# ==================================================
# MODELS
# ==================================================

class ChangePasswordRequest(BaseModel):
    username: str
    role: str
    current_password: str
    new_password: str


class OTPRequest(BaseModel):
    username: str
    role: str


class VerifyOTPRequest(BaseModel):
    username: str
    otp: str


class ResetPasswordRequest(BaseModel):
    username: str
    otp: str
    new_password: str


# ==================================================
# CHANGE PASSWORD
# ==================================================

@router.put("/change-password")
async def change_password(
    data: ChangePasswordRequest
):

    if data.role == "student":

        collection = db.student_auth_data

        query = {
            "roll_no": data.username
        }

    elif data.role == "admin":

        collection = db.admins

        query = {
            "username": data.username
        }

    elif data.role == "hostel":

        collection = db.hostel_staff

        query = {
            "username": data.username
        }

    else:

        raise HTTPException(
            status_code=400,
            detail="Invalid role"
        )

    user = collection.find_one(query)

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if not pwd_context.verify(
    data.current_password,
    user["password"]
):

        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect"
        )

    collection.update_one(
        query,
        {
            "$set": {
                "password":
                pwd_context.hash(
                data.new_password
            )
            }
        }
    )

    return {
        "message":
        "Password updated successfully"
    }


# ==================================================
# SEND OTP
# ==================================================

@router.post("/send-otp")
async def send_otp(
    data: OTPRequest
):

    if data.role != "student":

        raise HTTPException(
            status_code=403,
            detail="OTP reset is only available for students"
        )

    student = db.student_auth_data.find_one(
        {
            "roll_no":
            data.username
        }
    )

    if not student:

        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    email = (
        student
        .get("contact", {})
        .get("email")
    )

    if not email:

        raise HTTPException(
            status_code=400,
            detail="Student email not found"
        )

    otp = str(
        random.randint(
            100000,
            999999
        )
    )

    db.password_otp.update_one(
        {
            "roll_no":
            data.username
        },
        {
            "$set": {
                "otp":
                otp,
                "expires_at":
                datetime.utcnow()
                +
                timedelta(
                    minutes=5
                )
            }
        },
        upsert=True
    )

    msg = EmailMessage()

    msg["Subject"] = (
        "VisionGate Password Reset OTP"
    )

    msg["From"] = os.getenv(
        "EMAIL"
    )

    msg["To"] = email

    msg.set_content(
        f"""
Your VisionGate OTP is:

{otp}

This OTP will expire in 5 minutes.

Do not share this OTP with anyone.
"""
    )

    try:

        with smtplib.SMTP(
            "smtp.gmail.com",
            587
        ) as server:

            server.starttls()

            server.login(
                os.getenv(
                    "EMAIL"
                ),
                os.getenv(
                    "EMAIL_PASSWORD"
                )
            )

            server.send_message(
                msg
            )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Failed to send email: {str(e)}"
        )

    return {
        "message":
        "OTP sent successfully"
    }


# ==================================================
# VERIFY OTP
# ==================================================

@router.post("/verify-otp")
async def verify_otp(
    data: VerifyOTPRequest
):

    otp_record = db.password_otp.find_one(
        {
            "roll_no":
            data.username
        }
    )

    if not otp_record:

        raise HTTPException(
            status_code=400,
            detail="OTP not found"
        )

    if (
        otp_record["otp"]
        !=
        data.otp
    ):

        raise HTTPException(
            status_code=400,
            detail="Invalid OTP"
        )

    if (
        datetime.utcnow()
        >
        otp_record["expires_at"]
    ):

        raise HTTPException(
            status_code=400,
            detail="OTP expired"
        )
        
    return {
        "message":
        "OTP verified successfully"
    }

   


# ==================================================
# RESET PASSWORD
# ==================================================

@router.put("/reset-password")
async def reset_password(
    data: ResetPasswordRequest
):

    otp_record = db.password_otp.find_one(
        {
            "roll_no":
            data.username
        }
    )

    if not otp_record:

        raise HTTPException(
            status_code=400,
            detail="OTP not found"
        )

    if (
        otp_record["otp"]
        !=
        data.otp
    ):

        raise HTTPException(
            status_code=400,
            detail="Invalid OTP"
        )

    if (
        datetime.utcnow()
        >
        otp_record["expires_at"]
    ):

        raise HTTPException(
            status_code=400,
            detail="OTP expired"
        )

    db.student_auth_data.update_one(
        {
            "roll_no":
            data.username
        },
        {
            "$set": {
                "password":
                 pwd_context.hash(
                data.new_password
            )
            }
        }
    )

    db.password_otp.delete_one(
        {
            "roll_no":
            data.username
        }
    )

    return {
        "message":
        "Password reset successfully"
    }