import { useEffect, useState } from "react";
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
    YAxis
} from "recharts";

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [todayStatus, setTodayStatus] = useState("Absent");
  const [workHours, setWorkHours] = useState("0 hrs");
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [liveTime, setLiveTime] = useState("0.0 hrs");
  const [monthlyData, setMonthlyData] = useState([]);

  // ================= LIVE TIMER =================
  const startLiveTimer = (checkInTime) => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = (now - checkInTime) / (1000 * 60 * 60);
      setLiveTime(diff.toFixed(2) + " hrs");
    }, 60000);

    return () => clearInterval(interval);
  };

  // ================= FETCH TODAY =================
  const fetchToday = async () => {
    try {
      const res = await api.get("/attendance/my-history");
      const records = res.data.data || [];

      const today = new Date().toISOString().split("T")[0];

      const todayRecord = records.find((r) =>
        r.date.startsWith(today)
      );

      if (todayRecord) {
        setTodayStatus(todayRecord.status || "Present");

        // LIVE running
        if (todayRecord.in_time && !todayRecord.out_time) {
          setIsCheckedIn(true);
          startLiveTimer(new Date(todayRecord.in_time));
        }

        // Completed day
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
      const res = await api.get("/attendance/my-history");
      const records = res.data.data || [];

      const month = new Date().getMonth();
      const year = new Date().getFullYear();

      const monthly = records.filter((r) => {
        const d = new Date(r.date);
        return d.getMonth() === month && d.getFullYear() === year;
      });

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
    }
  };

  useEffect(() => {
    fetchToday();
    fetchMonthly();
  }, []);

  // ================= UI =================
  return (
    <InternLayout>
      <div className="min-h-screen bg-gray-100 p-6">

        {/* Header */}
        <h1 className="text-2xl font-bold mb-6">
          Welcome, {user.name || "Employee"} 👋
        </h1>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          {/* Status */}
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-500 text-sm">Today's Status</p>
            <h2 className="text-xl font-bold mt-2">{todayStatus}</h2>
          </div>

          {/* Work Hours */}
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-500 text-sm">Work Hours</p>
            <h2 className="text-xl font-bold mt-2">
              {isCheckedIn ? liveTime : workHours}
            </h2>
          </div>

          {/* Role */}
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-500 text-sm">Role</p>
            <h2 className="text-xl font-bold mt-2">{user.role}</h2>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Quick Actions</h2>

          <div className="flex flex-wrap gap-4">

            <button
              onClick={() => navigate("/employee/attendance")}
              className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg"
            >
              Mark Attendance
            </button>

            <button
              onClick={() => navigate("/employee/history")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg"
            >
              Attendance History
            </button>

            <button
              onClick={() => navigate("/employee/correction")}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-lg"
            >
              Correction Request
            </button>

            <button
              onClick={() => navigate("/employee/profile")}
              className="bg-purple-500 hover:bg-purple-600 text-white px-5 py-2 rounded-lg"
            >
              My Profile
            </button>

          </div>
        </div>

        {/* Monthly Graph */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-bold mb-4">Monthly Work Hours</h2>

          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="hrs"
                stroke="#4f46e5"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>
    </InternLayout>
  );
}
