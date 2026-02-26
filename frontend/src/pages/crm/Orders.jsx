import { useEffect, useState } from "react";
import { addOrderApi, getOrdersApi } from "../../services/crmApi";

export default function Orders() {
  const [tab, setTab] = useState("Sales");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    product: "",
    qty: "",
    price: ""
  });

  // ================= LOAD ORDERS =================
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getOrdersApi();
      setOrders(res?.data?.data || []);
    } catch (err) {
      console.log("Orders API not ready → Local mode");
    } finally {
      setLoading(false);
    }
  };

  // ================= ADD ORDER =================
  const addOrder = async () => {
    if (!form.name || !form.product || !form.qty || !form.price)
      return alert("Fill all fields");

    const total = Number(form.qty) * Number(form.price);

    const newOrder = {
      ...form,
      total,
      type: tab,
      status: "Completed",
      date: new Date().toLocaleDateString()
    };

    try {
      const res = await addOrderApi(newOrder);
      const savedOrder = res?.data?.data;
      if (savedOrder) {
        setOrders([savedOrder, ...orders]);
      }
    } catch (err) {
      // fallback local mode
      const localOrder = { ...newOrder, id: Date.now() };
      setOrders([localOrder, ...orders]);
    }

    setForm({ name: "", product: "", qty: "", price: "" });
  };

  // ================= DELETE ORDER =================
  const deleteOrder = (id) => {
    const updated = orders.filter((o) => (o._id || o.id) !== id);
    setOrders(updated);
  };

  // ================= STATS =================
  const totalSales = orders
    .filter((o) => o.type === "Sales")
    .reduce((a, b) => a + Number(b.total || 0), 0);

  const totalPurchase = orders
    .filter((o) => o.type === "Purchase")
    .reduce((a, b) => a + Number(b.total || 0), 0);

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold">Orders Management 💰</h1>
        <p className="text-green-100">Manage Sales & Purchase Orders</p>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Total Sales</p>
          <h2 className="text-xl font-bold text-green-600">₹ {totalSales}</h2>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Total Purchase</p>
          <h2 className="text-xl font-bold text-blue-600">₹ {totalPurchase}</h2>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4">
        <button
          onClick={() => setTab("Sales")}
          className={`px-4 py-2 rounded ${
            tab === "Sales" ? "bg-green-600 text-white" : "bg-gray-200"
          }`}
        >
          Sales Orders
        </button>

        <button
          onClick={() => setTab("Purchase")}
          className={`px-4 py-2 rounded ${
            tab === "Purchase" ? "bg-green-600 text-white" : "bg-gray-200"
          }`}
        >
          Purchase Orders
        </button>
      </div>

      {/* Add Order */}
      <div className="bg-white p-5 rounded-xl shadow-md grid grid-cols-4 gap-4">
        <input
          className="border p-2 rounded"
          placeholder="Customer / Supplier"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          className="border p-2 rounded"
          placeholder="Product"
          value={form.product}
          onChange={(e) => setForm({ ...form, product: e.target.value })}
        />

        <input
          type="number"
          className="border p-2 rounded"
          placeholder="Qty"
          value={form.qty}
          onChange={(e) => setForm({ ...form, qty: e.target.value })}
        />

        <input
          type="number"
          className="border p-2 rounded"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />

        <button
          onClick={addOrder}
          className="col-span-4 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          + Add Order
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-600 text-sm">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Product</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Price</th>
              <th className="p-3">Total</th>
              <th className="p-3">Date</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center p-6">
                  Loading...
                </td>
              </tr>
            ) : (
              orders
                .filter((o) => o.type === tab)
                .map((o) => (
                  <tr key={o._id || o.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{o.name}</td>
                    <td className="p-3">{o.product}</td>
                    <td className="p-3">{o.qty}</td>
                    <td className="p-3">₹ {o.price}</td>
                    <td className="p-3 font-semibold text-green-600">
                      ₹ {o.total}
                    </td>
                    <td className="p-3 text-sm text-gray-500">{o.date}</td>
                    <td className="p-3">
                      <button
                        onClick={() => deleteOrder(o._id || o.id)}
                        className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200"
                      >
                        Delete
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