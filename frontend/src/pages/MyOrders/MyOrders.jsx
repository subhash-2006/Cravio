import React, { useContext, useEffect, useState } from 'react'
import './MyOrders.css'
import { StoreContext } from '../../context/StoreContext'
import { useToast } from '../../context/ToastContext'
import axios from 'axios'
import { assets } from '../../assets/assets'
import { useNavigate } from 'react-router-dom'

const MyOrders = () => {
  const { url, token } = useContext(StoreContext)
  const toast = useToast()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [trackingOrder, setTrackingOrder] = useState(null)
  const navigate = useNavigate()

  const fetchOrders = async () => {
    if (!token) return
    try {
      setLoading(true)
      const response = await axios.post(url + "/api/order/userorders", {}, { headers: { token } })
      if (response.data.success) {
        const orders = response.data.data || []
        setData(orders)
      } else {
        setData([])
        toast.error(response.data.message || "Failed to fetch orders")
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      setData([])
      toast.error("Failed to fetch orders. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchOrders()
    } else {
      setLoading(false)
    }
  }, [token])

  const getStatusStep = (status) => {
    switch (status) {
      case "Food Processing":
        return 2;
      case "Out for Delivery":
        return 3;
      case "Delivered":
        return 4;
      default:
        return 1;
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Food Processing":
        return "#ff9800";
      case "Out for Delivery":
        return "#2196f3";
      case "Delivered":
        return "#4caf50";
      default:
        return "#757575";
    }
  }

  const handleTrackClick = (order) => {
    setTrackingOrder(order)
  }

  return (
    <div className='my-orders'>
      <div className="my-orders-header">
        <h2>My Orders</h2>
        <button className="refresh-btn" onClick={fetchOrders}>🔄 Refresh Orders</button>
      </div>

      {!token ? (
        <div className="no-orders-box">
          <p>🔒 Please sign in to view and track your orders.</p>
        </div>
      ) : loading ? (
        <div className="no-orders-box">
          <p>⏳ Loading your orders...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="no-orders-box">
          <p>🛍️ You haven't placed any orders yet.</p>
          <button className="browse-btn" onClick={() => navigate('/')}>Browse Menu</button>
        </div>
      ) : (
        <div className="container">
          {data.map((order, index) => {
            const step = getStatusStep(order.status)
            return (
              <div key={index} className='my-orders-order'>
                <img src={assets.parcel_icon} alt="parcel" />
                <div className="order-items-summary">
                  <p className="order-item-names">
                    {order.items.map((item, i) =>
                      i === order.items.length - 1
                        ? `${item.name} × ${item.quantity}`
                        : `${item.name} × ${item.quantity}, `
                    )}
                  </p>
                  <span className="order-date">
                    {order.date ? new Date(order.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <p className="order-amount">${order.amount}.00</p>
                <p className="order-count">Items: {order.items.length}</p>
                <p className="order-status-badge">
                  <span style={{ color: getStatusColor(order.status) }}>&#x25cf;</span>
                  <b>{order.status}</b>
                </p>
                <button onClick={() => handleTrackClick(order)} className="track-btn">
                  Track Order
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Interactive Tracking Modal */}
      {trackingOrder && (
        <div className="tracking-modal-backdrop" onClick={() => setTrackingOrder(null)}>
          <div className="tracking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tracking-modal-header">
              <h3>Order Tracking</h3>
              <button className="close-btn" onClick={() => setTrackingOrder(null)}>✕</button>
            </div>
            <p className="tracking-order-id">
              Order ID: <b>#{trackingOrder._id.slice(-8).toUpperCase()}</b>
            </p>
            <p className="tracking-order-total">
              Total Amount: <b>${trackingOrder.amount}.00</b> ({trackingOrder.payment ? 'Paid' : 'Pending'})
            </p>

            {/* Stepper */}
            <div className="tracking-stepper">
              <div className={`step-item ${getStatusStep(trackingOrder.status) >= 1 ? 'completed' : ''}`}>
                <div className="step-icon">📦</div>
                <div className="step-label">
                  <b>Order Placed</b>
                  <span>We received your order</span>
                </div>
              </div>
              <div className={`step-line ${getStatusStep(trackingOrder.status) >= 2 ? 'active' : ''}`}></div>

              <div className={`step-item ${getStatusStep(trackingOrder.status) >= 2 ? 'completed' : ''}`}>
                <div className="step-icon">👨‍🍳</div>
                <div className="step-label">
                  <b>Food Processing</b>
                  <span>Kitchen is preparing your food</span>
                </div>
              </div>
              <div className={`step-line ${getStatusStep(trackingOrder.status) >= 3 ? 'active' : ''}`}></div>

              <div className={`step-item ${getStatusStep(trackingOrder.status) >= 3 ? 'completed' : ''}`}>
                <div className="step-icon">🛵</div>
                <div className="step-label">
                  <b>Out for Delivery</b>
                  <span>Rider is on the way</span>
                </div>
              </div>
              <div className={`step-line ${getStatusStep(trackingOrder.status) >= 4 ? 'active' : ''}`}></div>

              <div className={`step-item ${getStatusStep(trackingOrder.status) >= 4 ? 'completed' : ''}`}>
                <div className="step-icon">🎉</div>
                <div className="step-label">
                  <b>Delivered</b>
                  <span>Enjoy your delicious meal!</span>
                </div>
              </div>
            </div>

            {/* Delivery address */}
            {trackingOrder.address && (
              <div className="tracking-address">
                <p className="address-title">📍 Delivery Address:</p>
                <p>{trackingOrder.address.firstName} {trackingOrder.address.lastName}</p>
                <p>{trackingOrder.address.street}, {trackingOrder.address.city}, {trackingOrder.address.state} {trackingOrder.address.zipcode}</p>
                <p>📞 {trackingOrder.address.phone}</p>
              </div>
            )}

            <button className="done-btn" onClick={() => setTrackingOrder(null)}>Done</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyOrders
