import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import InternLayout from "../../components/InternLayout";
import api from "../../services/api";

export default function EmployeeProfile() {
  const userLocal = JSON.parse(localStorage.getItem("user") || "{}");

  const [form, setForm] = useState({
    name: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setForm({
      name: userLocal.name || "",
      email: userLocal.email || "",
    });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ===== SAVE PROFILE =====
  const handleSave = async () => {
    try {
      setLoading(true);
      setMsg("");

      const res = await api.put("/users/update-me", form);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setMsg("✅ Profile updated successfully");
    } catch (err) {
      setMsg("❌ Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <InternLayout>
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-indigo-50 via-white to-indigo-100">

        {/* MAIN CARD */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-lg backdrop-blur-lg bg-white/80 shadow-2xl rounded-3xl p-8 border border-white/40"
        >
          {/* AVATAR */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {userLocal.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <h1 className="text-xl font-bold mt-3 text-gray-800">
              {userLocal.name || "Employee"}
            </h1>

            <p className="text-sm text-gray-500">
              {userLocal.role}
            </p>
          </div>

          {/* NAME */}
          <div className="mb-4">
            <label className="text-sm text-gray-500">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-200 bg-white rounded-xl p-2 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* EMAIL */}
          <div className="mb-5">
            <label className="text-sm text-gray-500">Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-200 bg-white rounded-xl p-2 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* BUTTONS */}
          <div className="flex gap-3 mt-6">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:opacity-95 text-white py-2 rounded-xl shadow-lg font-semibold"
            >
              {loading ? "Saving..." : "Save Changes"}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => window.location.reload()}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-xl shadow"
            >
              Cancel
            </motion.button>
          </div>

          {/* MESSAGE */}
          {msg && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-center text-sm text-gray-600"
            >
              {msg}
            </motion.p>
          )}

          {/* FOOTER */}
          <motion.div
            className="text-center text-xs mt-6 text-gray-400"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            Employee Profile ⚡
          </motion.div>
        </motion.div>
      </div>
    </InternLayout>
  );
}
