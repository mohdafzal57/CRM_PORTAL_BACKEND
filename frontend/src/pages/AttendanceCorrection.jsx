import { useState } from "react";
import { useToast } from "../context/ToastContext";
import { requestAttendanceCorrection } from "../services/attendance.service";

const AttendanceCorrection = () => {
  const { success: showSuccess, error: showError, warning: showWarning } = useToast();
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");

  const submitRequest = async () => {
    if (!date || !reason) {
      return showWarning("All fields required");
    }

    try {
      await requestAttendanceCorrection({ date, reason });
      showSuccess("Correction request submitted");
      setDate("");
      setReason("");
    } catch (err) {
      showError(err.response?.data?.message || "Request failed");
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
