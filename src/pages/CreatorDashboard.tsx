import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  status: string;
}

const categories = ["T-Shirts", "Hoodies", "Caps", "Bags", "Accessories"];

const CreatorDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [user, setUser] = useState<any>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    image_url: "",
    category: "T-Shirts",
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }
    setUser(session.user);
    fetchProducts(session.user.id);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let imageUrl = formData.image_url;

    // Upload image if file selected
    if (imageFile) {
      setIsUploading(true);
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, imageFile);

      if (uploadError) {
        console.error("Image upload failed:", uploadError);
        setIsSubmitting(false);
        setIsUploading(false);
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      imageUrl = urlData.publicUrl;
      setIsUploading(false);
    }

    const { error } = await supabase.from("products").insert([
      {
        ...formData,
        image_url: imageUrl,
        price: parseFloat(formData.price),
        creator_id: user.id,
        status: "active",
      },
    ]);

    if (!error) {
      setSuccessMessage("✅ Product uploaded successfully!");
      setShowForm(false);
      setFormData({
        title: "",
        description: "",
        price: "",
        image_url: "",
        category: "T-Shirts",
      });
      setImageFile(null);
      setImagePreview("");
      fetchProducts(user.id);
      setTimeout(() => setSuccessMessage(""), 4000);
    }

    setIsSubmitting(false);
  };

  const fetchProducts = async (userId: string) => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("creator_id", userId)
      .order("created_at", { ascending: false });

    if (!error) setProducts(data || []);
    setIsLoading(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (!error) fetchProducts(user.id);
  };

  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    const { error } = await supabase
      .from("products")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) fetchProducts(user.id);
  };

  return (
    <div className="dashboard">
      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h1>Creator Dashboard</h1>
          <p>Manage your products and track your sales</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Upload New Product
        </button>
      </div>

      {/* SUCCESS MESSAGE */}
      {successMessage && <div className="success-toast">{successMessage}</div>}

      {/* STATS */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{products.length}</h3>
          <p>Total Products</p>
        </div>
        <div className="stat-card">
          <h3>{products.filter((p) => p.status === "active").length}</h3>
          <p>Active Products</p>
        </div>
        <div className="stat-card">
          <h3>{products.filter((p) => p.status === "inactive").length}</h3>
          <p>Inactive Products</p>
        </div>
      </div>

      {/* UPLOAD FORM MODAL */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Upload New Product</h2>
            <p>Fill in the details for your new design</p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Product Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Abstract Art T-Shirt"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  placeholder="Describe your product..."
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  required
                />
              </div>

              <div className="form-group">
                <label>Price (ZAR)</label>
                <input
                  type="number"
                  name="price"
                  placeholder="e.g. 299"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input"
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="image-preview"
                  />
                )}
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting || isUploading}>
                  {isUploading
                    ? "Uploading image..."
                    : isSubmitting
                      ? "Saving..."
                      : "Upload Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRODUCTS TABLE */}
      <div className="products-table-section">
        <h2>My Products</h2>
        {isLoading ? (
          <p className="loading">Loading products...</p>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <p>You haven't uploaded any products yet.</p>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              Upload your first product
            </button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="product-name-cell">
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="table-img"
                        />
                      )}
                      <span>{product.title}</span>
                    </div>
                  </td>
                  <td>{product.category}</td>
                  <td>R{product.price}</td>
                  <td>
                    <span className={`status-badge ${product.status}`}>
                      {product.status}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-toggle"
                        onClick={() => toggleStatus(product.id, product.status)}
                      >
                        {product.status === "active"
                          ? "Deactivate"
                          : "Activate"}
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(product.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CreatorDashboard;
