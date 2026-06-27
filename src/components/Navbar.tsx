import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState("");

  useEffect(() => {
    // Get current user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
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
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">👕 Kinetique</Link>
      </div>

      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/marketplace">Marketplace</Link>

        {user && role === "creator" && (
          <Link to="/creator">Creator Dashboard</Link>
        )}

        {user && role === "admin" && <Link to="/admin">Admin Panel</Link>}
        {user && <Link to="/orders">My Orders</Link>}
      </div>

      <div className="navbar-auth">
        {user ? (
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        ) : (
          <>
            <Link to="/login" className="btn-nav-login">
              Login
            </Link>
            <Link to="/register" className="btn-nav-register">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
