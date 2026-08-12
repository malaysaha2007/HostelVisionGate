from fastapi import APIRouter
from database.mongodb import db
from datetime import datetime

router = APIRouter()


@router.get("/hostel/logs/{hostel_name}")
async def get_hostel_logs(hostel_name: str):

    logs_collection = db.entry_exit_logs
    student_collection = db.student_data

    # =========================
    # TOTAL STUDENTS
    # =========================

    total_students = student_collection.count_documents(
        {
            "hostel": hostel_name
        }
    )

    # =========================
    # FETCH ALL LOGS
    # =========================

    logs = list(
        logs_collection.find(
            {
                "hostel": hostel_name
            }
        )
    )
    
    
    # =========================
    # CURRENT TIME
    # =========================

    current_time = datetime.now()

    curfew_hour = 22
    curfew_minute = 30

    # =========================
    # GET LATEST LOG OF EACH STUDENT
    # =========================

    latest_logs = {}

    for log in logs:

        roll = log.get("roll", "")

        if not roll:
            continue

        out_time = log.get(
            "outTime",
            ""
        )

        if roll not in latest_logs:

            latest_logs[roll] = log

        else:

            old_out_time = latest_logs[roll].get(
                "outTime",
                ""
            )

            if out_time > old_out_time:

                latest_logs[roll] = log

    # =========================
    # FINAL LISTS
    # =========================

    outside_students = []
    curfew_students = []
    leave_students = []

    # =========================
    # CHECK STUDENT STATUS
    # =========================

    for roll, log in latest_logs.items():

        out_time = log.get(
            "outTime",
            ""
        )

        in_time = log.get(
            "inTime",
            ""
        )

        purpose = log.get(
            "purpose",
            ""
        )

        student_data = {

            "_id": str(
                log.get("_id", "")
            ),

            "name": log.get(
                "name",
                ""
            ),

            "roll": roll,

            "room": log.get(
                "room",
                ""
            ),

            "purpose": purpose,

            "outTime": out_time,

            "inTime": in_time

        }
        # =====================
        # OUTSIDE STUDENTS
        # =====================

        if out_time and not in_time:

            outside_students.append(
                student_data
            )

        # =====================
        # LEAVE / SPECIAL PURPOSE
        # =====================

        purpose_lower = (
            purpose.lower()
            if purpose
            else ""
        )

        if (
            out_time
            and not in_time
            and (
                "leave" in purpose_lower
                or "medical" in purpose_lower
                or "hospital" in purpose_lower
                or "emergency" in purpose_lower
            )
        ):

            leave_students.append(
                student_data
            )

        # =====================
        # CURFEW SYSTEM
        # =====================

        try:

            purpose_lower = (
                purpose.lower()
                if purpose
                else ""
            )

            special_purpose = (
                "leave" in purpose_lower
                or "medical" in purpose_lower
                or "hospital" in purpose_lower
                or "emergency" in purpose_lower
            )

            # Skip curfew checking for approved overnight purposes
            if not special_purpose:

                # =====================
                # CASE 1:
                # Student is still outside after curfew
                # =====================

                if out_time and not in_time:

                    out_dt = datetime.strptime(
                        out_time,
                        "%Y-%m-%d %H:%M:%S"
                )

                    curfew_dt = out_dt.replace(
                        hour=curfew_hour,
                        minute=curfew_minute,
                        second=0,
                        microsecond=0
                )

                    if current_time > curfew_dt:

                        student_data["curfewType"] = "Still Outside"

                        curfew_students.append(
                            student_data
                )

                # =====================
                # CASE 2:
                # Student has returned
                # =====================

                elif out_time and in_time:

                    out_dt = datetime.strptime(
                        out_time,
                        "%Y-%m-%d %H:%M:%S"
                    )

                    in_dt = datetime.strptime(
                        in_time,
                        "%Y-%m-%d %H:%M:%S"
                    )
                    
                    curfew_dt = out_dt.replace(
                        hour=curfew_hour,
                        minute=curfew_minute,
                        second=0,
                        microsecond=0
                    )

                   

                    # Returned after curfew on the same day
                    if in_dt > curfew_dt:

                        student_data["curfewType"] = "Late Return"

                        curfew_students.append(
                            student_data
                        )

        except Exception as e:

            print(
                "Curfew Error:",
                e
            )

    # =========================
    # DEBUG
    # =========================

    print(
        "Hostel:",
        hostel_name
    )

    print(
        "Outside:",
        len(outside_students)
    )

    print(
        "Curfew:",
        len(curfew_students)
    )

    print(
        "Leave:",
        len(leave_students)
    )

    # =========================
    # RESPONSE
    # =========================

    return {

        "hostel": hostel_name,

        "hostelStaff": "",

        "totalStudents":
            total_students,

        "studentsInCampus":
            total_students
            - len(outside_students),

        "studentsOutsideCampus":
            len(outside_students),

        "outsideAfterCurfew":
            len(curfew_students),

        "leaveOrSpecialPurpose":
            len(leave_students),

        "outsideStudents":
            outside_students,

        "curfewStudents":
            curfew_students,

        "leaveStudents":
            leave_students

    }