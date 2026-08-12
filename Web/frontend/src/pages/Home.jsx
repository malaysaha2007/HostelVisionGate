import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";


import CountUpModule from "react-countup";
const CountUp = CountUpModule.default;

import { ScanFace } from "lucide-react";
import wireframeFace from "../assets/wireframe.png";


import AOS from "aos";
import "aos/dist/aos.css";

import {
  FaUserShield,
  FaChartLine,
  FaHistory,
  FaServer,
  FaShieldAlt,
  FaTachometerAlt,
  FaArrowRight,
  FaArrowDown
} from "react-icons/fa";


import {
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";

import API from "../services/api";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "../styles/Home.css";

import Tilt from "react-parallax-tilt";


import reactLogo from "../assets/tech/react.svg";
import viteLogo from "../assets/tech/vite.svg";
import jsLogo from "../assets/tech/javascript.svg";
import htmlLogo from "../assets/tech/html.svg";
import cssLogo from "../assets/tech/css.svg";

import pythonLogo from "../assets/tech/python.svg";
import fastapiLogo from "../assets/tech/fastapi.svg";
import flaskLogo from "../assets/tech/flask.svg";

import mongodbLogo from "../assets/tech/mongodb.svg";

import opencvLogo from "../assets/tech/opencv.svg";
import faceLogo from "../assets/tech/facerecog.svg";

import expoLogo from "../assets/tech/expo.svg";

import gitLogo from "../assets/tech/git.svg";
import githubLogo from "../assets/tech/github.svg";
import postmanLogo from "../assets/tech/postman.svg";
import vscodeLogo from "../assets/tech/vscode.png";

import cloudinaryLogo from "../assets/tech/cloudinary.svg";
import googleLogo from "../assets/tech/google.png";
import androidLogo from "../assets/tech/android.png";


import screenshot1 from "../assets/tech/1.png";
import screenshot2 from "../assets/tech/2.png";
import screenshot3 from "../assets/tech/3.png";
import screenshot4 from "../assets/tech/4.png";
import screenshot5 from "../assets/tech/5.png";




import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";



function Home() {

  // ==================================================
  // STATES
  // ==================================================

  const [todayData, setTodayData] = useState([]);
  const [weekData, setWeekData] = useState([]);
  const [monthData, setMonthData] = useState([]);
  const [customData, setCustomData] = useState([]);
  const dateInputRef = useRef(null);

  const [currentSlide, setCurrentSlide] =
  useState(0);

  const [fade, setFade] = useState(true);

  const screenshots = [
  {
    image: screenshot1,
    title: "Admin Dashboard",
    description:
      "Centralized monitoring, analytics and security management."
  },
  {
    image: screenshot2,
    title: "Student Profile",
    description:
      "Real-time student information and hostel status."
  },
  {
    image: screenshot3,
    title: "Vacation Management",
    description:
      "Digital leave approval workflow."
  },
  {
    image: screenshot4,
    title: "Hostel Management",
    description:
      "Manage hostel residents and activities."
  },
  {
    image: screenshot5,
    title: "Face Registration",
    description:
      "AI-powered face enrollment system."
  }
];

  const [todayStats, setTodayStats] = useState({
    totalScans: 0,
    peakHour: "No Logs",
    average: 0,
  });

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [stats, setStats] = useState({
    total: 0,
    inside: 0,
    outside: 0,
  });

  const [activities, setActivities] = useState([]);
  const [currentTime, setCurrentTime] = useState("");
  const [analyticsView, setAnalyticsView] = useState("today");

  const [customStats, setCustomStats] = useState({
  totalScans: 0,
  peakHour: "No Logs",
  average: 0,
});


const [weekStats, setWeekStats] = useState({
  totalScans: 0,
  peakDay: "No Data",
  average: 0,
});

const [monthStats, setMonthStats] = useState({
  totalScans: 0,
  peakWeek: "No Data",
  average: 0,
});

const [selectedWeekInfo, setSelectedWeekInfo] =
  useState("Select a day");

const [selectedMonthWeek, setSelectedMonthWeek] =
  useState("Select a week");



  // ==================================================
  // ANALYTICS
  // ==================================================

  const fetchAnalytics = async () => {
    try {

      const response = await API.get(
        "/dashboard/analytics"
      );

      const logs = response.data.logs || [];

      // ==========================================
      // TODAY LOGS
      // ==========================================

      const today = new Date();

      const hourlyCounts = {};

      logs.forEach((log) => {

        if (!log.outTime) return;

        const logDate = new Date(
          log.outTime.replace(" ", "T")
        );

        const isToday =
          logDate.getDate() === today.getDate() &&
          logDate.getMonth() === today.getMonth() &&
          logDate.getFullYear() === today.getFullYear();

        if (!isToday) return;

        const hour =
          logDate.getHours()
            .toString()
            .padStart(2, "0") + ":00";

        hourlyCounts[hour] =
          (hourlyCounts[hour] || 0) + 1;
      });

      const todayChart = Object.keys(hourlyCounts)
        .sort()
        .map((hour) => ({
          time: hour,
          scans: hourlyCounts[hour],
        }));

      const totalScans =
        Object.values(hourlyCounts)
          .reduce(
            (sum, count) => sum + count,
            0
          );

      let peakHour = "No Logs";
      let maxScans = 0;

      Object.entries(hourlyCounts)
        .forEach(([hour, count]) => {

          if (count > maxScans) {
            maxScans = count;
            peakHour = hour;
          }

        });

      const average =
        Object.keys(hourlyCounts).length > 0
          ? Math.round(
              totalScans /
              Object.keys(hourlyCounts).length
            )
          : 0;

      setTodayStats({
        totalScans,
        peakHour,
        average,
      });

      setTodayData(todayChart);

      // ==========================================
      // CUSTOM DATE LOGS
      // ==========================================

      const selected =
        new Date(selectedDate);

      const customHourlyCounts = {};

      logs.forEach((log) => {

        if (!log.outTime) return;

        const logDate = new Date(
          log.outTime.replace(" ", "T")
        );

        const isSelectedDate =
          logDate.getDate() === selected.getDate() &&
          logDate.getMonth() === selected.getMonth() &&
          logDate.getFullYear() === selected.getFullYear();

        if (!isSelectedDate) return;

        const hour =
          logDate.getHours()
            .toString()
            .padStart(2, "0") + ":00";

        customHourlyCounts[hour] =
          (customHourlyCounts[hour] || 0) + 1;

      });

      const customChart =
        Object.keys(customHourlyCounts)
          .sort()
          .map((hour) => ({
            time: hour,
            scans: customHourlyCounts[hour],
          }));

      setCustomData(customChart);
const customTotalScans =
  Object.values(customHourlyCounts)
    .reduce((sum, count) => sum + count, 0);

let customPeakHour = "No Logs";
let customMaxScans = 0;

Object.entries(customHourlyCounts).forEach(
  ([hour, count]) => {
    if (count > customMaxScans) {
      customMaxScans = count;
      customPeakHour = hour;
    }
  }
);

const customAverage =
  Object.keys(customHourlyCounts).length > 0
    ? Math.round(
        customTotalScans /
        Object.keys(customHourlyCounts).length
      )
    : 0;

setCustomStats({
  totalScans: customTotalScans,
  peakHour: customPeakHour,
  average: customAverage,
});


  // ==========================================
// WEEK LOGS
// ==========================================

const weekCounts = {
  Sun: 0,
  Mon: 0,
  Tue: 0,
  Wed: 0,
  Thu: 0,
  Fri: 0,
  Sat: 0,
};



const currentDate = new Date();

logs.forEach((log) => {

  if (!log.outTime) return;

  const logDate = new Date(
    log.outTime.replace(" ", "T")
  );

  const diffDays =
    (currentDate - logDate) /
    (1000 * 60 * 60 * 24);

  if (diffDays > 7) return;

  const dayName =
    ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][
      logDate.getDay()
    ];

  weekCounts[dayName]++;

});

const weeklyChart = [];

for (let i = 6; i >= 0; i--) {

  const d = new Date();
  d.setDate(d.getDate() - i);

  const dayName =
    ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][
      d.getDay()
    ];

  weeklyChart.push({
  day: dayName,

  date: d.toLocaleDateString(
    "en-IN",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ),

  scans: weekCounts[dayName],
});
}


setWeekData(weeklyChart);

const weeklyTotal =
  Object.values(weekCounts)
    .reduce((a,b) => a + b, 0);

let busiestDay = "No Data";
let maxDayScans = 0;

Object.entries(weekCounts).forEach(
  ([day,count]) => {

    if (count > maxDayScans) {
      maxDayScans = count;
      busiestDay = day;
    }

  }
);

setWeekStats({
  totalScans: weeklyTotal,
  peakDay: busiestDay,
  average:
    Math.round(weeklyTotal / 7),
});


// ==========================================
// MONTH LOGS
// ==========================================

const weekOfMonthCounts = {
  "Week 1": 0,
  "Week 2": 0,
  "Week 3": 0,
  "Week 4": 0,
  "Week 5": 0,
};

logs.forEach((log) => {

  if (!log.outTime) return;

  const logDate = new Date(
    log.outTime.replace(" ", "T")
  );

  if (
    logDate.getMonth() !==
      currentDate.getMonth() ||
    logDate.getFullYear() !==
      currentDate.getFullYear()
  ) return;

  const weekNumber =
    Math.ceil(logDate.getDate() / 7);

  weekOfMonthCounts[
    `Week ${weekNumber}`
  ]++;

});

const monthlyChart =
  Object.keys(weekOfMonthCounts)
    .map((week) => {

      const weekNumber =
        parseInt(
          week.replace("Week ", "")
        );

      const startDate =
        (weekNumber - 1) * 7 + 1;

      const endDate =
        Math.min(
          weekNumber * 7,
          new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            0
          ).getDate()
        );

      return {
        week,
        scans: weekOfMonthCounts[week],

        range:
          `${startDate}/${currentDate.getMonth()+1}/${currentDate.getFullYear()} - ` +
          `${endDate}/${currentDate.getMonth()+1}/${currentDate.getFullYear()}`
      };

    });

setMonthData(monthlyChart);

const monthlyTotal =
  Object.values(weekOfMonthCounts)
    .reduce((a,b) => a + b, 0);

let peakWeek = "No Data";
let maxWeekScans = 0;

Object.entries(
  weekOfMonthCounts
).forEach(([week,count]) => {

  if (count > maxWeekScans) {
    maxWeekScans = count;
    peakWeek = week;
  }

});

setMonthStats({
  totalScans: monthlyTotal,
  peakWeek,
  average:
    Math.round(monthlyTotal / 4),
});




    } catch (err) {
      console.error(err);
    }

    
  };




  // ==================================================
// LOGS
// ==================================================

const fetchLogs = async () => {
  try {

    const response =
      await API.get("/activity-logs");

    const logs =
      response.data.logs || [];

    const total = logs.length;

    const inside = logs.filter(
      (log) =>
        log.inTime &&
        log.inTime !== null
    ).length;

    const outside = total - inside;

    setStats({
      total,
      inside,
      outside,
    });

    setActivities(
      logs.slice(-5).reverse()
    );

  } catch (error) {
    console.error(error);
  }
};


// ==================================================
// CLOCK
// ==================================================

const updateClock = () => {

  const now = new Date();

  setCurrentTime(
    now.toLocaleDateString() +
    " | " +
    now.toLocaleTimeString()
  );

};

  // ==================================================
  // EFFECTS
  // ==================================================

  useEffect(() => {
    fetchAnalytics();
  }, [selectedDate]);

  useEffect(() => {

    fetchLogs();
    updateClock();

    AOS.init({
      duration: 1000,
      once: true,
    });

    const timer = setInterval(
      updateClock,
      1000
    );

    return () => clearInterval(timer);

  }, []);

 useEffect(() => {

  const timer = setInterval(() => {

    setFade(false);

    setTimeout(() => {

      setCurrentSlide(prev =>
        prev === screenshots.length - 1
          ? 0
          : prev + 1
      );

      setFade(true);

    }, 300);

  }, 5000);

  return () => clearInterval(timer);

}, []);

  


  return (


    
    <div className="homepage-page">

      <Navbar showLogin={true} />


      <div className="homepage-grid-background"></div>



      {/* HERO */}

      <section className="homepage-hero-section">

<div className="homepage-hero-layout">

  <div className="homepage-hero-left">

  
          <div className="homepage-visiongate-badge">
            VISIONGATE
          </div>

          <h1>
            Smart Campus Entry–Exit Monitoring System
          </h1>

          <p>
            AI-powered student movement monitoring platform
            designed for secure campus access, automated
            verification, vacation approval workflows,
            and real-time security tracking.
          </p>




<div className="homepage-hero-metrics">

<div className="homepage-metric">
  <h3>
    <CountUp
      end={5000}
      duration={2}
      separator=","
    />
    +
  </h3>
  <span>Logs Recorded</span>
</div>

<div className="homepage-metric">
  <h3>
    <CountUp
      end={99.9}
      duration={2}
      decimals={1}
    />
    %
  </h3>
  <span>Recognition Accuracy</span>
</div>

<div className="homepage-metric">
  <h3>
    <CountUp
      end={7}
      duration={2}
    />
  </h3>
  <span>Hostels Connected</span>
</div>

</div>


        </div>

     

  <div className="homepage-hero-right">

<Tilt
  tiltMaxAngleX={15}
  tiltMaxAngleY={15}
  perspective={1200}
  scale={1.04}
  glareEnable={true}
  glareMaxOpacity={0.15}
>
  <div className="homepage-face-card">

  <div className="homepage-scan-line"></div>

  <div className="homepage-corner tl"></div>
  <div className="homepage-corner tr"></div>
  <div className="homepage-corner bl"></div>
  <div className="homepage-corner br"></div>

  <div className="homepage-face-wrapper">
    <img
      src={wireframeFace}
      alt="AI Face"
      className="homepage-ai-face"
    />
  </div>

</div>
</Tilt>
</div>


</div>

      </section>

      {/* Workflow */}

<section className="homepage-workflow-section">

  <h2
    className="homepage-section-title"
    data-aos="fade-up"
  >
    How VisionGate Works
  </h2>

  <p
    className="homepage-workflow-subtitle"
    data-aos="fade-up"
  >
    Seamless AI-powered verification from student
    authentication to secure campus access.
  </p>

  <div className="homepage-workflow">

    <div className="homepage-step-card">
      <div className="homepage-step-number">01</div>
      <h3>Student</h3>
      <p>Approaches campus gate</p>
    </div>

    <div className="homepage-workflow-arrow">→</div>

    <div className="homepage-step-card">
      <div className="homepage-step-number">02</div>
      <h3>Face Scan</h3>
      <p>Identity captured instantly</p>
    </div>

    <div className="homepage-workflow-arrow">→</div>

    <div className="homepage-step-card">
      <div className="homepage-step-number">03</div>
      <h3>Verification</h3>
      <p>AI validates student profile</p>
    </div>

    <div className="homepage-workflow-arrow">→</div>

    <div className="homepage-step-card">
      <div className="homepage-step-number">04</div>
      <h3>Permission</h3>
      <p>Approval workflow checked</p>
    </div>

    <div className="homepage-workflow-arrow">→</div>

    <div className="homepage-step-card">
      <div className="homepage-step-number">05</div>
      <h3>Access</h3>
      <p>Gate entry or exit allowed</p>
    </div>

  </div>

</section>

<section className="homepage-dashboard-section">

  {/* System Intelligence */}

  <div className="homepage-intelligence-box">

    <h2 className="homepage-section-title">
      System Intelligence
    </h2>

    <div className="homepage-performance-bars">

      <div className="homepage-performance-item">

        <div className="homepage-performance-header">
          <span>Face Recognition Accuracy</span>

          <strong>
            <CountUp
              end={99.9}
              duration={2}
              decimals={1}
            />
            %
          </strong>
        </div>

        <div className="homepage-progress">
          <div className="homepage-fill homepage-accuracy"></div>
        </div>

      </div>

      <div className="homepage-performance-item">

        <div className="homepage-performance-header">
          <span>Verification Speed</span>

          <strong>
            <CountUp
              end={95}
              duration={2}
            />
            %
          </strong>
        </div>

        <div className="homepage-progress">
          <div className="homepage-fill homepage-speed"></div>
        </div>

      </div>

      <div className="homepage-performance-item">

        <div className="homepage-performance-header">
          <span>System Availability</span>

          <strong>
            <CountUp
              end={100}
              duration={2}
            />
            %
          </strong>
        </div>

        <div className="homepage-progress">
          <div className="homepage-fill homepage-uptime"></div>
        </div>

      </div>

    </div>

  </div>




{/* Graph */}

<div className="homepage-analytics-box">

  <h2 className="homepage-section-title">
    Campus Analytics
  </h2>

  <div className="homepage-analytics-tabs">

    <button
      className={analyticsView === "today" ? "active" : ""}
      onClick={() => setAnalyticsView("today")}
    >
      Today
    </button>

    <button
      className={analyticsView === "week" ? "active" : ""}
      onClick={() => setAnalyticsView("week")}
    >
      This Week
    </button>

    <button
      className={analyticsView === "month" ? "active" : ""}
      onClick={() => setAnalyticsView("month")}
    >
      This Month
    </button>


   <button
  className={analyticsView === "custom" ? "active" : ""}
  onClick={() => {
    setAnalyticsView("custom");

    setTimeout(() => {
      dateInputRef.current?.showPicker?.();
    }, 100);
  }}
>
  Custom Date
</button>

<input
  ref={dateInputRef}
  type="date"
  value={selectedDate}
  onChange={(e) => setSelectedDate(e.target.value)}
  className="homepage-hidden-date-picker"
/>
     

  </div>

  {/* TODAY */}

  {analyticsView === "today" && (
    <>
      <div className="homepage-analytics-summary">

        <div className="homepage-summary-card">
          <span>Total Scans</span>
          <h3>{todayStats.totalScans}</h3>
        </div>

        <div className="homepage-summary-card">
          <span>Peak Hour</span>
          <h3>{todayStats.peakHour}</h3>
        </div>

        <div className="homepage-summary-card">
          <span>Average/Hour</span>
          <h3>{todayStats.average}</h3>
        </div>

      </div>

      <div className="homepage-analytics-content">

        <ResponsiveContainer width="100%" height={300}>
        
          <LineChart data={todayData}>

            <CartesianGrid
              vertical={false}
              stroke="rgba(255,255,255,.08)"
            />

            <XAxis
              dataKey="time"
              tick={{ fill: "#94a3b8" }}
            />

            <YAxis
              tick={{ fill: "#94a3b8" }}
            />

            <Tooltip
              contentStyle={{
                background: "rgba(10,20,50,.95)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(56,189,248,.3)",
                borderRadius: "14px",
                boxShadow: "0 0 25px rgba(0,140,255,.15)"
              }}
              labelStyle={{
                color: "#60a5fa",
                fontWeight: 600
              }}
              itemStyle={{
                color: "#ffffff"
              }}
            />

            <Line
              type="monotone"
              dataKey="scans"
              stroke="#38bdf8"
              strokeWidth={4}
              dot={{
                fill: "#38bdf8",
                stroke: "#ffffff",
                strokeWidth: 2,
                r: 5
              }}
              activeDot={{
                r: 8,
                fill: "#38bdf8",
                stroke: "#ffffff",
                strokeWidth: 3
              }}
            />

          </LineChart>
        </ResponsiveContainer>
{todayData.length === 0 && (
  <p className="homepage-no-data">
    No logs recorded today
  </p>
)}

<div className="homepage-graph-date">
  {new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })}
</div>

      </div>
    </>
  )}

  

{analyticsView === "custom" && (
  <>

    <div className="homepage-analytics-summary">

      <div className="homepage-summary-card">
        <span>Total Scans</span>
        <h3>{customStats.totalScans}</h3>
      </div>

      <div className="homepage-summary-card">
        <span>Peak Hour</span>
        <h3>{customStats.peakHour}</h3>
      </div>

      <div className="homepage-summary-card">
        <span>Average/Hour</span>
        <h3>{customStats.average}</h3>
      </div>

    </div>

    <div className="homepage-analytics-content">

      <ResponsiveContainer
        width="100%"
        height={300}
      >
        <LineChart data={customData}>

          <CartesianGrid
            vertical={false}
            stroke="rgba(255,255,255,.08)"
          />

         <XAxis
  dataKey="time"
  tick={{ fill: "#94a3b8" }}
/>

<YAxis
  tick={{ fill: "#94a3b8" }}
/>
         <Tooltip
  contentStyle={{
    background: "rgba(10,20,50,.95)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(56,189,248,.3)",
    borderRadius: "14px",
    boxShadow: "0 0 25px rgba(0,140,255,.15)"
  }}
  labelStyle={{
    color: "#60a5fa",
    fontWeight: 600
  }}
  itemStyle={{
    color: "#ffffff"
  }}
/>
          <Line
            type="monotone"
            dataKey="scans"
            stroke="#38bdf8"
            strokeWidth={4}
          />

        </LineChart>
      </ResponsiveContainer>

      {customData.length === 0 && (
        <p className="homepage-no-data">
          No logs found for selected date
        </p>
      )}

      <div className="homepage-graph-date">
        {new Date(selectedDate).toLocaleDateString(
          "en-IN",
          {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          }
        )}
      </div>

    </div>

  </>
)}




{/* WEEK */}

{analyticsView === "week" && (
  <>
    <div className="homepage-analytics-summary">

      <div className="homepage-summary-card">
        <span>Weekly Scans</span>
        <h3>{weekStats.totalScans}</h3>
      </div>

      <div className="homepage-summary-card">
        <span>Busiest Day</span>
        <h3>{weekStats.peakDay}</h3>
      </div>

      <div className="homepage-summary-card">
        <span>Daily Average</span>
        <h3>{weekStats.average}</h3>
      </div>

    </div>

    <div className="homepage-analytics-content">

      <ResponsiveContainer width="100%" height={300}>
  <BarChart
  data={weekData}
  onClick={(state) => {

    if (!state?.activeLabel) return;

    const item = weekData.find(
      d => d.day === state.activeLabel
    );

    if (!item) return;

    setSelectedWeekInfo(
      `${item.date} • ${item.scans} ${
        item.scans === 1 ? "scan" : "scans"
      }`
    );

  }}
>

          <CartesianGrid
            vertical={false}
            stroke="rgba(255,255,255,.08)"
          />

          <XAxis
            dataKey="day"
            tick={{ fill: "#94a3b8" }}
          />

          <YAxis
            tick={{ fill: "#94a3b8" }}
          />

       <Tooltip cursor={false} content={() => null} />

         <Bar
  dataKey="scans"
  fill="#38bdf8"
  radius={[8,8,0,0]}

/>
        </BarChart>
      </ResponsiveContainer>


      {weekData.every(item => item.scans === 0) && (
  <p className="homepage-no-data">
    No scans recorded this week
  </p>
)}

<div className="homepage-graph-date">
  {selectedWeekInfo}
</div>

    </div>
  </>
)}



{/* MONTH */}

{analyticsView === "month" && (
  <>
    <div className="homepage-analytics-summary">

      <div className="homepage-summary-card">
        <span>Monthly Scans</span>
        <h3>{monthStats.totalScans}</h3>
      </div>

      <div className="homepage-summary-card">
        <span>Peak Week</span>
        <h3>{monthStats.peakWeek}</h3>
      </div>

      <div className="homepage-summary-card">
        <span>Weekly Average</span>
        <h3>{monthStats.average}</h3>
      </div>

    </div>

    <div className="homepage-analytics-content">

      <ResponsiveContainer width="100%" height={300}>
  <BarChart
    data={monthData}
    onClick={(state) => {

      if (!state?.activeLabel) return;

      const item = monthData.find(
        d => d.week === state.activeLabel
      );

      if (!item) return;

      setSelectedMonthWeek(
        `${item.range} • ${item.scans} ${
          item.scans === 1
            ? "scan"
            : "scans"
        }`
      );

    }}
  >

    <CartesianGrid
      vertical={false}
      stroke="rgba(255,255,255,.08)"
    />

    <XAxis
      dataKey="week"
      tick={{ fill: "#94a3b8" }}
    />

    <YAxis
      tick={{ fill: "#94a3b8" }}
    />

    <Tooltip
      cursor={false}
      content={() => null}
    />

    <Bar
      dataKey="scans"
      fill="#38bdf8"
      radius={[8, 8, 0, 0]}
    />

  </BarChart>
</ResponsiveContainer>

      <div className="homepage-graph-date">
  {selectedMonthWeek}
</div>

      


      {monthData.every(item => item.scans === 0) && (
  <p className="homepage-no-data">
    No scans recorded this month
  </p>
)}



    </div>
  </>
)}


  

</div>
</section>


<section className="homepage-tech-section">

  <h2 className="homepage-section-title">
    Technology Stack
  </h2>

  <div className="homepage-tech-main-card">

    {/* Frontend */}
    <div className="homepage-tech-category">
      <h3>Frontend</h3>

      <div className="homepage-tech-icons">

        <img src={reactLogo} alt="React" />
        <img src={viteLogo} alt="Vite" />
        <img src={jsLogo} alt="JavaScript" />
        <img src={htmlLogo} alt="HTML" />
        <img src={cssLogo} alt="CSS" />

      </div>
    </div>

    {/* Backend */}
    <div className="homepage-tech-category">
      <h3>Backend</h3>

      <div className="homepage-tech-icons">

        <img src={pythonLogo} alt="Python" />
        <img src={fastapiLogo} alt="FastAPI" />
        <img src={flaskLogo} alt="Flask" />

      </div>
    </div>

    {/* Database */}
    <div className="homepage-tech-category">
      <h3>Database & Stroage</h3>

      <div className="homepage-tech-icons">

        <img src={mongodbLogo} alt="MongoDB" />
        <img src={cloudinaryLogo} alt="Cloudinary" />


      </div>
    </div>

    {/* AI & Vision */}
    <div className="homepage-tech-category">
      <h3>AI & Vision</h3>

      <div className="homepage-tech-icons">

        <img src={opencvLogo} alt="OpenCV" />
        <img src={faceLogo} alt="Face Recognition" />

      </div>
    </div>

    {/* Mobile */}
    <div className="homepage-tech-category">
      <h3>Mobile App</h3>

      <div className="homepage-tech-icons">

        <img src={expoLogo} alt="Expo" />
        <img src={androidLogo} alt="Android" />


      </div>
    </div>

    {/* Tools */}
    <div className="homepage-tech-category">
      <h3>Tools & Services</h3>

      <div className="homepage-tech-icons">

        <img src={gitLogo} alt="Git" />
        <img src={githubLogo} alt="GitHub" />
        <img src={postmanLogo} alt="Postman" />
        <img src={vscodeLogo} alt="VSCode" />
        <img src={googleLogo} alt="Google OAuth" />

      </div>
    </div>

  </div>

</section>

     
      

<section
  className="homepage-showcase-section"
  data-aos="fade-up"
>


  <h2 className="homepage-section-title">
    VisionGate In Action
  </h2>

  <p className="homepage-showcase-subtitle">
    Explore the core modules powering
    secure campus monitoring and
    intelligent access control.
  </p>

<Tilt
  tiltMaxAngleX={8}
  tiltMaxAngleY={8}
  perspective={1500}
  scale={1.02}
  glareEnable={true}
  glareMaxOpacity={0.12}
>
  <div
    className={`homepage-showcase-slide ${
    fade ? "show" : "hide"
  }`}
    onClick={(e) => {

      const rect =
        e.currentTarget.getBoundingClientRect();

      const clickX =
        e.clientX - rect.left;

      if (clickX < rect.width / 2) {

        setCurrentSlide(prev =>
          prev === 0
            ? screenshots.length - 1
            : prev - 1
        );

      } else {

        setCurrentSlide(prev =>
          prev === screenshots.length - 1
            ? 0
            : prev + 1
        );

      }

    }}
  >
  <img
    src={screenshots[currentSlide].image}
    alt={screenshots[currentSlide].title}
  />

  <div className="homepage-showcase-content">

    <h3>
      {screenshots[currentSlide].title}
    </h3>

    <p>
      {screenshots[currentSlide].description}
    </p>

  </div>

</div>
</Tilt>






</section>
      <Footer />

    </div>
  );
}

export default Home;