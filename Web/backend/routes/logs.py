from fastapi import APIRouter
from database.mongodb import db

router = APIRouter()

@router.get("/logs")
def get_logs():

    logs = list(
        db["entry_exit_logs"]
        .find({}, {"_id": 0})
        .sort("timestamp", -1)
        .limit(20)
    )

    return logs