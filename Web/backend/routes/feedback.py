from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime

from database.mongodb import db


router = APIRouter(prefix="/feedback", tags=["Feedback"])


class FeedbackModel(BaseModel):
    name: str
    feedback: str
    rating: int


@router.post("/submit")
async def submit_feedback(data: FeedbackModel):

    feedback_doc = {
        "name": data.name,
        "feedback": data.feedback,
        "rating": data.rating,
        "created_at": datetime.utcnow().strftime("%d-%m-%Y")

    }

    db.feedbacks.insert_one(feedback_doc)

    return {
        "success": True,
        "message": "Feedback submitted successfully"
    }


@router.get("/all")
async def get_feedbacks():

    feedbacks = list(
        db.feedbacks.find(
            {},
            {"_id": 0}
        ).sort("created_at", -1)
    )

    return feedbacks