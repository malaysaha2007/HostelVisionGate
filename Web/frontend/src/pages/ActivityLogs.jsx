import { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import API from "../services/api";
import { FaSyncAlt, FaSearch, FaFilter, FaHistory, FaUndo } from "react-icons/fa";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AdminPortalHeader from "../components/AdminPortalHeader";

import "../styles/ActivityLogs.css";

const ROLE_CONFIGS = {
  "Director": {
    letter: "D",
    label: "Director",
    className: "director-avatar",
  },

  "Guard": {
    letter: "G",
    label: "Guard",
    className: "guard-avatar",
  },

  "Dean Academic": {
    letter: "DA",
    label: "Dean Academic",
    className: "dean-avatar",
  },

  "Hostel Warden": {
    letter: "W",
    label: "Warden",
    className: "warden-avatar",
  },
};

const ACTION_CONFIGS = {
  ENTRY: { label: "Entry Approved", color: "green", dot: "🟢" },
  EXIT: { label: "Exit Recorded", color: "red", dot: "🔴" },
  LOGIN: { label: "System Login", color: "blue", dot: "🔵" },
  CURFEW_MAIL_SENT: { label: "Curfew Mail Sent", color: "orange", dot: "🟠" },
  COMMENT_ADDED: { label: "Comment Logged", color: "purple", dot: "🟣" },
  VACATION: { label: "Vacation Approved", color: "cyan", dot: "🔵" },
  DELETE: { label: "Record Deleted", color: "crimson", dot: "🔴" }
};

function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const location = useLocation();
  const admin = location.state?.admin;

  // Filter States
  const [roleFilter, setRoleFilter] = useState("All");
  const [hostelFilter, setHostelFilter] = useState("All");
  const [actionFilter, setActionFilter] = useState("All");
  const [search, setSearch] = useState("");

  const fetchLogs = async () => {
    setRefreshing(true);
    try {
      const response = await API.get("/activity-logs");
      setLogs(response.data.logs || []);
    } catch (error) {
      console.error("SOC Error fetching logs:", error);
    } finally {
      setLoading(false);
      setTimeout(() => setRefreshing(false), 300);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // 1. Dynamic Metric Computations (Derived Client-Side)
  const metrics = useMemo(() => {
    const total = logs.length;
    
    // Find today's date format matching backend timestamps
    const todayStr = new Date().toLocaleDateString("en-GB").replaceAll("/", "-");
    const todayLogs = logs.filter(log => log.timestamp?.includes(todayStr));
    const todayCount = todayLogs.length;

    // Calculate Most Active Role
    const roleCounts = logs.reduce((acc, log) => {
      if (log.role) acc[log.role] = (acc[log.role] || 0) + 1;
      return acc;
    }, {});
    
    let activeRole = "N/A";
    let maxActions = 0;
    Object.entries(roleCounts).forEach(([role, count]) => {
      if (count > maxActions) {
        maxActions = count;
        activeRole = role;
      }
    });

    // Calculate Mini-Chart Actions distribution
    const actionCounts = { ENTRY: 0, EXIT: 0, CURFEW: 0, OTHER: 0 };
    logs.forEach(log => {
      if (log.action_type === "ENTRY") actionCounts.ENTRY++;
      else if (log.action_type === "EXIT") actionCounts.EXIT++;
      else if (log.action_type === "CURFEW_MAIL_SENT") actionCounts.CURFEW++;
      else actionCounts.OTHER++;
    });

    // Latest action label
    const latestTime = logs[0] ? "Just Now" : "No Activity";

    return { total, todayCount, activeRole, maxActions, latestTime, actionCounts };
  }, [logs]);

  // 2. Client-Side Real-Time Filter Logic
  const filteredLogs = logs.filter((log) => {
    const roleMatch = roleFilter === "All" || log.role === roleFilter;
    const hostelMatch = hostelFilter === "All" || log.hostel === hostelFilter;
    const actionMatch = actionFilter === "All" || log.action_type === actionFilter;
    
    const query = search.toLowerCase();
    const searchMatch =
      (log.role || "").toLowerCase().includes(query) ||
      (log.hostel || "").toLowerCase().includes(query) ||
      (log.action_type || "").toLowerCase().includes(query) ||
      (log.description || "").toLowerCase().includes(query);

    return roleMatch && hostelMatch && actionMatch && searchMatch;
  });

  // 3. Temporal Feed Grouping (Today / Yesterday / Older)
  const groupedLogs = useMemo(() => {
    const todayStr = new Date().toLocaleDateString("en-GB").replaceAll("/", "-");
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString("en-GB").replaceAll("/", "-");

    const groups = { Today: [], Yesterday: [], Older: [] };

    filteredLogs.forEach(log => {
      if (log.timestamp?.includes(todayStr)) {
        groups.Today.push(log);
      } else if (log.timestamp?.includes(yesterdayStr)) {
        groups.Yesterday.push(log);
      } else {
        groups.Older.push(log);
      }
    });

    return groups;
  }, [filteredLogs]);

  const resetFilters = () => {
    setRoleFilter("All");
    setHostelFilter("All");
    setActionFilter("All");
    setSearch("");
  };

  const getActionDetails = (actionType) => {
    return ACTION_CONFIGS[actionType] || { label: actionType, color: "default", dot: "⚪" };
  };

  const getRoleIcon = (role) => {
    return ROLE_CONFIGS[role]?.icon || "";
  };

  return (
    <>
      <Navbar admin={admin} showAdminDashboard={true} showLogout={true} />
      <AdminPortalHeader admin={admin} />

      <div className={`soc-dashboard-container ${refreshing ? "feed-refreshing" : ""}`}>
        
      



        {/* Compact Single Row Toolbar */}
        <div className="soc-filter-toolbar">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search monitor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="dropdown-group">
            <div className="select-styled-container">
              <FaFilter className="inline-filter-icon" />
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="All">All Consoles</option>
                <option value="Director">Director</option>
                <option value="Dean Academic">Dean Academic</option>
                <option value="Guard">Guard</option>
              </select>
            </div>

            <div className="select-styled-container">
              <select value={hostelFilter} onChange={(e) => setHostelFilter(e.target.value)}>
                <option value="All">All Locations</option>
                <option value="Hostel 1">Hostel 1</option>
                <option value="Hostel 2">Hostel 2</option>
                <option value="Hostel 3">Hostel 3</option>
                <option value="Hostel 4">Hostel 4</option>
                <option value="Hostel 5">Hostel 5</option>
              </select>
            </div>

            <div className="select-styled-container">
              <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
                <option value="All">All Action Typologies</option>
                <option value="ENTRY">Entry Approved</option>
                <option value="EXIT">Exit Logged</option>
                <option value="CURFEW_MAIL_SENT">Mails Sent</option>
                <option value="COMMENT_ADDED">Comments Logged</option>
              </select>
            </div>
          </div>

          <div className="toolbar-action-buttons">
            <button onClick={resetFilters} className="soc-btn-secondary" title="Reset Filters">
              <FaUndo />
            </button>
            <button onClick={fetchLogs} className="soc-btn-primary" title="Sync Feed">
              <FaSyncAlt className={refreshing ? "spin-animation" : ""} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Modern Chronological Activity Stream Feed */}
        <div className="soc-activity-stream">
          {loading ? (
            <div className="soc-state-view">
              <div className="loader-pulse"></div>
              <p>Establishing secure socket connection to telemetry datastore...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="soc-state-view empty">
              <p>📭 Zero operations matched your specified filter variables.</p>
            </div>
          ) : (
            Object.entries(groupedLogs).map(([timeLabel, logsInGroup]) => {
              if (logsInGroup.length === 0) return null;
              return (
      
                 
                  
                  <div className="timeline-nodes-container">
                    {logsInGroup.map((log, index) => {
                      const actionDetails = getActionDetails(log.action_type);
                      return (
                        <div key={index} className={`timeline-card border-theme-${actionDetails.color}`}>



                          {/* Colored status line */}
                          <div className="status-indicator-bar"></div>




                         <div className="node-identity">
  <span
    className={`role-avatar ${
      ROLE_CONFIGS[log.role]?.className || "default-avatar"
    }`}
  >
    {ROLE_CONFIGS[log.role]?.letter || "?"}
  </span>

  <div className="identity-text">
    <h4>{ROLE_CONFIGS[log.role]?.label || log.role}</h4>

    <span className="location-tag">
      {log.hostel || "Global Core"}
    </span>
  </div>
</div>




                          {/* Center Column: Core Content Payload */}
                          <div className="node-payload">
                            <div className="badge-row">
                              <span className={`soc-badge badge-${actionDetails.color}`}>
                                {actionDetails.dot} {actionDetails.label}
                              </span>
                            </div>
                            <p className="payload-description">{log.description}</p>
                          </div>

                          {/* Right Column: Time Verification Metric */}
                          <div className="node-timestamp">
                            <span className="time-string">
                              {log.timestamp?.split(" ").slice(-2).join(" ") || log.timestamp}
                            </span>
                          
                          </div>
                          
                        </div>
                      );
                    })}
                  </div>
              );
            })
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ActivityLogs;