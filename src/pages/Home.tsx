import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className="home">

      {/* HERO SECTION */}
      <div className="hero">
        <h1>South Africa's Print-on-Demand Fashion Marketplace</h1>
        <p>Discover unique designs from local creators. Buy, wear, and support South African talent.</p>
        <div className="hero-buttons">
          <Link to="/marketplace" className="btn-primary-link">Shop Now</Link>
          <Link to="/register" className="btn-secondary-link">Become a Creator</Link>
        </div>
      </div>

      {/* FEATURES SECTION */}
      <div className="features">
        <div className="feature-card">
          <span>🎨</span>
          <h3>Unique Designs</h3>
          <p>Discover one-of-a-kind fashion pieces created by South African artists and designers.</p>
        </div>
        <div className="feature-card">
          <span>🖨️</span>
          <h3>Print on Demand</h3>
          <p>Every item is printed when you order — no waste, no excess stock, just quality.</p>
        </div>
        <div className="feature-card">
          <span>💳</span>
          <h3>Easy Payments</h3>
          <p>Pay securely with PayFast or Yoco using South African rand — fast and reliable.</p>
        </div>
        <div className="feature-card">
          <span>🚀</span>
          <h3>Creator Dashboard</h3>
          <p>Upload your designs, set your prices and start earning from your creativity today.</p>
        </div>
      </div>

      {/* CTA SECTION */}
      <div className="cta">
        <h2>Ready to start selling your designs?</h2>
        <p>Join hundreds of South African creators already earning on Kinetique.</p>
        <Link to="/register" className="btn-primary-link">Get Started Free</Link>
      </div>

    </div>
  )
}

export default Home