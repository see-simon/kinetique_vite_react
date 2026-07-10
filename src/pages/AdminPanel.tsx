import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

interface Lead {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

interface Order {
  id: number;
  customer_id: string;
  customer_email?: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface Product {
  id: number;
  title: string;
  category: string;
  price: number;
  status: string;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }
    fetchData();
  };

const fetchData = async () => {
  const [ordersRes, productsRes, usersRes] = await Promise.all([
    supabase.from('orders').select('*, profiles(email)').order('created_at', { ascending: false }),
    supabase.from('products').select('*').order('created_at', { ascending: false }),
    supabase.from('profiles').select('*').order('created_at', { ascending: false })
  ])

  if (!ordersRes.error) {
    const ordersWithEmail = ordersRes.data?.map(order => ({
      ...order,
      customer_email: order.profiles?.email || ''
    })) || []
    setOrders(ordersWithEmail)
  }
  if (!productsRes.error) setProducts(productsRes.data || [])
  if (!usersRes.error) setUsers(usersRes.data || [])
  setIsLoading(false)
}

  const updateOrderStatus = async (
    id: number,
    status: string,
    customerEmail: string,
  ) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;

      const response = await fetch(`${apiUrl}/api/Orders/updatestatus/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, customerEmail }),
      });

      if (response.ok) {
        fetchData();
      } else {
        console.error("Failed to update order status");
        // Fallback to Supabase if backend fails
        await supabase.from("orders").update({ status }).eq("id", id);
        fetchData();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      // Fallback to Supabase
      await supabase.from("orders").update({ status }).eq("id", id);
      fetchData();
    }
  };

  const deleteProduct = async (id: number) => {
    await supabase.from("products").delete().eq("id", id);
    fetchData();
  };

  return (
    <div className="dashboard">
      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h1>Admin Panel</h1>
          <p>Manage all orders, products and users</p>
        </div>
      </div>

      {/* STATS */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{orders.length}</h3>
          <p>Total Orders</p>
        </div>
        <div className="stat-card">
          <h3>{products.length}</h3>
          <p>Total Products</p>
        </div>
        <div className="stat-card">
          <h3>{users.length}</h3>
          <p>Total Users</p>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          Orders
        </button>
        <button
          className={`tab-btn ${activeTab === "products" ? "active" : ""}`}
          onClick={() => setActiveTab("products")}
        >
          Products
        </button>
        <button
          className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>
      </div>

      {isLoading ? (
        <p className="loading">Loading data...</p>
      ) : (
        <>
          {/* ORDERS TAB */}
          {activeTab === "orders" && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>R{order.total_amount}</td>
                    <td>
                      <span className={`status-badge ${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateOrderStatus(
                            order.id,
                            e.target.value,
                            order.customer_email || "",
                          )
                        }
                        className="status-select"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === "products" && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.title}</td>
                    <td>{product.category}</td>
                    <td>R{product.price}</td>
                    <td>
                      <span className={`status-badge ${product.status}`}>
                        {product.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => deleteProduct(product.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* USERS TAB */}
          {activeTab === "users" && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name || "N/A"}</td>
                    <td>{user.email}</td>
                    <td>
                      <span
                        className={`status-badge ${user.role === "admin" ? "active" : "inactive"}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default AdminPanel;
