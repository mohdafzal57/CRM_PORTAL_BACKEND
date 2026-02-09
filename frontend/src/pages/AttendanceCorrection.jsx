import { useState } from "react";
import { requestAttendanceCorrection } from "../services/attendance.service";

const AttendanceCorrection = () => {
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");

  const submitRequest = async () => {
    if (!date || !reason) {
      return alert("All fields required");
    }

    try {
      await requestAttendanceCorrection({ date, reason });
      alert("Correction request submitted");
      setDate("");
      setReason("");
    } catch (err) {
      alert(err.response?.data?.message || "Request failed");
    }
  };

  return (
    <div>
      <h2>Attendance Correction Request</h2>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <br />

      <textarea
        placeholder="Reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />

      <br />

      <button onClick={submitRequest}>Submit</button>
    </div>
  );
};

export default AttendanceCorrection;
