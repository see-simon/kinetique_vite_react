import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { initiatePayFastPayment } from "../utils/payfast";
import { useCart } from "../context/CartContext";

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  creator_id: string;
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isOrdering, setIsOrdering] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    fetchProduct();
    checkUser();
  }, [id]);

  const fetchProduct = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (!error) setProduct(data);
    setIsLoading(false);
  };

  const checkUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image_url: product.image_url,
      category: product.category,
      quantity: quantity,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleOrder = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setIsOrdering(true);

    const totalAmount = product!.price * quantity;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          customer_id: user.id,
          total_amount: totalAmount,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (!orderError && order) {
      await supabase.from("order_items").insert([
        {
          order_id: order.id,
          product_id: product!.id,
          quantity: quantity,
          price: product!.price,
        },
      ]);

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      initiatePayFastPayment({
        amount: totalAmount,
        itemName: `${product!.title} x${quantity}`,
        orderId: order.id,
        customerEmail: user.email,
        customerName: profile?.full_name || "Customer",
      });
    }

    setIsOrdering(false);
  };
  if (isLoading) return <div className="loading">Loading product...</div>;
  if (!product) return <div className="loading">Product not found.</div>;

  return (
    <div className="product-detail">
      <button className="back-btn" onClick={() => navigate("/marketplace")}>
        ← Back to Marketplace
      </button>

      <div className="product-detail-container">
        {/* IMAGE */}
        <div className="product-detail-image">
          {product.image_url ? (
            <img src={product.image_url} alt={product.title} />
          ) : (
            <div className="image-placeholder large">👕</div>
          )}
        </div>

        {/* INFO */}
        <div className="product-detail-info">
          <span className="product-category">{product.category}</span>
          <h1>{product.title}</h1>
          <p className="product-detail-price">R{product.price}</p>
          <p className="product-detail-description">{product.description}</p>

          <div className="product-detail-features">
            <div className="feature-item">✅ Print on demand</div>
            <div className="feature-item">✅ Quality guaranteed</div>
            <div className="feature-item">✅ South African made</div>
            <div className="feature-item">✅ Fast delivery</div>
          </div>

          {/* QUANTITY SELECTOR */}
          <div className="quantity-selector">
            <label>Quantity:</label>
            <div className="quantity-controls">
              <button
                className="qty-btn"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <span className="qty-value">{quantity}</span>
              <button
                className="qty-btn"
                onClick={() => setQuantity((q) => q + 1)}
              >
                +
              </button>
            </div>
            <span className="qty-total">
              Total: R{(product.price * quantity).toFixed(2)}
            </span>
          </div>

          <div className="product-buttons">
            <button
              className="btn-add-to-cart"
              onClick={handleAddToCart}
              disabled={!user}
            >
              {addedToCart ? "✅ Added to Cart!" : "🛒 Add to Cart"}
            </button>

            <button
              className="btn-order"
              onClick={handleOrder}
              disabled={isOrdering}
            >
              {isOrdering
                ? "Processing..."
                : user
                  ? "💳 Buy Now"
                  : "Login to Order"}
            </button>
          </div>

          {!user && (
            <p className="login-hint">
              You need to <span onClick={() => navigate("/login")}>login</span>{" "}
              to place an order
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
