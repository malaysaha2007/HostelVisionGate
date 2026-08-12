import smtplib
from email.message import EmailMessage
from fastapi import APIRouter
from database.mongodb import db
from datetime import datetime
from pydantic import BaseModel

from dotenv import load_dotenv
import os

load_dotenv()

EMAIL = os.getenv("EMAIL")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")




# =========================
# LATEST LOG PER STUDENT
# =========================
    
    
CURFEW_HOUR = 11
CURFEW_MINUTE = 00


# =========================




router = APIRouter()


class MailRequest(BaseModel):

    emails: list[str]

@router.get("/curfew-mail")
async def get_curfew_students():
    
    

    logs = list(
        db.entry_exit_logs.find()
    )

    # =========================
    # LATEST LOG PER STUDENT
    # =========================

    latest_logs = {}

    for log in logs:

        roll = log.get(
            "roll",
            ""
        )

        out_time = log.get(
            "outTime",
            ""
        )

        if not roll or not out_time:
            continue

        if roll not in latest_logs:

            latest_logs[roll] = log

        else:

            old_out_time = latest_logs[
                roll
            ].get(
                "outTime",
                ""
            )

            if out_time > old_out_time:

                latest_logs[roll] = log

    # =========================
    # CURFEW VIOLATION LIST
    # =========================

    students = []

    current_time = datetime.now()

    for log in latest_logs.values():

        purpose = log.get(
            "purpose",
            ""
        ).strip().lower()
        
        roll = log.get(
        "roll",
        ""
)

        active_vacation = db.vacation_application.find_one(
    {
        "roll_no": roll,
        "vacation_status": "ACTIVE"
    }
)

        if active_vacation:
            continue
        
      

        # =====================
        # AUTHORIZED PURPOSES
        # =====================

        if purpose in [

            "leave",
            "hospital",
            "medical",
            "special leave",
            "emergency leave"

        ]:
            continue

        out_time_str = log.get(
            "outTime",
            ""
        )

        in_time_str = log.get(
            "inTime",
            ""
        )

        try:

             out_dt = datetime.strptime(
                out_time_str,
                "%Y-%m-%d %H:%M:%S"
            )

        except:
            continue

        violation = False

        # =====================
        # STUDENT RETURNED
        # =====================

        in_dt = None

        if in_time_str:

            in_dt = datetime.strptime(
        in_time_str,
        "%Y-%m-%d %H:%M:%S"
    )

        curfew_dt = datetime(
    current_time.year,
    current_time.month,
    current_time.day,
    CURFEW_HOUR,
    CURFEW_MINUTE,
    0
)
        violation = False

        if out_dt <= curfew_dt:

    # Student still outside
            if not in_dt:
                violation = True

    # Student returned after today's curfew
            elif in_dt > curfew_dt:
                violation = True

        if not violation:
                continue

        roll = log.get(
            "roll",
            ""
    )

        student_auth = db.student_auth_data.find_one(
            {
                "roll_no": roll
            }
        )

        name = ""
        email = ""
        hostel = ""
        room = ""

        if student_auth:

            name = student_auth.get(
                "name",
                ""
            )

            email = (
                student_auth
                .get("contact", {})
                .get("email", "")
            )

            hostel = student_auth.get(
                "hostel",
                ""
            )

            room = student_auth.get(
                "room",
                ""
            )
            
        today = datetime.now().strftime("%Y-%m-%d")

        already_sent = db.curfew_notifications.find_one({
            "roll_no": roll,
            "date": today
            })

        if already_sent:
                continue
            

        students.append({

            "name": name,

            "roll": roll,

            "email": email,

            "hostel": hostel,

            "room": room,

            "purpose": log.get(
                "purpose",
                ""
            ),

            "outTime": out_time_str,

            "inTime": in_time_str

        })

    return {
        "students": students
    }
    
    
@router.post("/curfew-mail/send")
async def send_curfew_mail(request: MailRequest):

    result = await get_curfew_students()

    students = result["students"]
    
    students = [

    student

    for student in students

    if student.get(
        "email",
        ""
    ) in request.emails

]

    sent_emails = []

    failed_emails = []

    for student in students:

        email = student.get(
            "email",
            ""
        )

        if not email:
            continue

        try:

            msg = EmailMessage()

            msg["Subject"] = (
                "Late Entry Notice | Hostel Office"
            )

            msg["From"] = (
                "Hostel Management"
            )

            msg["To"] = email

            msg.set_content(
                "Curfew Violation Notice"
            )

            msg.add_alternative(
                f"""
<html>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:20px;">

<div style="
    max-width:700px;
    margin:auto;
    background:white;
    padding:30px;
    border-radius:8px;
">

<div style="
    background:#1f3f95;
    color:white;
    text-align:center;
    padding:15px;
    font-size:28px;
    font-weight:bold;
">
Hostel Late Entry Notification
</div>

<br>

<p>
Dear <b>{student.get('name', 'Student')}</b>,
</p>

<p>
Your entry into the hostel has been recorded
<b>after the official curfew time.</b>
</p>

<table style="
    border-collapse:collapse;
    width:100%;
">

<tr>
    <td><b>Name :</b></td>
    <td>{student.get('name', '')}</td>
</tr>

<tr>
    <td><b>Roll No. :</b></td>
    <td>{student.get('roll', '')}</td>
</tr>

<tr>
    <td><b>Hostel :</b></td>
    <td>{student.get('hostel', '')}</td>
</tr>

<tr>
    <td><b>Room :</b></td>
    <td>{student.get('room', '')}</td>
</tr>

<tr>
    <td><b>Email :</b></td>
    <td>{student.get('email', '')}</td>
</tr>

<tr>
    <td><b>Purpose :</b></td>
    <td>{student.get('purpose', '')}</td>
</tr>

<tr>
    <td><b>Out Time :</b></td>
    <td>{student.get('outTime', '')}</td>
</tr>

<tr>
    <td><b>In Time :</b></td>
    <td>{student.get('inTime', '') or '—'}</td>
</tr>

</table>

<br>

<p>
Repeated late entries may lead to disciplinary action.
</p>

<br>

<p>
Regards,<br>
Hostel Office<br>
PDPM IIITDM Jabalpur
</p>

<p style="
    color:gray;
    font-size:12px;
">
This is an automated message. Please do not reply.
</p>

</div>

</body>
</html>
                """,
                subtype="html"
            )

            with smtplib.SMTP(
                "smtp.gmail.com",
                587
            ) as server:

                server.starttls()

                server.login(
                    EMAIL,
                    EMAIL_PASSWORD
                )

                server.send_message(msg)
                
                db.curfew_notifications.insert_one({
    "roll_no": student["roll"],
    "date": datetime.now().strftime("%Y-%m-%d"),
    "sent_at": datetime.now()
})

            sent_emails.append(email)
        except Exception as e:

            print(
                f"Mail failed for {email}: {e}"
            )
            
            failed_emails.append(email)

    return {

    "success": True,

    "sent": sent_emails,

    "failed": failed_emails

}