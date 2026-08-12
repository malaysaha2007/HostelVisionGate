from fastapi import APIRouter
from database.mongodb import db

router = APIRouter()

@router.get("/dashboard/analytics")
async def dashboard_analytics():

    logs = list(
        db.entry_exit_logs.find(
            {},
            {
                "_id": 0,
                "name": 1,
                "roll": 1,
                "outTime": 1,
                "inTime": 1,
                "purpose": 1,
            }
        )
    )

    return {
        "logs": logs
    }