from fastapi import APIRouter

from database.mongodb import db

router = APIRouter()


@router.get("/vacation")
async def get_all_vacations():

    vacations = list(
        db.vacation_application.find({})
    )

    for vacation in vacations:
        vacation["_id"] = str(vacation["_id"])

    return vacations


@router.get("/admin/dashboard")
async def get_dashboard_data():

    
    logs_cursor = db.entry_exit_logs.find().sort(
        "outTime",
        -1
    )

    logs = []

    inside_count = 0
    outside_count = 0
    
    active_vacation_count = db.vacation_application.count_documents(
    {
        "vacation_status": "ACTIVE"
    }
)

    for log in logs_cursor:

        record = {

            "name": log.get(
                "name",
                ""
            ),

            "roll": log.get(
                "roll",
                ""
            ),

            "hostel": log.get(
                "hostel",
                ""
            ),

            "room": log.get(
                "room",
                ""
            ),

            "phone": log.get(
                "phone",
                ""
            ),

            "purpose": log.get(
                "purpose",
                ""
            ),

            "outTime": log.get(
                "outTime",
                ""
            ),

            "inTime": log.get(
                "inTime",
                ""
            ),

            "comment_text": log.get(
                "comment_text",
                ""
            )

        }

        logs.append(record)

        if log.get("inTime"):

            inside_count += 1

        else:

            outside_count += 1

    return {

        "total_records": len(logs),

        "students_inside": inside_count,

        "students_outside": outside_count,
        
        "on_vacation_students": active_vacation_count,


        "logs": logs

    }
    
    
    