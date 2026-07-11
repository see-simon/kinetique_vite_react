import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { initiatePayFastPayment } from '../utils/payfast'
import { useState } from 'react'

const Cart = () => {
  const { items, removeFromCart, updateQuantity, clearCart, totalPrice, totalItems } = useCart()
  const navigate = useNavigate()
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const handleCheckout = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      navigate('/login')
      return
    }

    setIsCheckingOut(true)

    // Create one order for all items
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        customer_id: session.user.id,
        total_amount: totalPrice,
        status: 'pending'
      }])
      .select()
      .single()

    if (!orderError && order) {
      // Insert all order items
      await supabase.from('order_items').insert(
        items.map(item => ({
          order_id: order.id,
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      )

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', session.user.id)
        .single()

      // Clear cart before redirecting
      clearCart()

      // Initiate PayFast payment
      initiatePayFastPayment({
        amount: totalPrice,
        itemName: `Kinetique Order #${order.id} (${totalItems} items)`,
        orderId: order.id,
        customerEmail: session.user.email!,
        customerName: profile?.full_name || 'Customer'
      })
    }

    setIsCheckingOut(false)
  }

  if (items.length === 0) {
    return (
      <div className="dashboard">
        <div className="empty-state">
          <p style={{ fontSize: '48px' }}>🛒</p>
          <p>Your cart is empty</p>
          <button className="btn-primary" onClick={() => navigate('/marketplace')}>
            Shop Now
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Your Cart</h1>
          <p>{totalItems} item{totalItems > 1 ? 's' : ''} in your cart</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/marketplace')}>
          Continue Shopping
        </button>
      </div>

      <div className="cart-container">
        {/* CART ITEMS */}
        <div className="cart-items">
          {items.map(item => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-image">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} />
                ) : (
                  <span>👕</span>
                )}
              </div>
              <div className="cart-item-info">
                <h3>{item.title}</h3>
                <p>{item.category}</p>
                <p className="cart-item-price">R{item.price} each</p>
              </div>
              <div className="cart-item-controls">
                <div className="quantity-controls">
                  <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                  <span className="qty-value">{item.quantity}</span>
                  <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                </div>
                <p className="cart-item-subtotal">R{(item.price * item.quantity).toFixed(2)}</p>
                <button className="delete-btn" onClick={() => removeFromCart(item.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>

        {/* ORDER SUMMARY */}
        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-rows">
            {items.map(item => (
              <div key={item.id} className="summary-row">
                <span>{item.title} x{item.quantity}</span>
                <span>R{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="summary-total">
            <span>Total</span>
            <span>R{totalPrice.toFixed(2)}</span>
          </div>
          <button
            className="btn-checkout"
            onClick={handleCheckout}
            disabled={isCheckingOut}
          >
            {isCheckingOut ? 'Processing...' : '💳 Checkout with PayFast'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Cart