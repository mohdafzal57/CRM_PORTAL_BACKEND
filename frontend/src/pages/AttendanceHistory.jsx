import { useEffect, useState } from "react";
import { getMyAttendanceHistory } from "../services/attendance.service";

const AttendanceHistory = () => {
  const [records, setRecords] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadData();
  }, [page]);

  const loadData = async () => {
    try {
      const res = await getMyAttendanceHistory(page);
      setRecords(res.data.data);
    } catch (err) {
      alert("Failed to load attendance history");
    }
  };

  return (
    <div>
      <h2>My Attendance History</h2>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Date</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Status</th>
            <th>Work Hours</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r._id}>
              <td>{new Date(r.date).toDateString()}</td>
              <td>{r.checkIn?.time ? new Date(r.checkIn.time).toLocaleTimeString() : "-"}</td>
              <td>{r.checkOut?.time ? new Date(r.checkOut.time).toLocaleTimeString() : "-"}</td>
              <td>{r.status}</td>
              <td>{r.workHours} mins</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={() => setPage(page - 1)} disabled={page === 1}>
        Prev
      </button>
      <button onClick={() => setPage(page + 1)}>
        Next
      </button>
    </div>
  );
};

export default AttendanceHistory;
