import axios from "axios";
import { CameraView, Camera } from "expo-camera";

import {
  useFaceDetection,
} from "@infinitered/react-native-mlkit-face-detection";

import * as Location from "expo-location";

import { useEffect, useRef, useState } from "react";
import {
  Text,
  View,
  Modal,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
  Easing,
    ScrollView,
} from "react-native";


import { Picker } from "@react-native-picker/picker";
import { Audio } from "expo-av";
import { COLORS } from "../../theme";

import * as Linking from "expo-linking";

import API_BASE from "../../config";

import { startHostelGeofence } from "../../services/geofencing";
import {
  HOSTEL_GEOFENCE,
  CAMPUS_GEOFENCE,
} from "../../config/geofence";



export default function HomeScreen() {
  const faceDetector = useFaceDetection();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
const [locationLoading, setLocationLoading] = useState(false);


const [distanceFromTestPoint, setDistanceFromTestPoint] =
  useState<number | null>(null);

const [hostelStatus, setHostelStatus] =
  useState<"INSIDE" | "OUTSIDE" | "UNKNOWN">("UNKNOWN");

const [campusStatus, setCampusStatus] =
  useState<"INSIDE" | "OUTSIDE" | "UNKNOWN">("UNKNOWN");




  const cameraRef = useRef<any>(null);

  const [cameraActive, setCameraActive] = useState(false);

  const [nightAttendanceMode, setNightAttendanceMode] = useState(false);


  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showAttendanceSuccessModal, setShowAttendanceSuccessModal] = useState(false);
const [attendanceData, setAttendanceData] = useState<any>(null);

  const [studentData, setStudentData] = useState<any>(null);
  const [purpose, setPurpose] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [savedData, setSavedData] = useState<any>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [serverStatus, setServerStatus] = useState("checking");


// ======================================================
// LIVENESS CHECK
// ======================================================

type LivenessAction =
  | "EYE_CLOSE"
  | "EYE_OPEN"
  | "LEFT"
  | "RIGHT"
  | "SMILE";

const [livenessChecking, setLivenessChecking] =
  useState(false);

const [livenessMessage, setLivenessMessage] =
  useState("Tap to start liveness verification");

const [livenessSequence, setLivenessSequence] =
  useState<LivenessAction[]>([]);

const [currentLivenessIndex, setCurrentLivenessIndex] =
  useState(0);

const [livenessVerifiedCount, setLivenessVerifiedCount] =
  useState(0);

const livenessRunningRef = useRef(false);

const eyesClosedRef = useRef(false);

const livenessTimeoutRef =
  useRef<ReturnType<typeof setTimeout> | null>(null);



  const [showWaitingModal, setShowWaitingModal] = useState(false);
const [waitingMessage, setWaitingMessage] = useState("");
const [pollingActive, setPollingActive] = useState(false);
const [gateApproved, setGateApproved] = useState(false);
const [gateVerified, setGateVerified] = useState(false);

  const [alarmSound, setAlarmSound] = useState<any>(null);

  const scanAnimation = useRef(new Animated.Value(0)).current;

  const animation = useRef<any>(null);

  // CAMERA PERMISSION
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);



  useEffect(() => {
  Animated.loop(
    Animated.sequence([
      Animated.timing(scanAnimation, {
        toValue: 1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(scanAnimation, {
        toValue: 0,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ])
  ).start();
}, []);

useEffect(() => {

  if (!cameraActive) {

    scanAnimation.setValue(0);

    animation.current = Animated.loop(
      Animated.timing(scanAnimation,{
        toValue:1,
        duration:3000,
        useNativeDriver:true,
      })
    );

    animation.current.start();

  }

  return () => {

    animation.current?.stop();

  };

},[cameraActive]);


const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371000; // Earth radius in meters

  const dLat =
    ((lat2 - lat1) * Math.PI) / 180;

  const dLon =
    ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c =
    2 * Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;
};



  // SERVER CHECK FUNCTION
  const checkServer = async () => {
    if (serverStatus === "checking") return;

    try {
      setServerStatus("checking");
      await axios.get(`${API_BASE}`, { timeout: 5000 });
      setServerStatus("online");
    } catch {
      setServerStatus("offline");
    }
  };


const shuffleLivenessActions = (): LivenessAction[] => {

  // Randomly choose ONLY ONE head-turn direction
  const headTurn: LivenessAction =
    Math.random() < 0.5
      ? "LEFT"
      : "RIGHT";

  // Exactly 4 tasks
  const actions: LivenessAction[] = [
    "EYE_CLOSE",
    "EYE_OPEN",
    "SMILE",
    headTurn,
  ];

  // Shuffle the 4 tasks
  return [...actions].sort(
    () => Math.random() - 0.5
  );
};


const getLivenessInstruction = (
  action: LivenessAction
) => {

  switch (action) {

    case "EYE_CLOSE":
      return "Close your eyes";

    case "EYE_OPEN":
      return "Open your eyes";

    case "LEFT":
      return "Turn your head LEFT";

    case "RIGHT":
      return "Turn your head RIGHT";

    case "SMILE":
      return "Smile";

    default:
      return "Look at the camera";
  }
};



const getCurrentLocation = async () => {
  try {
    setLocationLoading(true);

    const { status } =
      await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Location Permission",
        "Please allow location permission."
      );
      return;
    }

    const currentLocation =
      await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

    setLocation(currentLocation);
const currentLat =
  currentLocation.coords.latitude;

const currentLon =
  currentLocation.coords.longitude;

const accuracy =
  currentLocation.coords.accuracy;

console.log("CURRENT LAT:", currentLat);
console.log("CURRENT LON:", currentLon);
console.log("GPS ACCURACY:", accuracy, "meters");

const hostelDistance = calculateDistance(
  HOSTEL_GEOFENCE.latitude,
  HOSTEL_GEOFENCE.longitude,
  currentLat,
  currentLon
);

const campusDistance = calculateDistance(
  CAMPUS_GEOFENCE.latitude,
  CAMPUS_GEOFENCE.longitude,
  currentLat,
  currentLon
);


setHostelStatus(
  hostelDistance <= HOSTEL_GEOFENCE.radius
    ? "INSIDE"
    : "OUTSIDE"
);

setCampusStatus(
  campusDistance <= CAMPUS_GEOFENCE.radius
    ? "INSIDE"
    : "OUTSIDE"
);

console.log(
  "HOSTEL DISTANCE:",
  hostelDistance.toFixed(2),
  "meters"
);

console.log(
  "HOSTEL STATUS:",
  hostelDistance <= HOSTEL_GEOFENCE.radius
    ? "INSIDE"
    : "OUTSIDE"
);

console.log(
  "CAMPUS DISTANCE:",
  campusDistance.toFixed(2),
  "meters"
);

console.log(
  "CAMPUS STATUS:",
  campusDistance <= CAMPUS_GEOFENCE.radius
    ? "INSIDE"
    : "OUTSIDE"
);

  } catch (error) {

    console.log(
      "Location Error:",
      error
    );

    Alert.alert(
      "Location Error",
      "Could not get your location."
    );

  } finally {
    setLocationLoading(false);
  }
};

  // AUTO CHECK
  useEffect(() => {
    const init = async () => {
      try {
        await axios.get(`${API_BASE}`, { timeout: 5000 });
        setServerStatus("online");
      } catch {
        setServerStatus("offline");
      }
    };

    init();
    const interval = setInterval(checkServer, 10000);
    return () => clearInterval(interval);
  }, []);





  

const takePhoto = async () => {

  // ==================================================
  // BASIC CAMERA CHECK
  // ==================================================

  if (
    !cameraRef.current ||
    isScanning ||
    livenessChecking ||
    livenessRunningRef.current
  ) {
    return;
  }

  // ==================================================
  // START LIVENESS
  // ==================================================

  livenessRunningRef.current = true;

  setIsScanning(true);
  setLivenessChecking(true);

  const sequence = shuffleLivenessActions();

  setLivenessSequence(sequence);
  setCurrentLivenessIndex(0);
  setLivenessVerifiedCount(0);

  console.log("=================================");
  console.log("LIVENESS VERIFICATION STARTED");
  console.log("SEQUENCE:", sequence);
  console.log("=================================");

  try {

    // ==================================================
    // CHECK EACH LIVENESS ACTION
    // ==================================================

    for (let step = 0; step < sequence.length; step++) {

      const action = sequence[step];

      setCurrentLivenessIndex(step);

      setLivenessMessage(
        getLivenessInstruction(action)
      );

      console.log(
        "CURRENT LIVENESS ACTION:",
        action
      );

      let actionVerified = false;

      // ------------------------------------------------
      // Each action gets maximum 6 seconds
      // ------------------------------------------------

      const actionStartTime = Date.now();

      // ------------------------------------------------
      // Reset blink state for this action
      // ------------------------------------------------

      eyesClosedRef.current = false;

      // ------------------------------------------------
      // Keep checking camera frames
      // ------------------------------------------------

      while (
        !actionVerified &&
        Date.now() - actionStartTime < 6000
      ) {

        if (!cameraRef.current) {
          throw new Error("Camera unavailable");
        }

        // ==============================================
        // CAPTURE TEMPORARY FRAME
        // ==============================================

        const frame =
          await cameraRef.current.takePictureAsync({
            quality: 0.35,
            skipProcessing: true,
          });

        if (!frame?.uri) {

          console.log(
            "LIVENESS: FRAME FAILED"
          );

          continue;
        }

        // ==============================================
        // ML KIT FACE DETECTION
        // ==============================================

        const detectionResult =
          await faceDetector.detectFaces(
            frame.uri
          );

        if (!detectionResult) {

          setLivenessMessage(
            "Face detection failed"
          );

          continue;
        }

        const detectedFaces =
          detectionResult.faces;

        console.log(
          "LIVENESS FACES:",
          detectedFaces.length
        );

        // ==============================================
        // NO FACE
        // ==============================================

        if (detectedFaces.length === 0) {

          setLivenessMessage(
            getLivenessInstruction(action)
          );

          continue;
        }

        // ==============================================
        // MULTIPLE FACES
        // ==============================================

        if (detectedFaces.length > 1) {

          setLivenessMessage(
            "Only one face should be visible"
          );

          Alert.alert(
            "Multiple Faces",
            "Only one person should be visible during verification."
          );

          return;
        }

        // ==============================================
        // SINGLE FACE
        // ==============================================

        const face = detectedFaces[0];

        // =================================================
        // FACE PROPERTIES
        // =================================================

        const leftEye =
          face.leftEyeOpenProbability;

        const rightEye =
          face.rightEyeOpenProbability;

        const smilingProbability =
          face.smilingProbability;

        const headEulerAngleY =
          face.headEulerAngleY;

        console.log(
          "EYE:",
          leftEye,
          rightEye
        );

        console.log(
          "SMILE:",
          smilingProbability
        );

        console.log(
          "HEAD Y:",
          headEulerAngleY
        );

// =================================================
// EYE CLOSE
// =================================================

if (action === "EYE_CLOSE") {

  if (
    leftEye != null &&
    rightEye != null
  ) {

    const eyesClosed =
      leftEye < 0.30 &&
      rightEye < 0.30;

    if (eyesClosed) {

      actionVerified = true;

      console.log(
        "EYE CLOSE VERIFIED"
      );
    }
  }
}

// =================================================
// EYE OPEN
// =================================================

else if (action === "EYE_OPEN") {

  if (
    leftEye != null &&
    rightEye != null
  ) {

    const eyesOpen =
      leftEye > 0.80 &&
      rightEye > 0.80;

    if (eyesOpen) {

      actionVerified = true;

      console.log(
        "EYE OPEN VERIFIED"
      );
    }
  }
}

        // =================================================
        // TURN LEFT
        // =================================================

 else if (action === "LEFT") {

  if (headEulerAngleY != null) {

    console.log(
      "LEFT HEAD ANGLE:",
      headEulerAngleY
    );

    if (headEulerAngleY > 15) {

      actionVerified = true;

      console.log(
        "LEFT TURN VERIFIED"
      );
    }
  }
}

        // =================================================
        // TURN RIGHT
        // =================================================

       else if (action === "RIGHT") {

  if (headEulerAngleY != null) {

    console.log(
      "RIGHT HEAD ANGLE:",
      headEulerAngleY
    );

    if (headEulerAngleY < -15) {

      actionVerified = true;

      console.log(
        "RIGHT TURN VERIFIED"
      );
    }
  }
}

        // =================================================
        // SMILE
        // =================================================

        else if (action === "SMILE") {

          if (
            smilingProbability != null &&
            smilingProbability > 0.65
          ) {

            actionVerified = true;

            console.log(
              "SMILE VERIFIED"
            );
          }
        }

        // =================================================
        // SMALL DELAY
        // Prevent camera/ML overload
        // =================================================

        await new Promise(
          resolve => setTimeout(resolve, 150)
        );
      }

      // ==================================================
      // ACTION FAILED
      // ==================================================

      if (!actionVerified) {

        console.log(
          "LIVENESS ACTION FAILED:",
          action
        );

        setLivenessMessage(
          `Failed: ${getLivenessInstruction(action)}`
        );

        Alert.alert(
          "Liveness Verification Failed",
          `Please perform the requested action correctly:\n\n${getLivenessInstruction(action)}`
        );

        return;
      }

      // ==================================================
      // ACTION SUCCESS
      // ==================================================

      setLivenessVerifiedCount(
        step + 1
      );

      console.log(
        "LIVENESS ACTION VERIFIED:",
        action
      );

      setLivenessMessage(
        `${getLivenessInstruction(action)} ✓`
      );

      // Small pause before next action
      await new Promise(
        resolve => setTimeout(resolve, 500)
      );
    }

    // ==================================================
    // ALL ACTIONS VERIFIED
    // ==================================================

    console.log(
      "================================="
    );

    console.log(
      "ALL LIVENESS ACTIONS VERIFIED"
    );

    console.log(
      "================================="
    );

    setLivenessMessage(
      "Liveness verified ✓"
    );

    // Give UI time to display success
    await new Promise(
      resolve => setTimeout(resolve, 700)
    );

    // ==================================================
    // FINAL PHOTO
    // ==================================================

    console.log(
      "TAKING FINAL PHOTO"
    );

    if (!cameraRef.current) {
      throw new Error(
        "Camera unavailable"
      );
    }

    const finalPhoto =
      await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
      });

    if (!finalPhoto?.uri) {

      Alert.alert(
        "Camera Error",
        "Could not capture final photo."
      );

      return;
    }

    // ==================================================
    // SAVE PHOTO URI
    // ==================================================

    setPhotoUri(
      finalPhoto.uri
    );

    console.log(
      "FINAL PHOTO CAPTURED"
    );

    // ==================================================
    // FINAL ML KIT FACE CHECK
    // ==================================================

    const finalDetection =
      await faceDetector.detectFaces(
        finalPhoto.uri
      );

    console.log(
      "FINAL FACE DETECTION:",
      finalDetection
    );

    if (
      !finalDetection ||
      finalDetection.faces.length === 0
    ) {

      Alert.alert(
        "Face Not Detected",
        "Please position your face clearly inside the camera."
      );

      return;
    }

    if (
      finalDetection.faces.length > 1
    ) {

      Alert.alert(
        "Multiple Faces",
        "Only one person should be visible during verification."
      );

      return;
    }

    console.log(
      "FINAL FACE VERIFIED"
    );

    // ==================================================
    // SEND FINAL IMAGE TO FLASK
    // ==================================================

    console.log(
      "SENDING FINAL PHOTO TO FLASK"
    );

    const response = await axios.post(
      `${API_BASE}/api/recognize-face`,
      {
        image: finalPhoto.base64,
      },
      {
        timeout: 15000,
      }
    );

    const data =
      response.data;

    console.log(
      "FACE RECOGNITION RESPONSE:",
      data
    );

    // ==================================================
    // BLOCKED STUDENT
    // ==================================================

    if (
      data.status === "BLOCKED"
    ) {

      Alert.alert(
        "Blocked",
        data.message
      );

      return;
    }

    // ==================================================
    // FACE NOT RECOGNIZED
    // ==================================================

    if (
      data.status !== "SUCCESS"
    ) {

      Alert.alert(
        "Verification Failed",
        data.message
      );

      return;
    }

    // ==================================================
    // STUDENT IDENTIFIED
    // ==================================================

    setStudentData(data);

    // ==================================================
    // NIGHT ATTENDANCE
    // ==================================================

    if (nightAttendanceMode) {

      setCameraActive(false);

      setTimeout(() => {

        setShowAttendanceModal(true);

      }, 300);

      return;
    }

    // ==================================================
    // NORMAL ENTRY / EXIT
    // ==================================================

    setCameraActive(false);

    setShowModal(true);

  } catch (error: any) {

    console.log(
      "LIVENESS / FACE RECOGNITION ERROR:",
      error
    );

    console.log(
      "ERROR RESPONSE:",
      error?.response?.data
    );

    Alert.alert(
      "Error",
      "Face verification failed."
    );

  } finally {

    setIsScanning(false);

    setLivenessChecking(false);

    livenessRunningRef.current = false;

    eyesClosedRef.current = false;
  }
};




const markNightAttendance = async () => {
  if (!studentData || isSubmitting) return;

  setIsSubmitting(true);

  try {
    const response = await axios.post(
      `${API_BASE}/api/mark-night-attendance`,
      {
        student: studentData.student,
      },
      { timeout: 15000 }
    );

    const data = response.data;

    if (data.status === "SUCCESS") {

      Alert.alert(
        "Attendance Successful",
        data.message,
        [
          {
            text: "OK",
            onPress: () => {
              setShowAttendanceModal(false);
              setStudentData(null);
              setPhotoUri(null);
              setNightAttendanceMode(false);
              setCameraActive(false);
            },
          },
        ]
      );

      return;
    }


    if (data.status === "TIME_RESTRICTED") {
  Alert.alert(
    "Night Attendance Closed",
    data.message
  );

  return;
}

    if (data.status === "ALREADY_MARKED") {

      Alert.alert(
        "Already Marked",
        data.message,
        [
          {
            text: "OK",
            onPress: () => {
              setShowAttendanceModal(false);
              setStudentData(null);
              setPhotoUri(null);
              setNightAttendanceMode(false);
              setCameraActive(false);
            },
          },
        ]
      );

      return;
    }

    Alert.alert(
      "Attendance Failed",
      data.message || "Could not mark night attendance."
    );

  } catch (error: any) {

    console.log(
      "NIGHT ATTENDANCE ERROR:",
      error.response?.data || error.message
    );

    Alert.alert(
      "Error",
      error.response?.data?.message ||
      "Failed to mark night attendance."
    );

  } finally {
    setIsSubmitting(false);
  }
};

const playAlarm = async () => {
  try {

    if (alarmSound) {
      await alarmSound.stopAsync();
      await alarmSound.unloadAsync();
    }

    const { sound } = await Audio.Sound.createAsync(
      require("../../assets/images/alarm.wav")
    );

    setAlarmSound(sound);

    await sound.playAsync();

  } catch (e) {
    console.log("Alarm Error:", e);
  }
};

const stopAlarm = async () => {
  try {
    if (alarmSound) {
      await alarmSound.stopAsync();
      await alarmSound.unloadAsync();
      setAlarmSound(null);
    }
  } catch (e) {
    console.log("Stop Alarm Error:", e);
  }
};

const startPollingForGateApproval = async (
  rollNo: string
) => {

  setPollingActive(true);

  const startTime = Date.now();

const interval = setInterval(async () => {

  try {

    const response = await axios.get(
      `${API_BASE}/check-vacation/${rollNo}`
    );

    const vacationData = response.data;
   

    if (Date.now() - startTime > 120000) {

  clearInterval(interval);

  setPollingActive(false);

  setShowWaitingModal(false);

  Alert.alert(
    "Timeout",
    "No response received from Gate Guard. Please contact the Main Gate Office."
  );

  return;
}

if (
  vacationData.status ===
  "WAITING_FOR_GATE_APPROVAL"
) {
  return;
}


if (
  vacationData.status ===
  "APPROVED_BY_GATE"
) {


  setGateVerified(true);

setGateApproved(true);


  clearInterval(interval);

  setPollingActive(false);

 setShowWaitingModal(false);

setGateVerified(true);
setGateApproved(true);
  return;
}


if (
  vacationData.status ===
  "DENIED_BY_GATE"
) {

  clearInterval(interval);

  setPollingActive(false);

  setShowWaitingModal(false);

  await playAlarm();

  Alert.alert(
    "Request Denied",
    "Your vacation request was denied by the Gate Guard.",
    [
      {
        text: "OK",
        onPress: async () => {
          await stopAlarm();
        },
      },
    ]
  );

  return;
}

  } catch (error) {
    console.log("Polling Error:", error);
  }

}, 5000);

};

useEffect(() => {
  return () => {
    if (alarmSound) {
      alarmSound.unloadAsync();
    }
  };
}, [alarmSound]);


const saveApprovedVacationExit = async () => {

  try {

    const response = await axios.post(
      `${API_BASE}/api/confirm-entry-exit`,
      {
        student: studentData.student,
        action: studentData.action,
        purpose: purpose,
      },
      { timeout: 15000 }
    );

    const timeNow = new Date().toLocaleString();

    setSavedData({
      ...studentData.student,
      action: studentData.action,
      purpose: purpose,
      outTime: timeNow,
      inTime: null,
      message: response.data.message,
    });

    setShowSuccessModal(true);
    setPurpose("");
setGateApproved(false);
setShowModal(false);



  }catch (error: any) {

    console.log("ENTRY/EXIT ERROR");

    console.log(error.response?.data);

    console.log(error.response?.status);

    console.log(error.message);

    Alert.alert(
        "Error",
        error.response?.data?.message || error.message
    );
}

};


  const confirmEntryExit = async () => {

    
    
    if (isSubmitting || !studentData) return;

    if (studentData.action === "EXIT" && !purpose) {
      Alert.alert("Select Purpose", "Please select purpose");
      return;
    }
    

   if (
  studentData.action === "EXIT" &&
  purpose === "Vacation" &&
  !gateVerified
) {

  const vacationCheck =
    await axios.get(
      `${API_BASE}/check-vacation/${studentData.student.roll_no}`
    );

  const vacationData =
    vacationCheck.data;

  if (!vacationData.allowed) {

    Alert.alert(
      "Vacation Denied",
      vacationData.message ||
      "Hostel approval not found"
    );

    return;
  }

 if (
  vacationData.status ===
  "WAITING_FOR_GATE_APPROVAL"
) {

  setShowWaitingModal(true);

  startPollingForGateApproval(
    studentData.student.roll_no
  );

  return;
}

  if (
    vacationData.gate_status !==
    "Approved"
  ) {

    Alert.alert(
      "Waiting",
      "Waiting for gate guard approval"
    );

    return;
  }
}

    setIsSubmitting(true);

    try {
   const response = await axios.post(
  `${API_BASE}/api/confirm-entry-exit`,
  {
    student: studentData.student,
    action: studentData.action,
    purpose: studentData.action === "EXIT" ? purpose : null,
  },
  { timeout: 15000 }
);

const data = response.data;


if (data.status === "DENIED") {
  Alert.alert("Vacation Denied", data.message);
  return;
}
      const timeNow = new Date().toLocaleString();

      setSavedData({
        ...studentData.student,
        action: studentData.action,
          message: data.message,
        purpose:
          studentData.action === "EXIT"
            ? purpose
            : studentData.last_exit?.purpose,
        outTime:
          studentData.action === "EXIT"
            ? timeNow
            : studentData.last_exit?.outTime,
        inTime: studentData.action === "ENTRY" ? timeNow : null,
      });

      setShowModal(false);
      setShowSuccessModal(true);
      setGateVerified(false);
      setPurpose("");
    } catch (error: any) {

if (
  error.response &&
  error.response.data &&
  error.response.data.status === "DENIED"
) {

 await playAlarm();

Alert.alert(
  "Vacation Denied",
  error.response.data.message,
  [
    {
      text: "OK",
      onPress: async () => {
        await stopAlarm();
      },
    },
  ]
);

return;
}

  Alert.alert(
    "Error",
    "Failed to save entry / exit"
  );
}finally {
      setIsSubmitting(false);
    }
  };

  if (hasPermission === null)
    return <Text>Requesting camera permission...</Text>;
  if (hasPermission === false) return <Text>No access to camera</Text>;



  
  return (
    <View style={{ flex: 1 }}>
      {/* HEADER */}
      <View style={styles.header}>
        <Image source={require("./iiitdmj_logo.jpg")} style={styles.logo} />

        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>
            VisionGate App
          </Text>

          <View style={styles.subRow}>
            <Text style={styles.headerSubtitle}>
              Student Monitoring System
            </Text>

            <View style={styles.statusRow}>
              <Text
                style={[
                  styles.statusText,
                  serverStatus === "online"
                    ? { color: "lightgreen" }
                    : serverStatus === "offline"
                    ? { color: "red" }
                    : { color: "yellow" },
                ]}
              >
                ●{" "}
                {serverStatus === "checking"
                  ? "Checking..."
                  : serverStatus === "online"
                  ? "Online"
                  : "Offline"}
              </Text>

              <TouchableOpacity
                onPress={checkServer}
                disabled={serverStatus === "checking"}
              >
                <Text style={styles.retry}>↻</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* CAMERA CONTROL */}
      {cameraActive ? (
        <>
          <CameraView ref={cameraRef} style={{ flex: 1 }} facing="front" />

          <View style={styles.captureContainer}>

<Text style={styles.scanHint}>
  {livenessChecking
    ? livenessMessage
    : nightAttendanceMode
    ? "Tap to start liveness verification"
    : "Tap to start liveness verification"
    }
    
</Text>

{livenessChecking && livenessSequence.length > 0 && (
  <Text style={styles.livenessProgress}>
    Step {currentLivenessIndex + 1} of {livenessSequence.length}
  </Text>
)}

<TouchableOpacity
  disabled={isScanning || livenessChecking}
  onPress={takePhoto}
  style={styles.captureOuter}
>
<View
  style={[
    styles.captureInner,
    (isScanning || livenessChecking) &&
      styles.captureScanning,
  ]}
/>
  </TouchableOpacity>

</View>

         <TouchableOpacity
  style={styles.stopBtn}
  onPress={() => {

    setCameraActive(false);

setIsScanning(false);

setLivenessChecking(false);

setLivenessSequence([]);

setCurrentLivenessIndex(0);

setLivenessVerifiedCount(0);

setLivenessMessage(
  "Tap to start liveness verification"
);

livenessRunningRef.current = false;
eyesClosedRef.current = false;

if (livenessTimeoutRef.current) {
  clearTimeout(livenessTimeoutRef.current);
  livenessTimeoutRef.current = null;
}

  }}
>
            <Text style={styles.btnText}>Stop Camera</Text>
          </TouchableOpacity>
        </>
      ) : (

        <ScrollView
  contentContainerStyle={styles.startContainer}
  showsVerticalScrollIndicator={false}
>

<View style={styles.scanContainer}>

  <Image
    source={require("../../assets/images/wireframe.png")}
    style={styles.heroImage}
  />

<Animated.View
    style={[
        styles.scanGlowLarge,
        {
            transform:[
                {
                    translateY: scanAnimation.interpolate({
                        inputRange:[0,1],
                        outputRange:[-20,230],
                    }),
                },
            ],
        },
    ]}
/>

<Animated.View
    style={[
        styles.scanGlow,
        {
            transform:[
                {
                    translateY: scanAnimation.interpolate({
                        inputRange:[0,1],
                        outputRange:[-20,230],
                    }),
                },
            ],
        },
    ]}
/>

<Animated.View
    style={[
        styles.scanLine,
        {
            transform:[
                {
                    translateY: scanAnimation.interpolate({
                        inputRange:[0,1],
                        outputRange:[-20,230],
                    }),
                },
            ],
        },
    ]}
/>

</View>



  <Text style={styles.heroTitle}>
    VisionGate
  </Text>

  <Text style={styles.heroSubtitle}>
    AI Powered Smart Entry & Exit
  </Text>



  <View
  style={{
    width: "92%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginTop: 20,
    elevation: 5,
  }}
>
  <Text
    style={{
      fontSize: 17,
      fontWeight: "bold",
      color: "#0A3D62",
      textAlign: "center",
    }}
  >
    📍 Location Status
  </Text>

  <TouchableOpacity
    style={{
      backgroundColor: "#0A3D62",
      padding: 12,
      borderRadius: 10,
      marginTop: 12,
      alignItems: "center",
    }}
    onPress={getCurrentLocation}
    disabled={locationLoading}
  >
    <Text
      style={{
        color: "#fff",
        fontWeight: "bold",
      }}
    >
      {locationLoading
        ? "Getting Location..."
        : "Get My Current Location"}
    </Text>
  </TouchableOpacity>

  {location && (
    

      

<View
  style={{
    marginTop: 15,
    paddingTop: 10,
  }}
>
  <Text
    style={{
      fontSize: 17,
      fontWeight: "bold",
      marginBottom: 12,
    }}
  >
    Hostel Status:
    {" "}
    <Text
      style={{
       color:
  hostelStatus === "INSIDE"
    ? "#16a34a"
    : hostelStatus === "OUTSIDE"
    ? "#dc2626"
    : "#f59e0b",
      }}
    >
      {hostelStatus}
    </Text>
  </Text>

  <Text
    style={{
      fontSize: 17,
      fontWeight: "bold",
    }}
  >
    Campus Status:
    {" "}
    <Text
      style={{
   color:
  campusStatus === "INSIDE"
    ? "#16a34a"
    : campusStatus === "OUTSIDE"
    ? "#dc2626"
    : "#f59e0b",
      }}
    >
      {campusStatus}
    </Text>
  </Text>
</View>

     
    
  )}
</View>




 

  <View style={styles.featureContainer}>

<TouchableOpacity
  style={styles.featureCard}
  onPress={() =>
    Linking.openURL("https://vision-gate-sbta.vercel.app")
  }
>
  <Text style={styles.featureIcon}>🌐</Text>

  <Text style={styles.featureText}>
    Visit VisionGate Web Portal
  </Text>
</TouchableOpacity>

    

  </View>

 {/* NIGHT ATTENDANCE */}

<TouchableOpacity
  style={[
    styles.attendanceBtn,
    (
      serverStatus !== "online" ||
      hostelStatus !== "INSIDE"
    ) && { opacity: 0.5 },
  ]}
  disabled={
    serverStatus !== "online" ||
    hostelStatus !== "INSIDE"
  }
onPress={() => {

  if (hostelStatus !== "INSIDE") {
    Alert.alert(
      "Outside Hostel",
      "You must be inside the hostel to mark night attendance."
    );
    return;
  }

  const now = new Date();

  const current = now.getHours() * 60 + now.getMinutes();

  const START = 22 * 60;
  const END = 23 * 60 + 59;

  if (current < START || current > END) {
    Alert.alert(
      "Night Attendance Closed",
      "Night attendance can be marked only between 22:00 and 23:59."
    );
    return;
  }

setNightAttendanceMode(true);

setLivenessChecking(false);

setLivenessSequence([]);

setCurrentLivenessIndex(0);

setLivenessVerifiedCount(0);

setLivenessMessage(
  "Tap to start liveness verification"
);

livenessRunningRef.current = false;
eyesClosedRef.current = false;

setCameraActive(true);
}}
>
  <Text style={styles.btnText}>
    🌙 Night Attendance
  </Text>
</TouchableOpacity>


{/* ENTRY / EXIT */}

<TouchableOpacity
  style={[
    styles.startBtn,
    serverStatus !== "online" && { opacity: 0.5 },
  ]}
  disabled={serverStatus !== "online"}
onPress={() => {

  if (serverStatus === "online") {

    setNightAttendanceMode(false);

    setLivenessChecking(false);

    setLivenessMessage(
      "Tap to start liveness verification"
    );

    setCameraActive(true);

  } else {

    Alert.alert(
      "Server Offline",
      "Tap ↻ to retry connection"
    );

  }

}}
>
  <Text style={styles.btnText}>
    🚪 Entry / Exit
  </Text>
</TouchableOpacity>

  <Text style={styles.footer}>
Version 1.0 • IIITDM Jabalpur
</Text>

</ScrollView>
      )}

      {/* VERIFY MODAL */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={styles.title}>Student Verification</Text>

            {photoUri && (
              <Image source={{ uri: photoUri }} style={styles.photo} />
            )}

            <Text>
              <Text style={styles.label}>Name : </Text>
              {studentData?.student?.name}
            </Text>
            <Text>
              <Text style={styles.label}>Roll : </Text>
              {studentData?.student?.roll_no}
            </Text>
            <Text>
              <Text style={styles.label}>Status : </Text>
              {studentData?.action}
            </Text>

            {studentData?.action === "ENTRY" && (
              <>
                <Text>
                  <Text style={styles.label}>Last Exit Time : </Text>
                  {studentData?.last_exit?.outTime || "N/A"}
                </Text>

                <Text>
                  <Text style={styles.label}>Last Exit Purpose : </Text>
                  {studentData?.last_exit?.purpose || "N/A"}
                </Text>
              </>
            )}

           {studentData?.action === "EXIT" && (
  <View style={styles.purposeContainer}>

    <Text style={styles.purposeLabel}>
      Select Purpose
    </Text>

    <Picker
      selectedValue={purpose}
      onValueChange={(value) => setPurpose(value)}
      style={styles.purposePicker}
      dropdownIconColor="#0A3D62"
    >
      <Picker.Item label="Select Purpose" value="" />
      <Picker.Item label="Tea Break" value="Tea Break" />
      <Picker.Item label="Market" value="Market" />
      <Picker.Item label="Hospital" value="Hospital" />
      <Picker.Item label="Official Work" value="Official Work" />
      <Picker.Item label="Vacation" value="Vacation" />
    </Picker>

  </View>
)}

            <View style={styles.btnRow}>
              <TouchableOpacity
  style={styles.confirmBtn}
  disabled={isSubmitting}
  onPress={confirmEntryExit}
>
  <Text style={styles.btnText}>
    {isSubmitting ? "Processing..." : "Confirm"}
  </Text>
</TouchableOpacity>

        <TouchableOpacity
  style={styles.cancelBtn}
onPress={() => {

  setShowModal(false);

  setStudentData(null);

  setPhotoUri(null);

  setPurpose("");

  setNightAttendanceMode(false);

setLivenessChecking(false);

setLivenessSequence([]);

setCurrentLivenessIndex(0);

setLivenessVerifiedCount(0);

setLivenessMessage(
  "Tap to start liveness verification"
);

livenessRunningRef.current = false;
eyesClosedRef.current = false;
}}
>
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


            {/* NIGHT ATTENDANCE MODAL */}

      <Modal
        visible={showAttendanceModal}
        transparent
        animationType="fade"
      >
        <View style={styles.overlay}>
          <View style={styles.modalBox}>

            <Text style={styles.title}>
              Night Attendance
            </Text>

            {photoUri && (
              <Image
                source={{ uri: photoUri }}
                style={styles.photo}
              />
            )}

            <Text>
              <Text style={styles.label}>Name : </Text>
              {studentData?.student?.name}
            </Text>

            <Text>
              <Text style={styles.label}>Roll : </Text>
              {studentData?.student?.roll_no}
            </Text>

            <Text>
              <Text style={styles.label}>Room No. : </Text>
              {studentData?.student?.room}
            </Text>


            <Text
              style={{
                marginTop: 15,
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              Are you sure you want to mark
              {"\n"}
              Night Attendance?
            </Text>

            <View style={styles.btnRow}>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={markNightAttendance}
              >
                <Text style={styles.btnText}>
                  Confirm
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
             onPress={() => {

  setShowAttendanceModal(false);

  setStudentData(null);

  setPhotoUri(null);

  setNightAttendanceMode(false);

  setLivenessChecking(false);

  setLivenessMessage(
    "Look at the camera"
  );
}}
              >
                <Text style={styles.btnText}>
                  Cancel
                </Text>
              </TouchableOpacity>

            </View>

          </View>
        </View>
      </Modal>



      {/* =====================================================
    NIGHT ATTENDANCE SUCCESS MODAL
===================================================== */}

<Modal
  visible={showAttendanceSuccessModal}
  transparent
  animationType="fade"
>
  <View style={styles.overlay}>

    <View style={styles.attendanceSuccessCard}>

      {/* STUDENT PHOTO */}

      <Image
        source={{
          uri:
            attendanceData?.photo ||
            studentData?.student?.photo
        }}
        style={styles.attendanceStudentPhoto}
      />

      {/* SUCCESS TITLE */}

      <Text style={styles.attendanceSuccessHeading}>
        ATTENDANCE MARKED
      </Text>

      <View style={styles.divider} />

      {/* WELCOME */}

      <Text style={styles.attendanceWelcome}>
        GOOD NIGHT,
      </Text>

      <Text style={styles.attendanceStudentName}>
        {attendanceData?.name}
      </Text>

      <Text style={styles.attendanceRollNumber}>
        {attendanceData?.roll_no}
      </Text>

      <View style={styles.divider} />

      {/* ATTENDANCE INFORMATION */}

      <View style={styles.attendanceInfoRow}>

        <Text style={styles.attendanceInfoLabel}>
          Status
        </Text>

        <Text style={styles.attendanceStatus}>
          PRESENT
        </Text>

      </View>

      <View style={styles.attendanceInfoRow}>

        <Text style={styles.attendanceInfoLabel}>
          Date
        </Text>

        <Text style={styles.attendanceInfoValue}>
          {attendanceData?.date || "-"}
        </Text>

      </View>

      <View style={styles.attendanceInfoRow}>

        <Text style={styles.attendanceInfoLabel}>
          Attendance Time
        </Text>

        <Text style={styles.attendanceInfoValue}>
          {attendanceData?.time || "-"}
        </Text>

      </View>

      <View style={styles.divider} />

      {/* DONE BUTTON */}

      <TouchableOpacity
        style={styles.attendanceDoneButton}
        onPress={() => {

          setShowAttendanceSuccessModal(false);

          setStudentData(null);
          setPhotoUri(null);
          setAttendanceData(null);
          setNightAttendanceMode(false);

        }}
      >

        <Text style={styles.attendanceDoneText}>
          DONE
        </Text>

      </TouchableOpacity>

    </View>

  </View>
</Modal>




      {/* SUCCESS MODAL */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.overlay}>


        
         <View style={styles.successCard}>

 <Image
    source={{
        uri:
            savedData?.photo ||
            studentData?.student?.photo
    }}
    style={styles.studentPhoto}
/>

  <Text style={styles.successHeading}>
    {savedData?.action === "ENTRY"
      ? "ENTRY SUCCESS"
      : "EXIT SUCCESS"}
  </Text>

  <View style={styles.divider} />

  <Text style={styles.welcome}>
    {savedData?.action === "ENTRY"
      ? "WELCOME BACK,"
      : "HAVE A SAFE TRIP"}
  </Text>

  <Text style={styles.studentName}>
    {savedData?.name}
  </Text>

  <Text style={styles.rollNumber}>
    {savedData?.roll_no}
  </Text>

  <View style={styles.divider} />

  {savedData?.action === "ENTRY" ? (
    <>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Status</Text>
        <Text style={styles.statusBadge}>
          INSIDE CAMPUS
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Purpose</Text>
        <Text style={styles.infoValue}>
          {savedData?.purpose || "-"}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Exit Time</Text>
        <Text style={styles.infoValue}>
          {savedData?.outTime || "-"}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Entry Time</Text>
        <Text style={styles.infoValue}>
          {savedData?.inTime || "-"}
        </Text>
      </View>
    </>
  ) : (
    <>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Status</Text>
       <Text
  style={[
    styles.statusBadge,
    savedData?.action === "EXIT"
      ? styles.outsideStatus
      : styles.insideStatus,
  ]}
>
  {savedData?.action === "EXIT"
    ? "OUTSIDE CAMPUS"
    : "INSIDE CAMPUS"}
</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Purpose</Text>
        <Text style={styles.infoValue}>
          {savedData?.purpose}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Exit Time</Text>
        <Text style={styles.infoValue}>
          {savedData?.outTime || "-"}
        </Text>
      </View>
    </>
  )}

  <View style={styles.divider} />

  <TouchableOpacity
    style={styles.doneButton}
    onPress={() => setShowSuccessModal(false)}
  >
    <Text style={styles.doneText}>
      DONE
    </Text>
  </TouchableOpacity>

</View>



        </View>
      </Modal>

      <Modal
  visible={showWaitingModal}
  transparent
  animationType="fade"
>
  <View style={styles.overlay}>
    <View style={styles.modalBox}>

      <Text style={styles.title}>
        Waiting For Approval
      </Text>

      <Text style={{ textAlign: "center", marginTop: 10 }}>
        {studentData?.student?.name}
      </Text>

      <Text style={{ textAlign: "center" }}>
  {studentData?.student?.roll_no}
</Text>

<ActivityIndicator
  size="large"
  style={{ marginTop: 20 }}
/>

<Text
  style={{
    textAlign: "center",
    marginTop: 20,
    fontWeight: "bold",
  }}
>
  Waiting for Gate Guard Approval...
</Text>
    </View>
  </View>
</Modal>


{/* GATE APPROVED MODAL */}
<Modal
  visible={gateApproved}
  transparent
  animationType="fade"
>
  <View style={styles.overlay}>
    <View style={styles.modalBox}>

      <Text style={styles.successTitle}>
        Gate Verification Completed
      </Text>

      <Text>
        <Text style={styles.label}>Name : </Text>
        {studentData?.student?.name}
      </Text>

      <Text>
        <Text style={styles.label}>Roll : </Text>
        {studentData?.student?.roll_no}
      </Text>

      <Text
        style={{
          marginTop: 15,
          textAlign: "center"
        }}
      >
        Gate Guard has approved your vacation request.
      </Text>

      <View style={styles.btnRow}>
<TouchableOpacity
  style={styles.confirmBtn}
  onPress={async () => {

    setGateApproved(false);

    await saveApprovedVacationExit();

  }}
>
  <Text style={styles.btnText}>
    Confirm Exit
  </Text>
</TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => {
            setGateApproved(false);
          }}
        >
          <Text style={styles.btnText}>
            Cancel
          </Text>
        </TouchableOpacity>

      </View>

    </View>
  </View>
</Modal>

</View>

  );
}






const styles = StyleSheet.create({
  scanBtn: { backgroundColor: "#0a3d62", padding: 15, alignItems: "center" },
  scanText: { color: "#fff", fontWeight: "bold" },

startContainer:{
    flexGrow:1,
    alignItems:"center",

    paddingHorizontal:25,

    paddingTop:20,

    paddingBottom:40,

    backgroundColor:"#f4f8fc",
},

  checkCircle:{
    width:90,
    height:90,
    borderRadius:45,
    backgroundColor:"#22c55e",
    justifyContent:"center",
    alignItems:"center",
    elevation:8,
},



  startBtn: {
    backgroundColor: "#0a3d62",
    padding: 15,
    borderRadius: 10,
      width:"100%",
      justifyContent:"center",
    alignItems:"center",
       elevation:8,
         height:50,
  },

  stopBtn: {
    backgroundColor: "#e74c3c",
    padding: 10,
    alignItems: "center",
  },

  topBar:{
    height:8,
    backgroundColor:"#22c55e",
    borderTopLeftRadius:25,
    borderTopRightRadius:25,
},

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },

  successTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "green",
    textAlign: "center",
    marginBottom: 15,
  },

  label: { fontWeight: "bold" },

  photo: {
    width: 200,
    height: 200,
    alignSelf: "center",
    marginBottom: 10,
    borderRadius: 10,
  },

  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  confirmBtn: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
    width: "45%",
    alignItems: "center",
  },

  cancelBtn: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    width: "45%",
    alignItems: "center",
  },

  okBtn: {
    backgroundColor: "#0a3d62",
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
    alignItems: "center",
  },

  btnText: { color: "#fff", fontWeight: "bold" },


  insideStatus: {
  color: "#16a34a",
},

outsideStatus: {
  color: "#dc2626",
},

  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0a3d62",
    paddingTop: 40,
    paddingBottom: 10,
    paddingHorizontal: 10,
  },

  logo: {
    width: 45,
    height: 40,
    marginRight: 10,
    resizeMode: "contain",
    borderRadius: 10,
  },

  headerTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  headerSubtitle: {
    color: "#ccc",
    fontSize: 12,
  },

  subRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },

  retry: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
  },



  successCard:{
    width:"90%",
    backgroundColor:"#fff",
    borderRadius:25,
    padding:28,

    shadowColor:"#000",
    shadowOffset:{
        width:0,
        height:8,
    },
    shadowOpacity:0.25,
    shadowRadius:12,

    elevation:15,
},

checkIcon: {
  fontSize: 55,
  color: "#16a34a",
  fontWeight: "bold",
},

successHeading: {
  fontSize: 24,
  fontWeight: "bold",
  color: "#16a34a",
  marginTop: 10,
},

welcome: {
  marginTop: 18,
  fontSize: 18,
  color: "#666",
  fontWeight: "600",
},

studentName:{
    fontSize:32,
    fontWeight:"900",
    color:"#0f172a",
    letterSpacing:1,
},

rollNumber: {
  fontSize: 17,
  color: "#777",
  marginTop: 5,
},

divider: {
  width: "100%",
  height: 1,
  backgroundColor: "#fbfbfb",
  marginVertical: 20,
},

infoRow:{
    flexDirection:"row",
    alignItems:"center",

    paddingVertical:14,
    paddingHorizontal:18,

    backgroundColor:"#f8fafc",

    borderRadius:12,

    marginBottom:12,
},

infoLabel:{
    width:110,          // fixed width
    fontSize:17,
    fontWeight:"700",
    color:"#333",
},

infoValue:{
    flex:1,
    textAlign:"right",
    fontSize:16,
    color:"#111",
},

statusBadge: {
  fontSize: 16,
  fontWeight: "bold",
  color: "#16a34a",
},

doneButton:{
    width:"100%",
    height:56,

    backgroundColor:"#0a3d62",

    borderRadius:14,

    justifyContent:"center",
    alignItems:"center",

    marginTop:15,

    elevation:8,
},
doneText: {
  color: "#fff",
  fontSize: 18,
  fontWeight: "bold",
},



heroTitle:{
    marginTop:10,

    fontSize:38,

    fontWeight:"900",

    color:"#0A3D62",

    textAlign:"center",
},

heroSubtitle:{
    marginTop:8,

    fontSize:21,

    textAlign:"center",

    fontWeight:"700",

    color:"#1E293B",
},

heroDescription:{
    marginTop:8,
    color:"#666",
    textAlign:"center",
    paddingHorizontal:40,
    lineHeight:22,
},

featureContainer:{
    width:"92%",

    marginTop:28,
},

featureCard:{
    flexDirection:"row",

    alignItems:"center",

    backgroundColor:"#fff",

    paddingVertical:18,

    paddingHorizontal:22,

    borderRadius:18,

    marginBottom:16,

    elevation:6,

    shadowColor:"#000",

    shadowOpacity:0.08,

    shadowOffset:{
        width:0,
        height:4,
    },

    shadowRadius:8,
},

featureIcon:{
    fontSize:26,
    marginRight:15,
},

featureText:{
    fontSize:16,
    fontWeight:"600",
    color:"#333",
},

footer:{
    marginTop:20,
    color:"#999",
    fontSize:10,
},

scanContainer: {
  width: 230,
  height: 230,

  borderRadius: 22,

  overflow: "hidden",

  borderWidth: 2,
  borderColor: "#12D8FF",

  backgroundColor: "#071A2F",

  justifyContent: "center",
  alignItems: "center",

  shadowColor: "#00CFFF",
  shadowOpacity: 0.35,
  shadowRadius: 12,
  shadowOffset: {
    width: 0,
    height: 5,
  },
  elevation: 10,

},


heroImage: {
  width: "100%",
  height: "100%",

  resizeMode: "cover",

  borderRadius: 22,
},

scanLine: {
  position: "absolute",

  width: "95%",

  height: 4,

  borderRadius: 20,

  backgroundColor: "#00E5FF",

  shadowColor: "#00E5FF",
  shadowOpacity: 1,
  shadowRadius: 12,

  elevation: 10,
},

scanGlow:{
    position:"absolute",

    width:"94%",

    height:18,

    borderRadius:30,

    backgroundColor:"rgba(0,245,255,0.22)",
},

scanGlowLarge:{
    position:"absolute",

    width:"200%",

    height:20,

    backgroundColor:"rgba(0,245,255,0.08)",
},

studentPhoto:{
    width:90,
    height:90,

    borderRadius:45,

    borderWidth:3,
    borderColor:"#16a34a",

    marginBottom:20,

    backgroundColor:"#eee",
},
captureContainer: {
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: 8,
  backgroundColor: "#071A2F",
},

scanHint: {
  color: "#E2E8F0",
  fontSize: 15,
  fontWeight: "600",
  marginBottom: 8,
},

livenessProgress: {
  color: "#94A3B8",
  fontSize: 13,
  marginBottom: 8,
  fontWeight: "600",
},

captureOuter: {
  width: 62,
  height: 62,
  borderRadius: 31,

  borderWidth: 3,
  borderColor: "#FFFFFF",

  justifyContent: "center",
  alignItems: "center",

  backgroundColor: "rgba(255,255,255,0.08)",

  shadowColor: "#FFFFFF",
  shadowOpacity: 0.25,
  shadowRadius: 8,
  shadowOffset: {
    width: 0,
    height: 3,
  },
  elevation: 6,
},

captureInner: {
  width: 46,
  height: 46,
  borderRadius: 23,

  backgroundColor: "#FFFFFF",
},

captureScanning: {
  backgroundColor: "#22C55E",
},


attendanceBtn: {
  backgroundColor: "#16a34a",
  padding: 15,
  borderRadius: 10,
  width: "100%",
  justifyContent: "center",
  alignItems: "center",
  elevation: 8,
  height: 50,
  marginBottom: 12,
},


/* =====================================================
   NIGHT ATTENDANCE SUCCESS CARD
===================================================== */

attendanceSuccessCard: {
  width: "90%",
  backgroundColor: "#fff",
  borderRadius: 25,
  padding: 28,

  shadowColor: "#000",

  shadowOffset: {
    width: 0,
    height: 8,
  },

  shadowOpacity: 0.25,
  shadowRadius: 12,

  elevation: 15,
},

attendanceStudentPhoto: {
  width: 90,
  height: 90,

  borderRadius: 45,

  borderWidth: 3,
  borderColor: "#16a34a",

  marginBottom: 20,

  backgroundColor: "#eee",
},

attendanceSuccessHeading: {
  fontSize: 24,
  fontWeight: "bold",

  color: "#16a34a",

  marginTop: 10,
},

attendanceWelcome: {
  marginTop: 18,

  fontSize: 18,

  color: "#666",

  fontWeight: "600",
},

attendanceStudentName: {
  fontSize: 32,

  fontWeight: "900",

  color: "#0f172a",

  letterSpacing: 1,
},

attendanceRollNumber: {
  fontSize: 17,

  color: "#777",

  marginTop: 5,
},

attendanceInfoRow: {
  flexDirection: "row",

  alignItems: "center",

  paddingVertical: 14,

  paddingHorizontal: 18,

  backgroundColor: "#f8fafc",

  borderRadius: 12,

  marginBottom: 12,
},

attendanceInfoLabel: {
  width: 130,

  fontSize: 17,

  fontWeight: "700",

  color: "#333",
},

attendanceInfoValue: {
  flex: 1,

  textAlign: "right",

  fontSize: 16,

  color: "#111",
},

attendanceStatus: {
  flex: 1,

  textAlign: "right",

  fontSize: 16,

  fontWeight: "bold",

  color: "#16a34a",
},

attendanceDoneButton: {
  width: "100%",

  height: 56,

  backgroundColor: "#0a3d62",

  borderRadius: 14,

  justifyContent: "center",

  alignItems: "center",

  marginTop: 15,

  elevation: 8,
},

attendanceDoneText: {
  color: "#fff",

  fontSize: 18,

  fontWeight: "bold",
},

purposeContainer: {
  marginTop: 15,
  marginBottom: 10,
},

purposeLabel: {
  fontSize: 16,
  fontWeight: "bold",
  color: "#0A3D62",
  marginBottom: 5,
},

purposePicker: {
  height: 55,
  width: "100%",
  color: "#111",
  backgroundColor: "#f1f5f9",
  borderRadius: 10,
},


});