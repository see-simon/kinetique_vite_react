import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalItems } = useCart();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setRole("");
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();
    if (data) setRole(data.role);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
    navigate("/login");
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      {/* BRAND */}
      <div className="navbar-brand">
        <Link to="/" onClick={closeMenu}>👕 Kinetique</Link>
      </div>

      {/* HAMBURGER */}
      <button
        className="hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
        <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
        <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
      </button>

      {/* NAV MENU */}
      <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
        <div className="navbar-links">
          <Link to="/" onClick={closeMenu}>Home</Link>
          <Link to="/marketplace" onClick={closeMenu}>Marketplace</Link>
          {user && role === "creator" && (
            <Link to="/creator" onClick={closeMenu}>Creator Dashboard</Link>
          )}
          {user && role === "admin" && (
            <Link to="/admin" onClick={closeMenu}>Admin Panel</Link>
          )}
          {user && (
            <Link to="/orders" onClick={closeMenu}>My Orders</Link>
          )}
        </div>

        <div className="navbar-auth">
          {/* CART ICON */}
          <Link to="/cart" className="cart-icon" onClick={closeMenu}>
            🛒
            {totalItems > 0 && (
              <span className="cart-badge">{totalItems}</span>
            )}
          </Link>

          {user ? (
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="btn-nav-login" onClick={closeMenu}>
                Login
              </Link>
              <Link to="/register" className="btn-nav-register" onClick={closeMenu}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;