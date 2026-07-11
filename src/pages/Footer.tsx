import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* BRAND */}
        <div className="footer-brand">
          <h3>👕 Kinetique</h3>
          <p>South Africa's print-on-demand fashion marketplace. Discover unique designs from local creators.</p>
        </div>

        {/* QUICK LINKS */}
        <div className="footer-section">
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/marketplace">Marketplace</Link>
          <Link to="/register">Become a Creator</Link>
          <Link to="/orders">My Orders</Link>
        </div>

        {/* FOR CREATORS */}
        <div className="footer-section">
          <h4>For Creators</h4>
          <Link to="/register">Join as Creator</Link>
          <Link to="/creator">Creator Dashboard</Link>
          <Link to="/marketplace">Browse Marketplace</Link>
        </div>

        {/* CONTACT */}
        <div className="footer-section">
          <h4>Contact Us</h4>
          <a href="mailto:support@kinetique.co.za">support@kinetique.co.za</a>
          <a href="tel:+27769982537">076 998 2537</a>
          <p>Johannesburg, South Africa</p>
        </div>

      </div>

      {/* BOTTOM BAR */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Kinetique. All rights reserved.</p>
        <p>Payments secured by PayFast 🔒</p>
      </div>
    </footer>
  )
}

export default Footer