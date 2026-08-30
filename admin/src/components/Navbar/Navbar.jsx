import React from 'react';
import './Navbar.css';

import c_logo from '../../assets/c_logo.png';

const Navbar = () => {
  return (
    <div className="navbar">
      <div className="logo">
        <img src={c_logo} alt="Cravio" />
        <span>Cravio <b>Admin</b></span>
      </div>

      <div className="navbar-right">
        <span>Admin Panel</span>
      </div>
    </div>
  );
};

export default Navbar;