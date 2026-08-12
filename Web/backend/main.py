from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.mongodb import db
from routes.student import router as student_router
from routes import hostel
from routes import hostel_students
from routes import hostel_logs
from routes import add_students
from routes import edit_student
from routes import delete_student
from routes import google_auth
from routes import face_registration
from routes import admin
from routes import dashboard
from routes.activity_logs import (router as activity_logs_router)
from routes.curfew_mail import (router as curfew_mail_router)
from routes.student_profile import router as student_profile_router
from routes import vacation
from routes import change_password
from routes.feedback import router as feedback_router
from routes import dashboard_analytics






app = FastAPI()


# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# ROUTES
# =========================

app.include_router(student_router)
app.include_router(
    google_auth.router
)
app.include_router(hostel.router, prefix="/hostel")
app.include_router(hostel_students.router)
app.include_router(hostel_logs.router)
app.include_router(add_students.router)
app.include_router(edit_student.router)
app.include_router(delete_student.router)
app.include_router(face_registration.router)
app.include_router(admin.router)
app.include_router(dashboard.router)
app.include_router(activity_logs_router)
app.include_router(curfew_mail_router)
app.include_router(student_profile_router)
app.include_router(vacation.router)
app.include_router(change_password.router)
app.include_router(feedback_router)
app.include_router(dashboard_analytics.router)




# =========================
# TEST ROUTE
# =========================

@app.get("/")
def home():

    return {
        "message": "VisionGate Backend Running",
        "database": "main_gate_entry_exit_system"
    }