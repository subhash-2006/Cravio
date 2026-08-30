import React from 'react'
import './Header.css'

const Header = () => {
  const handleViewMenu = () => {
    const menuElement = document.getElementById('explore-menu')
    if (menuElement) {
      menuElement.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.location.href = '/#explore-menu'
    }
  }

  return (
    <div className='header'>
      <div className="header-contents">
        <h2>Order your favourite food here</h2>
        <p>Discover delicious meals made with fresh ingredients and delivered straight to your door.</p>
        <button onClick={handleViewMenu}>View Menu</button>
      </div>
    </div>
  )
}

export default Header
