import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>Employee Management System</h1>
      </div>
      <div className="navbar-links">
        <Link to="/" className="nav-link">Employees</Link>
        <Link to="/add-employee" className="nav-link">Add Employee</Link>
      </div>
    </nav>
  );
}

export default Navbar;

