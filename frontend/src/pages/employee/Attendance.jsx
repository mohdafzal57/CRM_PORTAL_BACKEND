import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import InternLayout from "../../components/InternLayout";
import api from "../../services/api";

export default function Attendance() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Not Checked-In");
  const [checkedIn, setCheckedIn] = useState(false);
  const [message, setMessage] = useState("");

  // ================= FETCH TODAY =================
  const fetchTodayStatus = async () => {
    try {
      const res = await api.get("/attendance/my-history");
      const records = res.data.data || [];

      const today = new Date().toISOString().split("T")[0];
      const todayRecord = records.find((r) => r.date.startsWith(today));

      if (todayRecord) {
        if (todayRecord.in_time && !todayRecord.out_time) {
          setStatus("Checked-In");
          setCheckedIn(true);
        } else if (todayRecord.in_time && todayRecord.out_time) {
          setStatus("Completed");
          setCheckedIn(false);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchTodayStatus();
  }, []);

  // ================= MARK ATTENDANCE =================
  const handleAttendance = async () => {
    try {
      setLoading(true);
      setMessage("");

      const endpoint = checkedIn
        ? "/attendance/check-out"
        : "/attendance/check-in";

      const res = await api.post(endpoint);

      setMessage(res.data.message || "Success");
      fetchTodayStatus();
    } catch (err) {
      setMessage("❌ Failed. Try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <InternLayout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-indigo-100 dark:from-[#020617] dark:to-[#020617]">

        {/* GLASS CARD */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md backdrop-blur-xl bg-white/70 dark:bg-[#0f172a]/80 shadow-2xl rounded-3xl p-8 border border-white/30 dark:border-slate-700"
        >
          {/* TITLE */}
          <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
            Employee Attendance
          </h1>

          {/* STATUS BADGE */}
          <div className="flex justify-center mb-6">
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                status === "Checked-In"
                  ? "bg-green-100 text-green-700"
                  : status === "Completed"
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {status}
            </span>
          </div>

          {/* BUTTON */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleAttendance}
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-semibold shadow-lg transition ${
              checkedIn
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {loading
              ? "Processing..."
              : checkedIn
              ? "Check Out"
              : "Mark Attendance (Check-In)"}
          </motion.button>

          {/* MESSAGE */}
          {message && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-sm mt-4 text-gray-600 dark:text-gray-300"
            >
              {message}
            </motion.p>
          )}

          {/* FOOTER ANIMATION */}
          <motion.div
            className="mt-6 text-center text-xs text-gray-400"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            Smart Attendance System ⚡
          </motion.div>
        </motion.div>
      </div>
    </InternLayout>
  );
}
