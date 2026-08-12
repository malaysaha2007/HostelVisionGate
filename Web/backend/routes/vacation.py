from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database.mongodb import db

from pydantic import BaseModel

from bson import ObjectId




class DenyVacationRequest(
    BaseModel):
    
    denialReason: str

router = APIRouter()


class VacationApplication(BaseModel):
    roll_no: str
    hostel: str
    destination: str
    leave_date: str
    return_date: str
    leave_campus_time: str
    reason: str


@router.post("/vacation/apply")
async def apply_vacation(
    data: VacationApplication
):

    try:

        from datetime import datetime
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        db.vacation_application.insert_one({

            "roll_no": data.roll_no,
            "hostel": data.hostel,
            "destination": data.destination,
            "leave_date": data.leave_date,
            "leave_campus_time": data.leave_campus_time,
            "return_date": data.return_date,
            "reason": data.reason,
            "hostel_status": "Pending",
            "gate_status": "Not Requested",
            "vacation_status": "NOT_STARTED",
            "created_at": current_time

        })

        return {
            "success": True,
            "message": "Vacation application submitted"
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )



@router.get("/vacation/student/{roll_no}")
async def get_student_vacations(
    roll_no: str
):
    vacations = list(
        db.vacation_application.find(
            {
                "roll_no": roll_no
            }
        )
    )

    for vacation in vacations:
        vacation["_id"] = str(vacation["_id"])

    return vacations




@router.get("/vacation/{hostel}")
async def get_vacation_requests(
    hostel: str
):

    requests = list(
        db.vacation_application.find(
            {
                "hostel": hostel
            }
        )
    )

    for request in requests:
        request["_id"] = str(request["_id"])

    return requests




@router.put("/vacation/approve/{application_id}")
async def approve_vacation(application_id: str):

    result = db.vacation_application.update_one(
        {
            "_id": ObjectId(application_id)
        },
        {
            "$set": {
                "hostel_status": "Approved"
            },
            "$unset": {
                "denialReason": ""
            }
        }
    )

    print("Matched:", result.matched_count)
    print("Modified:", result.modified_count)

    return {
        "message": "Vacation Approved"
    }
    
    
    
    
    
    
@router.put("/vacation/deny/{application_id}")
async def deny_vacation(
    application_id: str,
    request: DenyVacationRequest
):

    result = db.vacation_application.update_one(
        {
            "_id": ObjectId(application_id)
        },
        {
            "$set": {
                "hostel_status": "Denied",
                "denialReason": request.denialReason
            }
        }
    )

    print("Matched:", result.matched_count)
    print("Modified:", result.modified_count)

    return {
        "message": "Vacation Denied"
    }
    
    
    
    
@router.get("/vacation/gate-pending")
async def get_gate_pending_requests():

    requests = list(
        db.vacation_application.find(
            {
                "gate_status": "Pending"
            }
        )
    )

    for request in requests:
        request["_id"] = str(request["_id"])

    return requests









@router.put("/vacation/gate-approve/{application_id}")
async def gate_approve_vacation(application_id: str):

    result = db.vacation_application.update_one(
        {
            "_id": ObjectId(application_id),
            "hostel_status": "Approved"
        },
        {
            "$set": {
                "gate_status": "Approved"
            }
        }
    )

    return {
        "message": "Gate Approval Granted"
    }
    
    
    
@router.put("/vacation/gate-deny/{application_id}")
async def gate_deny_vacation(application_id: str):

    result = db.vacation_application.update_one(
        {
            "_id": ObjectId(application_id)
        },
        {
            "$set": {
                "gate_status": "Denied"
            }
        }
    )

    return {
        "message": "Gate Approval Denied"
    }
    
    
    
    
    # // VACATION STATUS PAGE //#
    
@router.get("/student/{roll_no}")
async def get_student_vacations(roll_no: str):

    vacations = list(
        db.vacation_application.find(
            {"roll_no": roll_no},
            {"_id": 0}
        )
    )

    return vacations