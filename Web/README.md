# VisionGate – Smart Student Entry-Exit Management System

<p align="center">
  <img src="https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white" />
</p>

<p align="center">
  <a href="https://vision-gate-sbta.vercel.app/">
    <img src="https://img.shields.io/badge/Live_Demo-Visit_Website-06b6d4?style=for-the-badge&logo=vercel" />
  </a>
</p>



## 📖 About The Project

**VisionGate** is a smart student entry-exit management platform developed for **PDPM IIITDM Jabalpur** to digitize campus movement records, vacation approvals, and gate monitoring.

The system replaces traditional manual registers with a centralized digital solution, allowing students, hostel administration, and security personnel to efficiently manage and track campus movement in real time.

### 🎯 Project Objectives

- Digitize student entry-exit records
- Improve campus security and accountability
- Streamline vacation and leave approval workflows
- Provide real-time monitoring for administration and guards
- Maintain transparent and accessible movement logs


## 👨‍💻 Team Members

| Name | Role |
|  --|  --|
| **Dr. Ashish Singh Parihar** | Project Mentor |
| **Malay Saha** | Lead Developer |
| **Manvendra Singh** | Developer |
| **Aditi Verma** | Developer |
| **Aditi Chouhan** | Developer |




## ✨ Key Features

### 👨‍🎓 Student Portal

- Student Login System
- Personal Profile Dashboard
- View Current Campus Status
- Access Entry-Exit History
- Submit Vacation Applications

### 🚪 Entry-Exit Management

- Digital Entry and Exit Recording
- Purpose-Based Movement Tracking
- Real-Time Status Monitoring
- Automated Activity Logs

### 🏖️ Vacation Management

- Vacation Application Submission
- Destination Tracking
- Leave & Return Date Management
- Multi-Level Approval Workflow
- Application Status Tracking

### 🛡️ Administration Portal

- Student Record Management
- Approval & Rejection of Requests
- Real-Time Monitoring Dashboard
- Movement Analytics
- Activity Log Management

### 📱 Modern User Experience

- Responsive Design
- Dark Theme Interface
- Mobile Friendly Layout
- Fast and Interactive Dashboard



## 🏗️ System Architecture

```text
Student
   │
   ▼
React Frontend (Vite)
   │
   ▼
FastAPI Backend
   │
   ▼
MongoDB Database
   │
   ▼
Admin & Security Monitoring
```



## 🛠️ Tech Stack

### Frontend

- React.js
- Vite
- React Router DOM
- Axios
- Custom CSS

### Backend

- Python
- FastAPI
- Uvicorn

### Database

- MongoDB Atlas

### Authentication

- Google OAuth
- Role-Based Access Control

### Deployment

- Vercel (Frontend)
- FastAPI Server (Backend)



## 📂 Project Structure

```text
VisionGate
│
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── services
│   │   └── styles
│   │
│   └── public
│
├── backend
│   ├── routes
│   ├── database
│   ├── models
│   └── main.py
│
└── README.md
```



## 🚀 Getting Started

### Prerequisites

Before running the project locally, ensure that the following software is installed:

- Node.js
- Python 3.x
- Git
- MongoDB Atlas Account



### Installation

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/malaysaha2007/VisionGate.git
```

#### 2️⃣ Navigate to Project Directory

```bash
cd VisionGate
```



### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend will run on:

```text
http://localhost:5173
```



### Backend Setup

```bash
cd backend

pip install -r requirements.txt

uvicorn main:app --reload
```

Backend will run on:

```text
http://localhost:8000
```



## 📸 Screenshots

### 🏠 Home Page

> Add screenshot here

```md
![Home Page](screenshots/home.png)
```

### 👨‍🎓 Student Dashboard

> Add screenshot here

```md
![Student Dashboard](screenshots/student-dashboard.png)
```

### 🏖️ Vacation Management

> Add screenshot here

```md
![Vacation Management](screenshots/vacation.png)
```



## 🔒 Security Features

- Role-Based Access Control
- Protected Routes
- Secure API Communication
- Authentication Validation
- Activity Logging

 

## 📈 Future Enhancements

- Face Recognition Based Verification
- Mobile Application
- QR-Based Entry System
- Advanced Analytics Dashboard
- Notification System
- Email Alerts & Reports

 

## 🎓 Academic Information

This project was developed as part of academic coursework at:

**PDPM Indian Institute of Information Technology, Design and Manufacturing, Jabalpur (PDPM IIITDMJ)**

The objective of the project is to modernize and digitize student movement management while improving campus security and administrative efficiency.

 

## 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push the branch
5. Create a Pull Request

 

## 📜 License

This project is developed for educational and academic purposes.

 

## 🌐 Live Demo

**VisionGate Website**

https://vision-gate-sbta.vercel.app/

 

<p align="center">
  Made with ❤️ by the VisionGate Team
</p>
