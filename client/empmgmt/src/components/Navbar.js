import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>Emp System</h1>
      </div>
      <div className="navbar-links">
        <Link to="/" className="nav-link">Emp list</Link>
        <Link to="/add-employee" className="nav-link">Add Emp</Link>
      </div>
    </nav>
  );
}

export default Navbar;

