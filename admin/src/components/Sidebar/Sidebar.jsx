import React from 'react'
import './Sidebar.css'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
  return (
    <div className='sidebar'>
      <div className="sidebar-options">
        <NavLink to='/add' className={({ isActive }) => `sidebar-option ${isActive ? 'active' : ''}`}>
          <span className='icon'>➕</span>
          <p>Add Items</p>
        </NavLink>
        <NavLink to='/list' className={({ isActive }) => `sidebar-option ${isActive ? 'active' : ''}`}>
          <span className='icon'>📋</span>
          <p>List Items</p>
        </NavLink>
        <NavLink to='/orders' className={({ isActive }) => `sidebar-option ${isActive ? 'active' : ''}`}>
          <span className='icon'>🛍️</span>
          <p>Orders</p>
        </NavLink>
      </div>
    </div>
  )
}

export default Sidebar
