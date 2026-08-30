import React, { useContext, useState, useRef, useEffect } from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'
import { Link, useNavigate } from 'react-router-dom'
import { StoreContext } from '../../context/StoreContext'
import { useToast } from '../../context/ToastContext'
import cravio from '../../assets/cravio.png';

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("home")
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const { getTotalCartAmount, token, setToken, food_list, url } = useContext(StoreContext)
  const toast = useToast()
  const navigate = useNavigate()
  const profileRef = useRef(null)
  const searchRef = useRef(null)
  const timeoutRef = useRef(null)

  const logout = () => {
    localStorage.removeItem("token")
    setToken("")
    setIsProfileOpen(false)
    toast.info("Logged out successfully")
    navigate("/")
  }

  // Close dropdowns when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false)
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false)
        setIsProfileOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      window.removeEventListener("keydown", handleKeyDown)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsProfileOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsProfileOpen(false)
    }, 400)
  }

  const handleProfileClick = (e) => {
    e.stopPropagation()
    setIsProfileOpen((prev) => !prev)
  }

  const queryTrimmed = searchQuery.trim().toLowerCase()
  const filteredFood = queryTrimmed.length >= 2
    ? food_list.filter(item =>
      item.name.toLowerCase().includes(queryTrimmed) ||
      (item.category && item.category.toLowerCase().includes(queryTrimmed))
    )
    : []

  const getImageSrc = (image) => {
    if (typeof image === 'string' && !image.startsWith('/src') && !image.startsWith('data:') && !image.includes('/')) {
      return `${url}/images/${image}`
    }
    return image
  }

  const handleSelectSearchResult = (item) => {
    setSearchQuery("")
    setIsSearchOpen(false)
    const element = document.getElementById('food-display') || document.getElementById('explore-menu')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className='navbar'>
      <Link to='/' className="logo">Cravio</Link>

      <ul className="navbar-menu">
        <Link to='/' onClick={() => setMenu("home")} className={menu === "home" ? "active" : ""}>home</Link>
        <a href='#explore-menu' onClick={() => setMenu("menu")} className={menu === "menu" ? "active" : ""}>menu</a>
        <a href='#app-download' onClick={() => setMenu("mobile-app")} className={menu === "mobile-app" ? "active" : ""}>mobile-app</a>
        <a href='#footer' onClick={() => setMenu("contact-us")} className={menu === "contact-us" ? "active" : ""}>contact us</a>
      </ul>

      <div className="navbar-right">
        {/* Inline Static Search Bar */}
        <div className="nav-search-container" ref={searchRef}>
          <div className="nav-search-bar">
            <svg
              className="nav-search-svg-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search for food..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setIsSearchOpen(true)
              }}
              onFocus={() => setIsSearchOpen(true)}
            />
            {searchQuery && (
              <button
                className="nav-search-clear"
                onClick={() => {
                  setSearchQuery("")
                  setIsSearchOpen(false)
                }}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Inline Floating Search Results Dropdown */}
          {isSearchOpen && queryTrimmed.length >= 2 && (
            <div className="nav-search-dropdown">
              {filteredFood.length === 0 ? (
                <div className="nav-search-no-result">No food found</div>
              ) : (
                filteredFood.map((item) => (
                  <div
                    key={item._id}
                    className="nav-search-dropdown-item"
                    onClick={() => handleSelectSearchResult(item)}
                  >
                    <img
                      src={getImageSrc(item.image)}
                      alt={item.name}
                      className="nav-search-dropdown-img"
                    />
                    <span className="nav-search-dropdown-name">{item.name}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="navbar-search-icon">
          <Link to='/cart'><img src={assets.basket_icon} alt="basket" /></Link>
          <div className={getTotalCartAmount() === 0 ? "" : "dot"}></div>
        </div>

        {!token
          ? <button onClick={() => setShowLogin(true)}>sign in</button>
          : <div
            className={`navbar-profile ${isProfileOpen ? 'active' : ''}`}
            ref={profileRef}
            onClick={handleProfileClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            aria-label="User Account Menu"
            role="button"
            tabIndex={0}
          >
            <svg
              className="profile-svg-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="10" r="3" />
              <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
            </svg>
            <ul className={`nav-profile-dropdown ${isProfileOpen ? 'show' : ''}`}>
              <li onClick={(e) => { e.stopPropagation(); setIsProfileOpen(false); navigate('/myorders'); }}>
                <img src={assets.bag_icon} alt="orders" />
                <p>Orders</p>
              </li>
              <hr />
              <li onClick={(e) => { e.stopPropagation(); logout(); }}>
                <img src={assets.logout_icon} alt="logout" />
                <p>Logout</p>
              </li>
            </ul>
          </div>
        }
      </div>
    </div>
  )
}

export default Navbar