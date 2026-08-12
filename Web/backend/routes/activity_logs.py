from fastapi import APIRouter
from database.mongodb import db

router = APIRouter()


@router.get("/activity-logs")
async def get_activity_logs():

    logs_cursor = db.activity_logs.find().sort(
        "timestamp",
        -1
    )

    logs = []

    for log in logs_cursor:

        logs.append({

            "user_id":
                log.get(
                    "user_id",
                    ""
                ),

            "role":
                log.get(
                    "role",
                    ""
                ),

            "hostel":
                log.get(
                    "hostel",
                    ""
                ),

            "action_type":
                log.get(
                    "action_type",
                    ""
                ),

            "description":
                log.get(
                    "description",
                    ""
                ),

            "timestamp":
                str(
                    log.get(
                        "timestamp",
                        ""
                    )
                )

        })

    return {
        "logs": logs
    }