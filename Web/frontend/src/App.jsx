import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import Home from "./pages/Home";
import StudentLogin from "./pages/StudentLogin";
import StudentProfile from "./pages/StudentProfile";
import Rules from "./pages/Rules";
import Contact from "./pages/Contact";
import AboutVisionGate from "./pages/AboutVisionGate";
import HostelLogin from "./pages/HostelLogin";
import HostelStudents from "./pages/HostelStudents";
import StudentStatusPage from "./pages/StudentStatusPage";
import AddStudents from "./pages/AddStudents";
import EditStudent from "./pages/EditStudent";
import FaceRegistration from "./pages/FaceRegistration";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ActivityLogs from "./pages/ActivityLogs";
import CurfewMail from "./pages/CurfewMail";
import ApplyVacation from "./pages/ApplyVacation";
import AdminVacationApplications from "./pages/AdminVacationApplications";
import VacationStatus from "./pages/VacationStatus";
import ResetPassword from "./pages/ResetPassword";





function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/studentLogin" element={<StudentLogin />} />

      


<Route
  path="/face-registration"
  element={<FaceRegistration />}
/>


        <Route
  path="/StudentProfile"
  element={<StudentProfile />}
/>



        <Route path="/HostelLogin" element={<HostelLogin />} />
      
<Route
  path="/HostelStudents"
  element={<HostelStudents />}
/>

<Route path="/student-status/:type" element={<StudentStatusPage />} />


<Route
  path="/add-students"
  element={<AddStudents />}
/>

<Route
  path="/edit-student"
  element={<EditStudent />}
/>


<Route
  path="/AdminLogin"
  element={<AdminLogin />}
/>

<Route
  path="/admin-dashboard"
  element={<AdminDashboard />}
/>

<Route
  path="/activity-logs"
  element={<ActivityLogs />}
/>
<Route path="/student/vacation-status" element={<VacationStatus />} />

<Route
  path="/curfew-mail"
  element={<CurfewMail />}
/>

        
        <Route path="/rules" element={<Rules />} />

        <Route path="/contact" element={<Contact />} />

        <Route path="/AboutVisionGate" element={<AboutVisionGate />} />

        <Route
  path="/student/apply-vacation"
  element={<ApplyVacation />}
/>

<Route
  path="/admin-vacations"
  element={<AdminVacationApplications />}
/>

<Route
  path="/reset-password"
  element={<ResetPassword />}
/>


      </Routes>

      

    </BrowserRouter>
  );
}

export default App;