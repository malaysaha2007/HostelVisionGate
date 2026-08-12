import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

import {
  FaGithub,
  FaGlobe,
  FaUniversity,
  FaUsers,
  FaLinkedin,
  FaCode,
  FaStar
} from "react-icons/fa";


import "../styles/AboutVisionGate.css";

import API from "../services/api";

//mockdata

function AboutVisionGate() {

  const [feedbacks, setFeedbacks] = useState([]);



  const [showTeam, setShowTeam] =
  useState(false);

  const [name, setName] = useState("");

const [feedback, setFeedback] = useState("");


const handleFeedbackSubmit = async () => {

  if (!name || !feedback || rating === 0) {
    alert("Please fill all fields");
    return;
  }

  try {

    await API.post("/feedback/submit", {
      name,
      feedback,
      rating
    });

    alert("Thank you for your feedback!");

    setName("");
    setFeedback("");
    setRating(0);

    fetchFeedbacks();

  } catch (error) {

    console.error(error);

    alert("Failed to submit feedback");

  }
};

const fetchFeedbacks = async () => {

  try {

    const response =
      await API.get("/feedback/all");

    setFeedbacks(response.data);

  } catch (error) {

    console.error(error);

  }

};



 //for stars
const colors = {
        orange: "#F2C265",
        grey: "#a9a9a9"
    }
const stars = Array(5).fill(0)

const [rating, setRating] = useState(0)

const handleClickStar = value => {
    setRating(value)
};

//for slideshow
const [index, setIndex] = useState(0);

useEffect(() => {
  if (!feedbacks.length) return;

  const timer = setInterval(() => {
    setIndex((prev) => (prev + 1) % feedbacks.length);
  }, 5000);

  return () => clearInterval(timer);
}, [feedbacks]);

useEffect(() => {
  fetchFeedbacks();
}, []);

  return (

    <div className="about-page">

      <Navbar showLogin={true} />

    <div className="about-hero">

  <h1>
    About VisionGate
  </h1>

  <p>
    Smart Entry–Exit Monitoring System
  </p>

</div>

      <div className="about-container">

        <section className="about-card about-wide">

  <h2>
    Project Overview
  </h2>

  <p>
    VisionGate is a smart campus
    security and monitoring platform
    developed to digitize student
    entry–exit management.
    The system combines role-based
    access control, face recognition,
    activity logging, and real-time
    monitoring to ensure secure and
    efficient campus operations.
  </p>

</section>

<section className="about-card">

  <h2>
    Vision Statement
  </h2>

  <p>
    VisionGate aims to transform
    traditional manual entry–exit
    monitoring into a secure,
    intelligent, and automated
    campus management platform.
  </p>

</section>
<section className="about-card">

  <h2>
    Objectives
  </h2>

  <ul>

    <li>
      Improve campus security
    </li>

    <li>
      Maintain accurate movement records
    </li>

    <li>
      Reduce manual register work
    </li>

    <li>
      Enable real-time monitoring
    </li>

    <li>
      Improve accountability
    </li>

  </ul>

</section>


       <section className="about-card">

  <h2>
    Key Features
  </h2>

  <ul>

    <li>Face Recognition</li>

    <li>Role-Based Access</li>

    <li>Activity Logs</li>

    <li>Curfew Monitoring</li>

    <li>Hostel Management</li>

    <li>Real-Time Tracking</li>

    <li>Google Authentication</li>

    <li>Dashboard Analytics</li>

  </ul>

</section>





<section className="about-card">

  <h2>
    System Architecture
  </h2>

  <ul>

    <li>
      Frontend: React.js
    </li>

    <li>
      Backend: FastAPI
    </li>

    <li>
      Database: MongoDB
    </li>

    <li>
      Face Recognition: OpenCV
    </li>

    <li>
      Authentication: Google OAuth
    </li>

  </ul>

</section>


 <section className="about-card about-wide">

  <h2>
    Connect With Us
  </h2>

  <h5>
    Feel free to connect with the
    VisionGate development team,
    explore the project repository,
    or visit our institute website.
  </h5>

  


  <div className="connect-grid">

<div
  className="connect-item developer-team"
  onClick={() => setShowTeam(true)}
>
    <FaUsers className="connect-icon" />
  </div>

  <a
    href="https://github.com/malaysaha2007/VisionGate"
    target="_blank"
    rel="noopener noreferrer"
    className="connect-item"
  >
    <FaGithub className="connect-icon" />
  </a>

  <a
    href="https://vision-gate-sbta.vercel.app"
    target="_blank"
    rel="noopener noreferrer"
    className="connect-item"
  >
    <FaGlobe className="connect-icon" />
  </a>

  <a
    href="https://www.iiitdmj.ac.in"
    target="_blank"
    rel="noopener noreferrer"
    className="connect-item"
  >
    <FaUniversity className="connect-icon" />
  </a>

  </div>



</section>


<section className="about-card">

  <h2>
    Future Enhancements
  </h2>

  <ul>

    <li>
      Mobile Application Support
    </li>

    <li>
      QR-Based Verification
    </li>

    <li>
      Real-Time Notifications
    </li>

    <li>
      Advanced Analytics Dashboard
    </li>

    <li>
      AI-Based Risk Detection
    </li>

  </ul>

</section>






<section className="about-card">

  <h2>
    Feedback Station
  </h2>

  <p>
    We value your feedback and
    suggestions to improve
    VisionGate.
  </p>

  <div className="feedback-form">

    <input
      type="text"
      placeholder="Your Name"
      value={name}
      onChange={(e) =>
        setName(e.target.value)
      }
    />

    <div className="star-feedback">
      <p>Rate your experience</p>
     {stars.map((_, index) => {
          return (
               <FaStar
                   key={index}
                   size={25}
                   color={(rating) > index ? colors.orange : colors.grey}
                   onClick={() => handleClickStar(index + 1)}
                />
           )
       })}
  </div>

    <textarea
      placeholder="Write your feedback..."
      rows="5"
      value={feedback}
      onChange={(e) =>
        setFeedback(e.target.value)
      }
    />

    <button
      className="feedback-btn"
      onClick={handleFeedbackSubmit}
    >
      Submit Feedback
    </button>

  </div>

</section>


 <section className="about-card about-wide">

  <h2>
    Feedbacks . . .
  </h2>

  <p className="feedback-phrase">
    Insights from our community
  </p>




<div className="feedback-display">

  {feedbacks.length > 0 ? (

    <>
      <AnimatePresence mode="wait">
       <motion.div
  key={index}
  initial={{ opacity: 0, y: 50 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -50 }}
  className="feedback-card"
>
  <div className="feedback-header">

    <div className="feedback-user">

      <img
        alt={feedbacks[index]?.name}
        src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${feedbacks[index]?.name}`}
        className="feedback-avatar"
      />

      <h3>{feedbacks[index]?.name}</h3>

    </div>

    <span className="feedback-date">
      {feedbacks[index]?.created_at
        ? new Date(
            feedbacks[index].created_at
          ).toLocaleDateString("en-GB")
        : ""}
    </span>

  </div>

  <div className="feedback-stars">
    {stars.map((_, starIndex) => (
      <FaStar
        key={starIndex}
        size={18}
        color={
          feedbacks[index]?.rating > starIndex
            ? colors.orange
            : colors.grey
        }
      />
    ))}
  </div>

  <p className="feedback-text">
    {feedbacks[index]?.feedback}
  </p>

</motion.div>
      </AnimatePresence>

      
    </>

  ) : (

    <p>No feedback available yet.</p>

  )}

</div>
  
  


</section>

      </div>

      


{showTeam && (

  <div
  className="modal-overlay"
  onClick={() =>
    setShowTeam(false)
  }
>

    <div
  className="team-modal"
  onClick={(e) =>
    e.stopPropagation()
  }
>
<h2 className="team-title">

  <FaCode />

  <span>
    Development Team
  </span>

</h2>

{/* PROJECT GUIDE */}

<div className="guide-section">

  <div className="developer-card">

    <img
      src="/developers/DR._Ashish_Singh_Parihar.jpg"
      alt="Dr. Ashish Singh Parihar"
      className="developer-photo"
    />

    <h3>
      Dr. Ashish Singh Parihar
    </h3>

    <p>
      Project Guide
    </p>

    <div className="developer-links">

      <a
        href="https://github.com/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaGithub />
      </a>

      <a
        href="YOUR_LINKEDIN_URL"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaLinkedin />
      </a>

    </div>

  </div>

</div>

{/* DEVELOPERS */}

<div className="team-members">

  {/* Malay */}

  <div className="developer-card">

    <img
      src="/developers/malay.jpeg"
      alt="Malay Saha"
      className="developer-photo"
    />

    <h3>
      Malay Saha
    </h3>

    <p>
      Lead Developer
    </p>

    <div className="developer-links">

      <a
        href="https://github.com/malaysaha2007"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaGithub />
      </a>

      <a
        href="YOUR_LINKEDIN_URL"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaLinkedin />
      </a>

    </div>

  </div>

  {/* Manvendra */}

  <div className="developer-card">

    <img
      src="/developers/manvendra.jpeg"
      alt="Manvendra Singh"
      className="developer-photo"
    />

    <h3>
      Manvendra Singh
    </h3>

    <p>
      Developer
    </p>

    <div className="developer-links">

      <a
        href="MANVENDRA_GITHUB_URL"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaGithub />
      </a>

      <a
        href="MANVENDRA_LINKEDIN_URL"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaLinkedin />
      </a>

    </div>

  </div>

  {/* Aditi Verma */}

  <div className="developer-card">

    <img
      src="/developers/aditi_verma.jpeg"
      alt="Aditi Verma"
      className="developer-photo"
    />

    <h3>
      Aditi Verma
    </h3>

    <p>
      Developer
    </p>

    <div className="developer-links">

      <a
        href="ADITI_VERMA_GITHUB_URL"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaGithub />
      </a>

      <a
        href="ADITI_VERMA_LINKEDIN_URL"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaLinkedin />
      </a>

    </div>

  </div>

  {/* Aditi Chouhan */}

  <div className="developer-card">

    <img
      src="/developers/aditi_chouhan.jpeg"
      alt="Aditi Chouhan"
      className="developer-photo"
    />

    <h3>
      Aditi Chouhan
    </h3>

    <p>
      Developer
    </p>

    <div className="developer-links">

      <a
        href="ADITI_CHOUHAN_GITHUB_URL"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaGithub />
      </a>

      <a
        href="ADITI_CHOUHAN_LINKEDIN_URL"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaLinkedin />
      </a>

    </div>

  </div>

</div>




    </div>
    

  </div>



)}
      <Footer />

    </div>

  );

}

export default AboutVisionGate;