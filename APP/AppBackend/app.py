from flask import Flask, request, jsonify
from flask_cors import CORS
import face_recognition
import numpy as np
from PIL import Image
import io
from datetime import datetime, timedelta
from pymongo import MongoClient
import requests
import cv2
import base64
import os
import traceback

# ======================================================
# APP SETUP
# ======================================================
app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "Your App Backend Is Running"


# ======================================================
# MONGODB SETUP
# ======================================================
client = MongoClient(
    "mongodb+srv://malay07_db_user:Malay07%40@prproject.h4mjvbl.mongodb.net/?retryWrites=true&w=majority",
    serverSelectionTimeoutMS=5000
)

db = client["main_gate_entry_exit_system"]

students_collection = db["student_auth_data"]
entry_exit_collection = db["entry_exit_logs"]
vacation_collection = db["vacation_application"]
night_attendance_collection = db["night_attendance"]



# ======================================================
# GENERATE EMBEDDING (USED BY WEB)
# ======================================================
@app.route('/generate-embedding', methods=['POST'])
def generate_embedding():

    try:
        data = request.get_json()

        if not data or "image_url" not in data:
            return jsonify({
                "error": "image_url missing"
            }), 400

        image_url = data["image_url"]

        # Download image
        response = requests.get(image_url, timeout=10)

        img = Image.open(io.BytesIO(response.content)).convert("RGB")
        img = np.array(img)

        # Resize image
        small_img = cv2.resize(
            img,
            (0, 0),
            fx=0.5,
            fy=0.5
        )

        # IMPORTANT
        rgb_small = cv2.cvtColor(small_img, cv2.COLOR_BGR2RGB)

        # SIMPLE ENCODING METHOD
        encodings = face_recognition.face_encodings(rgb_small)

        if len(encodings) == 0:
            return jsonify({
                "error": "No face found"
            }), 400

        return jsonify({
            "embedding": encodings[0].tolist()
        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


# ======================================================
# FACE RECOGNITION (APP)
# ======================================================
@app.route("/api/recognize-face", methods=["POST"])
def recognize_face():

    try:
        data = request.get_json()

        if not data or "image" not in data:
            return jsonify({
                "status": "ERROR",
                "message": "No image received"
            }), 400

        # Decode base64 image
        try:
            image_data = base64.b64decode(data["image"])

            image_np = np.array(
                Image.open(io.BytesIO(image_data)).convert("RGB")
            )

        except Exception:
            return jsonify({
                "status": "ERROR",
                "message": "Invalid image"
            }), 400

        # Resize image
        small_img = cv2.resize(
            image_np,
            (0, 0),
            fx=0.5,
            fy=0.5
        )

        # IMPORTANT
        rgb_small = cv2.cvtColor(small_img, cv2.COLOR_BGR2RGB)

        # SIMPLE ENCODING METHOD
        encodings = face_recognition.face_encodings(rgb_small)

        if len(encodings) == 0:
            return jsonify({
                "status": "DENIED",
                "message": "No face detected"
            })

        if len(encodings) > 1:
            return jsonify({
                "status": "DENIED",
                "message": "Multiple faces detected"
            })

        input_embedding = encodings[0]

        # ======================================================
        # MATCH FACE WITH DATABASE
        # ======================================================
        students = students_collection.find()

        best_match = None
        min_distance = 1.0

        for student in students:

            db_embedding = student.get("face_embedding")

            if not db_embedding:
                continue

            db_embedding = np.array(db_embedding)

            distance = face_recognition.face_distance(
                [db_embedding],
                input_embedding
            )[0]

            if distance < min_distance:
                min_distance = distance
                best_match = student

        # MATCH THRESHOLD
        if best_match is None or min_distance > 0.5:
            return jsonify({
                "status": "DENIED",
                "message": "Unknown person"
            })

        student = best_match

        # ======================================================
        # ENTRY / EXIT LOGIC
        # ======================================================
        last_log = entry_exit_collection.find_one(
            {"roll": student["roll_no"]},
            sort=[("_id", -1)]
        )

        now = datetime.utcnow() + timedelta(hours=5, minutes=30)

        last_action_time = None

        # LAST ACTION WAS EXIT → NOW ENTRY
        if last_log and last_log.get("inTime") is None:

            action = "ENTRY"

            last_action_time = datetime.strptime(
                last_log["outTime"],
                "%Y-%m-%d %H:%M:%S"
            )

        else:

            action = "EXIT"

            if last_log and last_log.get("inTime"):

                last_action_time = datetime.strptime(
                    last_log["inTime"],
                    "%Y-%m-%d %H:%M:%S"
                )

        # COOLDOWN
        if last_action_time:

            seconds = (now - last_action_time).total_seconds()

            if seconds < 60:
                return jsonify({
                    "status": "BLOCKED",
                    "message": f"Dear {student['name']}, please wait 1 minute before next scan"
                })

        return jsonify({
    "status": "SUCCESS",
    "action": action,

    "student": {
        "roll_no": student["roll_no"],
        "name": student["name"],
        "hostel": student.get("hostel"),
        "room": student.get("room"),
        "photo": student.get("face_images", [None])[0]
    },

    "last_exit": {
        "outTime": last_log.get("outTime") if last_log else None,
        "purpose": last_log.get("purpose") if last_log else None
    }
})

    except Exception as e:

        return jsonify({
            "status": "ERROR",
            "message": str(e)
        }), 500

# ======================================================
# CONFIRM ENTRY / EXIT
# ======================================================
@app.route("/api/confirm-entry-exit", methods=["POST"])
def confirm_entry_exit():

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "status": "ERROR",
                "message": "Invalid request"
            }), 400

        student = data.get("student")
        action = data.get("action")
        purpose = data.get("purpose", "")

        current_time = (
            datetime.utcnow() + timedelta(hours=5, minutes=30)
        ).strftime("%Y-%m-%d %H:%M:%S")

        # VACATION VALIDATION
        if action == "EXIT" and purpose.upper() == "VACATION":

            vacation = vacation_collection.find_one(
                {
                    "roll_no": student["roll_no"],
                    "hostel_status": "Approved",
                    "gate_status": "Approved",
                     "vacation_status": "NOT_STARTED"
                },
                sort=[("_id", -1)]
            )

            if not vacation:
                return jsonify({
                    "status": "DENIED",
                    "message": "Vacation not approved"
                }), 403

        # EXIT
        if action == "EXIT":

            entry_exit_collection.insert_one({
                "roll": student["roll_no"],
                "hostel": student.get("hostel"),
                "purpose": purpose,
                "outTime": current_time,
                "inTime": None
            })

            if purpose.upper() == "VACATION":

             vacation_collection.update_one(
        {
            "_id": vacation["_id"]
        },
        {
            "$set": {
                "vacation_status": "ACTIVE"
            }
        }
    )

            return jsonify({
                "status": "OK",
                "action": "EXIT",
                "time": current_time,
                 "message":
        f"Vacation departure recorded successfully. "
        f"Have a safe journey, {student['name']}."
            })
            
            
            
        # ENTRY

        last_exit = entry_exit_collection.find_one(
            {
                "roll": student["roll_no"],
                "inTime": None
            }
        )

        entry_exit_collection.update_one(
            {
                "roll": student["roll_no"],
                "inTime": None
            },
            {
                "$set": {
                    "inTime": current_time
                }
            }
        )
        
        
        
        message = f"Welcome back, {student['name']}."
        

        active_vacation = vacation_collection.find_one(
            {
                "roll_no": student["roll_no"],
                "vacation_status": "ACTIVE"
            }
        )
    

        if (
            active_vacation and
            last_exit and
            last_exit.get("purpose", "").upper() == "VACATION"
        ):

            vacation_collection.update_one(
                {
                    "_id": active_vacation["_id"]
                },
                {
                    "$set": {
                        "vacation_status": "COMPLETED"
                    }
                }
            )

            message = (
                f"Welcome back, {student['name']}.\n\n"
                f"Your vacation has been successfully completed and "
                f"your return has been recorded on {current_time}.\n\n"
                f"Have a pleasant stay in the hostel."
            )
   
            
            
        return jsonify({
            "status": "OK",
            "action": "ENTRY",
            "time": current_time,
            "message": message
        })

    except Exception as e:
        traceback.print_exc() 

        return jsonify({
            "status": "ERROR",
            "message": str(e)
        }), 500
        
        
        
        
        # ======================================================
# LIVENESS CHECK - BLINK DETECTION
# ======================================================

def calculate_eye_aspect_ratio(eye):

    # eye contains 6 facial landmark points

    p1 = np.array(eye[0])
    p2 = np.array(eye[1])
    p3 = np.array(eye[2])
    p4 = np.array(eye[3])
    p5 = np.array(eye[4])
    p6 = np.array(eye[5])

    # Vertical distances
    vertical_1 = np.linalg.norm(p2 - p6)
    vertical_2 = np.linalg.norm(p3 - p5)

    # Horizontal distance
    horizontal = np.linalg.norm(p1 - p4)

    if horizontal == 0:
        return 0

    ear = (
        vertical_1 + vertical_2
    ) / (2.0 * horizontal)

    return ear


@app.route("/api/liveness-check", methods=["POST"])
def liveness_check():

    try:

        data = request.get_json()

        if not data or "images" not in data:
            return jsonify({
                "status": "ERROR",
                "message": "No images received"
            }), 400

        images = data["images"]

        if not isinstance(images, list) or len(images) < 3:
            return jsonify({
                "status": "ERROR",
                "message": "At least 3 images are required"
            }), 400

        ear_values = []

        # --------------------------------------------------
        # PROCESS EACH FRAME
        # --------------------------------------------------

        for image_base64 in images:

            try:

                image_data = base64.b64decode(
                    image_base64
                )

                image_np = np.array(
                    Image.open(
                        io.BytesIO(image_data)
                    ).convert("RGB")
                )

            except Exception:

                continue

            # Resize
            small_img = cv2.resize(
                image_np,
                (0, 0),
                fx=0.5,
                fy=0.5
            )

            # Convert
            rgb_small = cv2.cvtColor(
                small_img,
                cv2.COLOR_BGR2RGB
            )

            # Detect facial landmarks
            landmarks = face_recognition.face_landmarks(
                rgb_small
            )

            # We need exactly one face
            if len(landmarks) != 1:
                continue

            face = landmarks[0]

            if (
                "left_eye" not in face
                or "right_eye" not in face
            ):
                continue

            left_eye = face["left_eye"]
            right_eye = face["right_eye"]

            left_ear = calculate_eye_aspect_ratio(
                left_eye
            )

            right_ear = calculate_eye_aspect_ratio(
                right_eye
            )

            average_ear = (
                left_ear + right_ear
            ) / 2.0

            ear_values.append(
                average_ear
            )

        # --------------------------------------------------
        # CHECK WHETHER ENOUGH VALID FRAMES EXIST
        # --------------------------------------------------

        if len(ear_values) < 3:

            return jsonify({
                "status": "LIVENESS_FAILED",
                "message":
                    "Face could not be detected clearly. "
                    "Please look at the camera and try again."
            })

        # --------------------------------------------------
        # BLINK DETECTION
        # --------------------------------------------------

        OPEN_THRESHOLD = 0.22
        CLOSED_THRESHOLD = 0.18

        eyes_were_open = False
        blink_detected = False

        for ear in ear_values:

            # Eyes open
            if ear >= OPEN_THRESHOLD:
                eyes_were_open = True

            # Eyes closed after being open
            elif (
                eyes_were_open
                and ear <= CLOSED_THRESHOLD
            ):
                blink_detected = True

            # Eyes open again after closing
            if (
                blink_detected
                and ear >= OPEN_THRESHOLD
            ):
                break

        # --------------------------------------------------
        # RESULT
        # --------------------------------------------------

        if blink_detected:

            return jsonify({
                "status": "LIVENESS_SUCCESS",
                "message": "Liveness verified successfully",
                "blink_detected": True
            })

        return jsonify({
            "status": "LIVENESS_FAILED",
            "message":
                "Blink was not detected. "
                "Please blink naturally and try again.",
            "blink_detected": False
        })

    except Exception as e:

        traceback.print_exc()

        return jsonify({
            "status": "ERROR",
            "message": str(e)
        }), 500
        
        
        
# ======================================================
# NIGHT ATTENDANCE
# ======================================================
@app.route("/api/mark-night-attendance", methods=["POST"])
def mark_night_attendance():

    try:
        data = request.get_json()

        # --------------------------------------------------
        # VALIDATE REQUEST
        # --------------------------------------------------
        if not data:
            return jsonify({
                "status": "ERROR",
                "message": "Invalid request."
            }), 400

        student = data.get("student")

        if not student:
            return jsonify({
                "status": "ERROR",
                "message": "Student information is missing."
            }), 400

        roll_no = student.get("roll_no")
        student_name = student.get("name", "Student")

        if not roll_no:
            return jsonify({
                "status": "ERROR",
                "message": "Roll number is missing."
            }), 400

        # --------------------------------------------------
        # CURRENT IST TIME
        # --------------------------------------------------
        now = datetime.utcnow() + timedelta(hours=5, minutes=30)

        # Database date format
        current_date = now.strftime("%Y-%m-%d")

        # Display date format
        display_date = now.strftime("%d/%m/%Y")

        # Current time
        current_time = now.strftime("%H:%M:%S")
        
        
        # NIGHT ATTENDANCE TIME
        current = now.hour * 60 + now.minute

        START = 22 * 60
        END = 23 * 60 + 59

        if not START <= current <= END:
            return jsonify({
        "status": "TIME_RESTRICTED",
        "message": "Night attendance can be marked only between 22:00 and 23:59"
    }), 403

        # --------------------------------------------------
        # CHECK DUPLICATE ATTENDANCE
        # --------------------------------------------------
        existing_attendance = night_attendance_collection.find_one({
            "roll_no": roll_no,
            "datetime": {
        "$regex": f"^{current_date}"
    }
        })

        if existing_attendance:

            previous_time = existing_attendance.get("time", current_time)

            return jsonify({
                "status": "ALREADY_MARKED",
                "message": (
                    f"{student_name}, your attendance for "
                    f"{display_date} has already been marked successfully "
                    f"on {previous_time}. "
                    f"Please do not try again for duplicate entries."
                ),
                "date": display_date,
                "time": previous_time
            }), 409

        # --------------------------------------------------
        # SAVE ATTENDANCE
        # --------------------------------------------------
        attendance = {
            "roll_no": roll_no,
            "datetime": now.strftime("%Y-%m-%d %H:%M:%S")
        }

        night_attendance_collection.insert_one(attendance)

        # --------------------------------------------------
        # SUCCESS RESPONSE
        # --------------------------------------------------
        return jsonify({
            "status": "SUCCESS",
            "message": (
                f"{student_name}, your attendance for "
                f"{display_date} has been marked successfully "
                f"on {current_time}."
            ),
            "date": display_date,
            "time": current_time
        }), 200

    except Exception as e:

        traceback.print_exc()

        return jsonify({
            "status": "ERROR",
            "message": "Something went wrong while marking attendance."
        }), 500
        
        
@app.route("/pending-gate-vacations")
def pending_gate_vacations():

    vacations = list(
        vacation_collection.find(
            {
                "gate_status": "Pending"
            },
            {
                "_id": 0
            }
        )
    )

    return jsonify(vacations)

@app.route("/check-vacation/<roll_no>")
def check_vacation(roll_no):

    student = students_collection.find_one(
        {"roll_no": roll_no}
    )

    student_name = (
        student["name"]
        if student else roll_no
    )

    # GET LATEST VACATION APPLICATION ONLY
    vacation = vacation_collection.find_one(
        {
            "roll_no": roll_no
        },
        sort=[("_id", -1)]
    )

    # NO VACATION RECORD EXISTS
    if not vacation:

        return jsonify({
            "allowed": False,
            "status": "NO_ACTIVE_VACATION",
            "message":
                f"Dear {student_name}, you currently have no active vacation application."
        })

    # LATEST VACATION ALREADY COMPLETED
    if vacation.get("vacation_status") == "COMPLETED":

        return jsonify({
            "allowed": False,
            "status": "NO_ACTIVE_VACATION",
            "message":
                f"Dear {student_name}, you currently have no active vacation application."
        })

    # HOSTEL PENDING
    if vacation.get("hostel_status") == "Pending":

        return jsonify({
            "allowed": False,
            "status": "HOSTEL_PENDING",
            "message":
                f"Dear {student_name}, your applied vacation starts on "
                f"{vacation.get('leave_date')}, still pending by Hostel Office.\n\n"
                f"Please contact the Hostel Office."
        })

    # HOSTEL DENIED
    if vacation.get("hostel_status") == "Denied":

        denial_reason = vacation.get(
            "hostel_denial_reason",
            "No reason provided"
        )

        return jsonify({
            "allowed": False,
            "status": "HOSTEL_DENIED",
            "message":
                f"Dear {student_name}, your applied vacation starts on "
                f"{vacation.get('leave_date')}, Denied by Hostel Office "
                f"for this reason ({denial_reason}).\n\n"
                f"Please contact the Hostel Office."
        })

    # GATE NOT REQUESTED
    if vacation.get("gate_status") == "Not Requested":

        vacation_collection.update_one(
            {
                "_id": vacation["_id"]
            },
            {
                "$set": {
                    "gate_status": "Pending"
                }
            }
        )

        return jsonify({
            "allowed": True,
            "return_date": vacation.get("return_date"),
            "status": "WAITING_FOR_GATE_APPROVAL"
        })

    # GATE PENDING
    if vacation.get("gate_status") == "Pending":

        return jsonify({
            "allowed": True,
            "return_date": vacation.get("return_date"),
            "status": "WAITING_FOR_GATE_APPROVAL"
        })

    # GATE DENIED
    if vacation.get("gate_status") == "Denied":

        return jsonify({
            "allowed": False,
            "status": "DENIED_BY_GATE",
            "message":
                f"Dear {student_name}, your applied vacation starts on "
                f"{vacation.get('leave_date')}, Denied by Main Gate Security Office.\n\n"
                f"Please contact the Main Gate Security Office or Hostel Office."
        })

    # GATE APPROVED
    if vacation.get("gate_status") == "Approved":

        return jsonify({
            "allowed": True,
            "status": "APPROVED_BY_GATE",
            "return_date": vacation.get("return_date")
        })

    return jsonify({
        "allowed": True,
        "return_date": vacation.get("return_date"),
        "gate_status": vacation.get("gate_status")
    })

# ======================================================
# RUN SERVER
# ======================================================
if __name__ == "__main__":

    port = int(os.environ.get("PORT", 8080))

    app.run(
        host="0.0.0.0",
        port=port
    )