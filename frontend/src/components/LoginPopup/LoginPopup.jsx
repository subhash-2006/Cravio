import React, { useContext, useState } from 'react'
import './LoginPopup.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../context/StoreContext'
import { useToast } from '../../context/ToastContext'
import axios from 'axios'

const LoginPopup = ({ setShowLogin }) => {
  const { url, setToken } = useContext(StoreContext)
  const toast = useToast()
  const [currState, setCurrState] = useState("Login")
  const [data, setData] = useState({ name: "", email: "", password: "" })

  const onChangeHandler = (event) => {
    const name = event.target.name
    const value = event.target.value
    setData((prev) => ({ ...prev, [name]: value }))
  }

  const onLogin = async (event) => {
    event.preventDefault()
    let newUrl = url
    if (currState === "Login") {
      newUrl += "/api/user/login"
    } else {
      newUrl += "/api/user/register"
    }

    try {
      const response = await axios.post(newUrl, data)
      if (response.data.success) {
        setToken(response.data.token)
        localStorage.setItem("token", response.data.token)
        toast.success(currState === "Login" ? "Welcome back!" : "Account created successfully!")
        setShowLogin(false)
      } else {
        toast.error(response.data.message || "Invalid email or password")
      }
    } catch (error) {
      console.error("Login/Register error:", error)
      if (error.code === 'ERR_NETWORK') {
        toast.error("Cannot connect to server. Please make sure the backend is running.")
      } else {
        toast.error("Something went wrong. Please try again.")
      }
    }
  }

  return (
    <div className='login-popup'>
      <form onSubmit={onLogin} className="login-popup-container">
        <div className="login-popup-title">
          <h2>{currState}</h2>
          <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="close" />
        </div>
        <div className="login-popup-inputs">
          {currState === "Login" ? <></> : (
            <input
              name='name'
              onChange={onChangeHandler}
              value={data.name}
              type="text"
              placeholder='Your name'
              required
            />
          )}
          <input
            name='email'
            onChange={onChangeHandler}
            value={data.email}
            type="email"
            placeholder='Your email'
            required
          />
          <input
            name='password'
            onChange={onChangeHandler}
            value={data.password}
            type="password"
            placeholder='Password'
            required
          />
        </div>
        <button type="submit">{currState === "Sign Up" ? "Create account" : "Login"}</button>
        <div className="login-popup-condition">
          <input type="checkbox" required />
          <p>By continuing, I agree to the terms of use &amp; privacy policy.</p>
        </div>
        {currState === "Login"
          ? <p>Create a new account? <span onClick={() => setCurrState("Sign Up")}>Click here</span></p>
          : <p>Already have an account? <span onClick={() => setCurrState("Login")}>Login here</span></p>
        }
      </form>
    </div>
  )
}

export default LoginPopup
