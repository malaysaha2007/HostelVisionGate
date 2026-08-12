from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database.mongodb import db

import requests

router = APIRouter()


# =========================
# REQUEST MODEL
# =========================

class GoogleToken(BaseModel):

    token: str


# =========================
# GOOGLE LOGIN
# =========================

@router.post("/student/google-login")

async def google_login(data: GoogleToken):

    token = data.token

    # =========================
    # VERIFY TOKEN WITH GOOGLE
    # =========================

    google_api = (

        "https://oauth2.googleapis.com/tokeninfo"

        f"?id_token={token}"

    )

    response = requests.get(google_api)

    # =========================
    # INVALID TOKEN
    # =========================

    if response.status_code != 200:

        raise HTTPException(

            status_code=400,

            detail="Invalid Google Token"

        )

    user = response.json()

    # =========================
    # EXTRACT DATA
    # =========================

    email = user.get("email", "")

    name = user.get("name", "")

    # =========================
    # VALIDATE EMAIL DOMAIN
    # =========================

    if not email.lower().endswith(

        "@iiitdmj.ac.in"

    ):

        raise HTTPException(

            status_code=403,

            detail="Use Institute Email Only"

        )

    # =========================
    # EXTRACT ROLL NUMBER
    # =========================

    roll = email.split("@")[0].upper()

    if not roll:

        raise HTTPException(

            status_code=400,

            detail="Invalid Roll Number"

        )

    # =========================
    # CHECK STUDENT EXISTS
    # =========================

    student = db.students_excel.find_one(

        {
            "roll_no": roll
        }

    )

    if not student:

        raise HTTPException(

            status_code=403,

            detail=(
                "You Are Not Authorized. "
                "Contact Hostel Members."
            )

        )

    # =========================
    # CHECK REGISTRATION
    # =========================

    is_registered = student.get(

        "is_registered",

        False

    )

    # =========================
    # RESPONSE
    # =========================

    response_student = {

        "name": name,

        "email": email,

        "roll_no": roll,

        "hostel": student.get(

            "hostel",

            ""

        ),

        "room": student.get(

            "room",

            ""

        ),

        "branch": student.get(

            "branch",

            ""

        )

    }

    # =========================
    # ALREADY REGISTERED
    # =========================

    if is_registered:

        return {

            "message":
                "Login Successful",

            "redirect":
                "dashboard",

            "student":
                response_student

        }

    # =========================
    # FIRST TIME REGISTRATION
    # =========================

    return {

        "message":
            "Google Verification Successful",

        "redirect":
            "face_registration",

        "student":
            response_student

    }