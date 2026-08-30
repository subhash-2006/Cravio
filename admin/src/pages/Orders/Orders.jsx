import React, { useEffect, useState } from 'react'
import './Orders.css'
import axios from 'axios'
import { toast } from 'react-toastify'

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAllOrders = async () => {
    try {
      setLoading(true)
      const response = await axios.get(url + "/api/order/list")
      if (response.data.success) {
        setOrders(response.data.data || [])
      } else {
        toast.error("Failed to load orders")
      }
    } catch (error) {
      console.error(error)
      toast.error("Error connecting to server")
    } finally {
      setLoading(false)
    }
  }

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(url + "/api/order/status", {
        orderId,
        status: event.target.value
      })
      if (response.data.success) {
        toast.success("Order status updated!")
        await fetchAllOrders()
      } else {
        toast.error(response.data.message || "Failed to update status")
      }
    } catch (error) {
      console.error(error)
      toast.error("Error updating order status")
    }
  }

  useEffect(() => {
    fetchAllOrders()
  }, [])

  return (
    <div className='order add'>
      <h2>Order Management</h2>
      <div className="order-list">
        {orders.map((order, index) => (
          <div key={index} className='order-item'>
            <div className='order-header'>
              <span className='order-id'>Order #{order._id.slice(-6).toUpperCase()}</span>
              <span className={`payment-badge ${order.payment ? 'paid' : 'pending'}`}>
                {order.payment ? '✅ Paid' : '⏳ Pending'}
              </span>
            </div>

            <div className='order-items'>
              <p className='items-label'>Items:</p>
              <p>
                {order.items.map((item, i) =>
                  i === order.items.length - 1
                    ? `${item.name} × ${item.quantity}`
                    : `${item.name} × ${item.quantity}, `
                )}
              </p>
            </div>

            <div className='order-details'>
              <div className='customer-info'>
                <p className='name'>{order.address.firstName} {order.address.lastName}</p>
                <p>{order.address.street}</p>
                <p>{order.address.city}, {order.address.state}, {order.address.country}</p>
                <p>📞 {order.address.phone}</p>
              </div>
              <div className='order-meta'>
                <p className='amount'>${order.amount}.00</p>
                <p>{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
              </div>
              <select
                className='status-select'
                onChange={(e) => statusHandler(e, order._id)}
                value={order.status}
              >
                <option value="Food Processing">🔄 Food Processing</option>
                <option value="Out for Delivery">🚚 Out for Delivery</option>
                <option value="Delivered">✅ Delivered</option>
              </select>
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <div className='no-orders'>
            <p>🛍️ No orders yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders
