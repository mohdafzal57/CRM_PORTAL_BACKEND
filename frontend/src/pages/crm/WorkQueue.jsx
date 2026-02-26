import { useEffect, useState } from "react";
// WorkQueue.jsx


export default function WorkQueue() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    assignedTo: "",
    priority: "Medium",
    dueDate: ""
  });

  // ================= LOAD TASKS FROM API =================
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await getWorkQueue();
      setTasks(res.data.data || []);
    } catch (err) {
      console.log("WorkQueue fetch error → using local mode");
    } finally {
      setLoading(false);
    }
  };

  // ================= ADD TASK =================
  const addTask = async () => {
    if (!form.title) return alert("Task title required");

    const newTask = {
      ...form,
      status: "Pending"
    };

    try {
      // Try backend
      const res = await addWorkTask(newTask);
      setTasks([res.data.data, ...tasks]);
    } catch (err) {
      // fallback local mode
      const localTask = {
        ...newTask,
        id: Date.now()
      };
      setTasks([localTask, ...tasks]);
    }

    setForm({ title: "", assignedTo: "", priority: "Medium", dueDate: "" });
  };

  // ================= CHANGE STATUS =================
  const toggleStatus = (id) => {
    const updated = tasks.map((t) =>
      (t._id || t.id) === id
        ? { ...t, status: t.status === "Pending" ? "Completed" : "Pending" }
        : t
    );
    setTasks(updated);
  };

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold">Work Queue 📋</h1>
        <p className="text-blue-100">Manage tasks and team assignments</p>
      </div>

      {/* Add Task */}
      <div className="bg-white p-5 rounded-xl shadow-md grid grid-cols-4 gap-4">
        <input
          className="border p-2 rounded"
          placeholder="Task Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <input
          className="border p-2 rounded"
          placeholder="Assigned To"
          value={form.assignedTo}
          onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
        />

        <select
          className="border p-2 rounded"
          value={form.priority}
          onChange={(e) => setForm({ ...form, priority: e.target.value })}
        >
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>

        <input
          type="date"
          className="border p-2 rounded"
          value={form.dueDate}
          onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
        />

        <button
          onClick={addTask}
          className="col-span-4 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
        >
          + Add Task
        </button>
      </div>

      {/* Task Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-600 text-sm">
            <tr>
              <th className="p-3">Task</th>
              <th className="p-3">Assigned</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Due</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center p-6">
                  Loading...
                </td>
              </tr>
            ) : tasks.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-6 text-gray-400">
                  No tasks yet
                </td>
              </tr>
            ) : (
              tasks.map((t) => (
                <tr key={t._id || t.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{t.title}</td>

                  <td className="p-3">{t.assignedTo}</td>

                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium 
                      ${t.priority === "High" ? "bg-red-100 text-red-600" :
                        t.priority === "Medium" ? "bg-yellow-100 text-yellow-600" :
                        "bg-green-100 text-green-600"}`}>
                      {t.priority}
                    </span>
                  </td>

                  <td className="p-3 text-sm text-gray-500">
                    {t.dueDate || "-"}
                  </td>

                  <td className="p-3">
                    <span className={`font-medium ${
                      t.status === "Completed"
                        ? "text-green-600"
                        : "text-indigo-600"
                    }`}>
                      {t.status}
                    </span>
                  </td>

                  <td className="p-3">
                    <button
                      onClick={() => toggleStatus(t._id || t.id)}
                      className="text-xs bg-indigo-100 text-indigo-600 px-3 py-1 rounded hover:bg-indigo-200"
                    >
                      Toggle
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}