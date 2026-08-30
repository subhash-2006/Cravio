import React, { useContext, useEffect, useState } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../context/StoreContext'
import { useToast } from '../../context/ToastContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const PlaceOrder = () => {
  const { getTotalCartAmount, token, food_list, cartItems, setCartItems, url } = useContext(StoreContext)
  const toast = useToast()
  const navigate = useNavigate()
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [loading, setLoading] = useState(false)

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: ""
  })

  useEffect(() => {
    if (!token) {
      toast.warning("Please sign in to place your order")
      navigate('/cart')
    } else if (getTotalCartAmount() === 0) {
      navigate('/cart')
    }
  }, [token])

  const onChangeHandler = (event) => {
    const name = event.target.name
    const value = event.target.value
    setData((prev) => ({ ...prev, [name]: value }))
  }

  const placeOrder = async (event) => {
    event.preventDefault()
    setLoading(true)

    let orderItems = []
    food_list.forEach((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = { ...item }
        itemInfo["quantity"] = cartItems[item._id]
        orderItems.push(itemInfo)
      }
    })

    if (orderItems.length === 0) {
      toast.warning("Your cart is empty!")
      setLoading(false)
      return
    }

    let orderData = {
      address: data,
      items: orderItems,
      amount: getTotalCartAmount() + 2,
    }

    try {
      if (paymentMethod === "cod") {
        let response = await axios.post(url + "/api/order/placecod", orderData, { headers: { token } })
        if (response.data.success) {
          setCartItems({})
          toast.success("Order placed successfully!")
          navigate("/myorders")
        } else {
          toast.error(response.data.message || "Something went wrong. Please try again.")
        }
      } else {
        let response = await axios.post(url + "/api/order/place", orderData, { headers: { token } })
        if (response.data.success) {
          const { session_url } = response.data
          window.location.replace(session_url)
        } else {
          toast.error(response.data.message || "Something went wrong. Please try again.")
        }
      }
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || "Failed to place order. Is backend server running?")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={placeOrder} className='place-order'>
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input required name='firstName' onChange={onChangeHandler} value={data.firstName} type="text" placeholder='First name' />
          <input required name='lastName' onChange={onChangeHandler} value={data.lastName} type="text" placeholder='Last name' />
        </div>
        <input required name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Email address' />
        <input required name='street' onChange={onChangeHandler} value={data.street} type="text" placeholder='Street' />
        <div className="multi-fields">
          <input required name='city' onChange={onChangeHandler} value={data.city} type="text" placeholder='City' />
          <input required name='state' onChange={onChangeHandler} value={data.state} type="text" placeholder='State' />
        </div>
        <div className="multi-fields">
          <input required name='zipcode' onChange={onChangeHandler} value={data.zipcode} type="text" placeholder='Zip code' />
          <input required name='country' onChange={onChangeHandler} value={data.country} type="text" placeholder='Country' />
        </div>
        <input required name='phone' onChange={onChangeHandler} value={data.phone} type="text" placeholder='Phone' />
      </div>
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>${getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>${getTotalCartAmount() === 0 ? 0 : 2}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>${getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}</b>
            </div>
          </div>

          <div className="payment-options" style={{ marginTop: '30px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#333' }}>Payment Method</h3>
            <div
              onClick={() => setPaymentMethod("cod")}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                border: paymentMethod === 'cod' ? '2px solid tomato' : '1px solid #ddd',
                borderRadius: '8px',
                marginBottom: '10px',
                cursor: 'pointer',
                background: paymentMethod === 'cod' ? '#fff6f4' : '#fff'
              }}
            >
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
              />
              <span style={{ fontWeight: 500, fontSize: '15px' }}>💵 Cash on Delivery (COD)</span>
            </div>

            <div
              onClick={() => setPaymentMethod("stripe")}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                border: paymentMethod === 'stripe' ? '2px solid tomato' : '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                background: paymentMethod === 'stripe' ? '#fff6f4' : '#fff'
              }}
            >
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "stripe"}
                onChange={() => setPaymentMethod("stripe")}
              />
              <span style={{ fontWeight: 500, fontSize: '15px' }}>💳 Stripe / Online Payment</span>
            </div>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "PLACING ORDER..." : (paymentMethod === "cod" ? "PLACE ORDER (COD)" : "PROCEED TO PAYMENT")}
          </button>
        </div>
      </div>
    </form>
  )
}

export default PlaceOrder
