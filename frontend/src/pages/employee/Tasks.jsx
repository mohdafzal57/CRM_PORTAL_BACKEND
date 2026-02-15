import InternLayout from "../../components/InternLayout";

export default function EmployeeTasks() {
  return (
    <InternLayout>
      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-2xl font-bold mb-6">Daily Tasks 📋</h1>

        <div className="bg-white shadow rounded-xl p-6">
          <p className="text-gray-600">No tasks assigned yet.</p>
        </div>
      </div>
    </InternLayout>
  );
}
