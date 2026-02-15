import { useEffect, useState } from "react";
import api from "../../services/api";

export default function Attendance() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  // 🔹 Check today's status on load
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await api.get("/attendance/my-history");

        const today = new Date().toISOString().split("T")[0];

        const todayRecord = res.data.data.find((r) =>
          r.date.startsWith(today)
        );

        if (todayRecord && todayRecord.in_time && !todayRecord.out_time) {
          setIsCheckedIn(true);
          setMsg("You are already checked in today");
        }
      } catch (err) {
        console.log(err);
      }
    };

    checkStatus();
  }, []);

  // 🔹 Check-In
  const handleCheckIn = async () => {
    if (!navigator.geolocation) {
      setMsg("Geolocation not supported");
      return;
    }

    setLoading(true);
    setMsg("Getting location...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await api.post("/attendance/check-in", {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            device: navigator.userAgent,
          });

          setIsCheckedIn(true);
          setMsg("✅ Check-in successful");
        } catch (err) {
          setMsg(err.response?.data?.message || "Check-in failed");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setMsg("Location permission denied");
        setLoading(false);
      }
    );
  };

  // 🔹 Check-Out
  const handleCheckOut = async () => {
    setLoading(true);
    setMsg("Processing check-out...");

    try {
      await api.post("/attendance/check-out");
      setIsCheckedIn(false);
      setMsg("✅ Check-out successful");
    } catch (err) {
      setMsg(err.response?.data?.message || "Check-out failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Employee Attendance</h2>

      {/* 🔹 Button Toggle */}
      <button
        onClick={isCheckedIn ? handleCheckOut : handleCheckIn}
        disabled={loading}
        style={{
          padding: "12px 20px",
          fontSize: "16px",
          background: isCheckedIn ? "#f44336" : "#4CAF50",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        {loading
          ? "Processing..."
          : isCheckedIn
          ? "Check-Out"
          : "Mark Attendance (Check-In)"}
      </button>

      <p style={{ marginTop: "20px" }}>{msg}</p>
    </div>
  );
}
