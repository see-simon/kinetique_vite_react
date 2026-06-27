import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import './App.css'
import Navbar from './components/Navbar'
import AdminPanel from './pages/AdminPanel'
import Home from './pages/Home'
import Login from './pages/Login'
import Marketplace from './pages/Marketplace'
import ProductDetail from './pages/ProductDetail'
import Register from './pages/Register'
import CreatorDashboard from './pages/CreatorDashboard'
import Orders from './pages/Orders'

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/creator" element={<CreatorDashboard />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/orders" element={<Orders />} />
      </Routes>
    </Router>
  )
}

export default App