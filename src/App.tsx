import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AdminPanel from './pages/AdminPanel'
import Home from './pages/Home'
import Login from './pages/Login'
import Marketplace from './pages/Marketplace'
import ProductDetail from './pages/ProductDetail'
import Register from './pages/Register'
import CreatorDashboard from './pages/CreatorDashboard'
import Orders from './pages/Orders'
import Cart from './pages/Cart'
import { CartProvider } from './context/CartContext'
import Profile from './pages/Profile'

function App() {
  return (
    <CartProvider>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <div style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/creator" element={<CreatorDashboard />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </CartProvider>
  )
}

export default App