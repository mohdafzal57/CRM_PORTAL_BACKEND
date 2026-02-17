import { useEffect, useState } from "react";
import InternLayout from "../../components/InternLayout";
import api from "../../services/api";

export default function EmployeeReports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await api.get("/intern/reports");
      setReports(res.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <InternLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Work Reports 📊</h1>

        <div className="grid gap-4">
          {reports.length === 0 ? (
            <div className="bg-white p-6 rounded-xl shadow text-gray-500">
              No reports submitted yet.
            </div>
          ) : (
            reports.map((r) => (
              <div key={r._id} className="bg-white p-5 rounded-xl shadow border">
                <h2 className="font-semibold">{r.title}</h2>
                <p className="text-gray-600 mt-1">{r.description}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(r.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </InternLayout>
  );
}
