import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import InternLayout from "../../components/InternLayout";
import api from "../../services/api";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // ================= STATES =================
  const [todayStatus, setTodayStatus] = useState("Absent");
  const [workHours, setWorkHours] = useState("0 hrs");
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [liveTime, setLiveTime] = useState("0.0 hrs");
  const [monthlyData, setMonthlyData] = useState([]);

  const [presentCount, setPresentCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);
  const [attendancePercent, setAttendancePercent] = useState(0);
  const [loading, setLoading] = useState(true);

  const timerRef = useRef(null);

  // ================= THEME =================
  const [dark, setDark] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  const toggleTheme = () => {
    const newTheme = !dark;
    setDark(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  // ================= LIVE TIMER =================
  const startLiveTimer = (checkInTime) => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      const now = new Date();
      const diff = (now - checkInTime) / (1000 * 60 * 60);
      setLiveTime(diff.toFixed(2) + " hrs");
    }, 60000);
  };

  // ================= FETCH TODAY =================
  const fetchToday = async () => {
    try {
      const res = await api.get("/attendance/my-history");
      const records = res.data.data || [];

      const today = new Date().toISOString().split("T")[0];
      const todayRecord = records.find((r) => r.date.startsWith(today));

      if (todayRecord) {
        setTodayStatus(todayRecord.status || "Present");

        if (todayRecord.in_time && !todayRecord.out_time) {
          setIsCheckedIn(true);
          startLiveTimer(new Date(todayRecord.in_time));
        }

        if (todayRecord.in_time && todayRecord.out_time) {
          const inTime = new Date(todayRecord.in_time);
          const outTime = new Date(todayRecord.out_time);
          const diff = (outTime - inTime) / (1000 * 60 * 60);
          setWorkHours(diff.toFixed(1) + " hrs");
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ================= FETCH MONTHLY =================
  const fetchMonthly = async () => {
    try {
      setLoading(true);

      const res = await api.get("/attendance/my-history");
      const records = res.data.data || [];

      const month = new Date().getMonth();
      const year = new Date().getFullYear();

      const monthly = records.filter((r) => {
        const d = new Date(r.date);
        return d.getMonth() === month && d.getFullYear() === year;
      });

      let present = 0;
      let absent = 0;

      monthly.forEach((r) => {
        if (r.status === "Present") present++;
        else absent++;
      });

      const totalDays = present + absent;
      const percent = totalDays
        ? ((present / totalDays) * 100).toFixed(0)
        : 0;

      setPresentCount(present);
      setAbsentCount(absent);
      setAttendancePercent(percent);

      const graphData = monthly.map((r) => {
        let hrs = 0;
        if (r.in_time && r.out_time) {
          const inTime = new Date(r.in_time);
          const outTime = new Date(r.out_time);
          hrs = (outTime - inTime) / (1000 * 60 * 60);
        }

        return {
          day: new Date(r.date).getDate(),
          hrs: Number(hrs.toFixed(2)),
        };
      });

      setMonthlyData(graphData);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ================= AUTO REFRESH =================
  useEffect(() => {
    fetchToday();
    fetchMonthly();

    const interval = setInterval(() => {
      fetchToday();
      fetchMonthly();
    }, 20000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      clearInterval(interval);
    };
  }, []);

  // ================= UI =================
  return (
    <InternLayout>
      <div
        className={`min-h-screen p-6 transition-all duration-300 ${
          dark
            ? "bg-[#020617]"
            : "bg-gradient-to-br from-indigo-50 via-white to-indigo-100"
        }`}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1
            className={`text-2xl font-bold ${
              dark ? "text-white" : "text-gray-800"
            }`}
          >
            Welcome, {user.name || "Employee"} 👋
          </h1>

          {/* THEME TOGGLE */}
          <button
            onClick={toggleTheme}
            className={`w-14 h-7 flex items-center rounded-full p-1 transition ${
              dark ? "bg-indigo-600" : "bg-gray-300"
            }`}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-md transform transition ${
                dark ? "translate-x-7" : ""
              }`}
            />
          </button>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card title="Today's Status" dark={dark}>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                todayStatus === "Present"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {todayStatus}
            </span>
          </Card>

          <Card title="Work Hours" dark={dark}>
            <h2 className="text-xl font-bold">
              {isCheckedIn ? liveTime : workHours}
            </h2>
          </Card>

          <Card title="Present Days" dark={dark}>
            <h2 className="text-xl font-bold text-green-600">
              {presentCount}
            </h2>
          </Card>

          <Card title="Attendance %" dark={dark}>
            <h2 className="text-xl font-bold text-indigo-600">
              {attendancePercent}%
            </h2>
          </Card>
        </div>

        {/* ACTIONS */}
        <div
          className={`p-6 rounded-2xl shadow-md border mb-6 ${
            dark
              ? "bg-[#0f172a] border-slate-700"
              : "bg-white border-gray-200"
          }`}
        >
          <button
            onClick={() => navigate("/employee/attendance")}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg mr-3"
          >
            Mark Attendance
          </button>

          <button
            onClick={() => navigate("/employee/profile")}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg"
          >
            My Profile
          </button>
        </div>

        {/* GRAPH */}
        <div
          className={`p-6 rounded-2xl shadow-md border ${
            dark
              ? "bg-[#0f172a] border-slate-700"
              : "bg-white border-gray-200"
          }`}
        >
          <h2
            className={`font-bold mb-4 ${
              dark ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Monthly Work Hours
          </h2>

          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="hrs"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </InternLayout>
  );
}

// ================= CARD =================
function Card({ title, children, dark }) {
  return (
    <div
      className={`p-5 rounded-2xl shadow-md border transition ${
        dark
          ? "bg-[#0f172a] border-slate-700 text-white"
          : "bg-white border-gray-200 text-gray-900"
      }`}
    >
      <p
        className={`text-sm ${
          dark ? "text-gray-400" : "text-gray-500"
        }`}
      >
        {title}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  );
}
