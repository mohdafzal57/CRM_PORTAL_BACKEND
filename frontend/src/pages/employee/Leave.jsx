import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import InternLayout from "../../components/InternLayout";
import api from "../../services/api";

const Leave = () => {
	const [leaves, setLeaves] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		fetchLeaves();
	}, []);

	const fetchLeaves = async () => {
		try {
			setLoading(true);
			const response = await api.get("/api/leave");
			setLeaves(response.data || []);
		} catch (err) {
			setError(err.message);
			console.error("Error fetching leaves:", err);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<InternLayout>
				<div className="flex justify-center items-center h-screen">
					<p>Loading...</p>
				</div>
			</InternLayout>
		);
	}

	return (
		<InternLayout>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="p-6"
			>
				<h1 className="text-3xl font-bold mb-6">Leave Management</h1>

				{error && (
					<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
						{error}
					</div>
				)}

				<div className="grid grid-cols-1 gap-4">
					{leaves.length > 0 ? (
						leaves.map((leave) => (
							<motion.div
								key={leave._id}
								className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500"
								whileHover={{ scale: 1.02 }}
							>
								<h3 className="font-semibold text-lg">
									{leave.leaveType}
								</h3>
								<p className="text-gray-600">
									Status: {leave.status}
								</p>
								<p className="text-sm text-gray-500">
									From:{" "}
									{new Date(
										leave.startDate,
									).toLocaleDateString()}{" "}
									- To:{" "}
									{new Date(
										leave.endDate,
									).toLocaleDateString()}
								</p>
							</motion.div>
						))
					) : (
						<p className="text-gray-500">No leave records found.</p>
					)}
				</div>
			</motion.div>
		</InternLayout>
	);
};

export default Leave;
