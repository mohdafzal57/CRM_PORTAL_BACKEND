import InternLayout from "../../components/InternLayout";

export default function EmployeeProfile() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <InternLayout>
      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-2xl font-bold mb-6">My Profile 👤</h1>

        <div className="bg-white shadow rounded-xl p-6 max-w-xl">
          <p className="mb-2"><b>Name:</b> {user.fullName || user.name}</p>
          <p className="mb-2"><b>Email:</b> {user.email}</p>
          <p className="mb-2"><b>Role:</b> {user.role}</p>
          <p className="mb-2"><b>User ID:</b> {user.id || "N/A"}</p>
        </div>
      </div>
    </InternLayout>
  );
}
