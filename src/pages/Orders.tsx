import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate, useLocation } from 'react-router-dom'

interface Order {
  id: number
  total_amount: number
  status: string
  created_at: string
  order_items: {
    id: number
    quantity: number
    price: number
    products: {
      title: string
      image_url: string
      category: string
    }
  }[]
}

const Orders = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

useEffect(() => {
  checkUser()
  const params = new URLSearchParams(location.search)
  if (params.get('payment') === 'success') {
    setPaymentSuccess(true)
    setTimeout(() => setPaymentSuccess(false), 5000)
    
    // Send confirmation email when returning from PayFast
    const orderId = params.get('order_id')
    if (orderId) {
      sendConfirmationEmail(parseInt(orderId))
    }
    
    window.history.replaceState({}, '', '/orders')
  }
}, [])

const sendConfirmationEmail = async (orderId: number) => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    // Get order details
    const { data: order } = await supabase
      .from('orders')
      .select('*, order_items(*, products(title))')
      .eq('id', orderId)
      .single()

    if (!order) return

    const productName = order.order_items?.[0]?.products?.title || 'Kinetique Order'

    await fetch(`${import.meta.env.VITE_API_URL}/api/orders/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerEmail: session.user.email,
        orderId: order.id,
        productName: productName,
        amount: order.total_amount
      })
    })
  } catch (err) {
    console.log('Confirmation email failed:', err)
  }
}

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      navigate('/login')
      return
    }
    fetchOrders(session.user.id)
  }

  const fetchOrders = async (userId: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            title,
            image_url,
            category
          )
        )
      `)
      .eq('customer_id', userId)
      .order('created_at', { ascending: false })

    if (!error) setOrders(data || [])
    setIsLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'pending'
      case 'processing': return 'processing'
      case 'shipped': return 'shipped'
      case 'delivered': return 'active'
      case 'cancelled': return 'inactive'
      default: return 'pending'
    }
  }

  return (
    <div className="dashboard">

      {/* PAYMENT SUCCESS TOAST */}
      {paymentSuccess && (
        <div className="success-toast">
          🎉 Payment successful! Your order has been placed and is being processed.
        </div>
      )}

      <div className="dashboard-header">
        <div>
          <h1>My Orders</h1>
          <p>Track and manage your orders</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/marketplace')}>
          Continue Shopping
        </button>
      </div>

      {isLoading ? (
        <p className="loading">Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <p>You have no orders yet.</p>
          <button className="btn-primary" onClick={() => navigate('/marketplace')}>
            Shop Now
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">

              {/* ORDER HEADER */}
              <div className="order-header">
                <div>
                  <h3>Order #{order.id}</h3>
                  <p>{new Date(order.created_at).toLocaleDateString('en-ZA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
                <div className="order-header-right">
                  <span className={`status-badge ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <span className="order-total">R{order.total_amount}</span>
                </div>
              </div>

              {/* ORDER ITEMS */}
              <div className="order-items">
                {order.order_items.map(item => (
                  <div key={item.id} className="order-item">
                    <div className="order-item-image">
                      {item.products?.image_url ? (
                        <img src={item.products.image_url} alt={item.products.title} />
                      ) : (
                        <span>👕</span>
                      )}
                    </div>
                    <div className="order-item-info">
                      <h4>{item.products?.title}</h4>
                      <p>{item.products?.category}</p>
                      <p>Qty: {item.quantity} × R{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* ORDER TRACKER */}
              <div className="order-tracker">
                {['pending', 'processing', 'shipped', 'delivered'].map((step, index) => (
                  <div key={step} className="tracker-step">
                    <div className={`tracker-dot ${
                      ['pending', 'processing', 'shipped', 'delivered'].indexOf(order.status) >= index
                        ? 'completed' : ''
                    }`}>
                      {index + 1}
                    </div>
                    <p>{step.charAt(0).toUpperCase() + step.slice(1)}</p>
                    {index < 3 && <div className={`tracker-line ${
                      ['pending', 'processing', 'shipped', 'delivered'].indexOf(order.status) > index
                        ? 'completed' : ''
                    }`} />}
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Orders