const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const pool = new Pool({
    user: 'notsus',       // Replace with your PostgreSQL username
    host: 'postgres',           // Replace with your PostgreSQL host
    database: 'fsd',    // Replace with your PostgreSQL database name
    password: 'Sidhu123104',   // Replace with your PostgreSQL password
    port: 5432,                  // Default PostgreSQL port
});

pool.connect((err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Connected to the PostgreSQL database.');
    }
});

// Create Employees Table
pool.query(`
    CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        employee_id TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT NOT NULL,
        department TEXT NOT NULL,
        date_of_joining DATE NOT NULL,
        role TEXT NOT NULL
    )
`, (err) => {
    if (err) {
        console.error('Error creating table:', err.message);
    } else {
        console.log('Employees table ensured.');
    }
});

// Validation Middleware
const employeeValidations = [
    body('firstName').trim().notEmpty().withMessage('First Name is required'),
    body('lastName').trim().notEmpty().withMessage('Last Name is required'),
    body('employeeId')
        .trim()
        .notEmpty().withMessage('Employee ID is required')
        .isLength({ max: 10 }).withMessage('Employee ID must be max 10 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format'),
    body('phone')
        .trim()
        .notEmpty().withMessage('Phone is required')
        .matches(/^\d{10}$/).withMessage('Phone must be 10 digits'),
    body('department').trim().notEmpty().withMessage('Department is required'),
    body('dateOfJoining')
        .notEmpty().withMessage('Date of Joining is required')
        .custom((value) => {
            const joinDate = new Date(value);
            const today = new Date();
            if (joinDate > today) {
                throw new Error('Date of Joining cannot be in the future');
            }
            return true;
        }),
    body('role').trim().notEmpty().withMessage('Role is required')
];

// Fetch All Employees
app.get('/employees', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM employees');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to retrieve employees' });
    }
});

// Add Employee Route
app.post('/add-employee', employeeValidations, async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { 
        firstName, 
        lastName, 
        employeeId, 
        email, 
        phone, 
        department, 
        dateOfJoining, 
        role 
    } = req.body;

    try {
        // Check for existing employee ID or email
        const checkQuery = `
            SELECT * FROM employees 
            WHERE employee_id = $1 OR email = $2
        `;
        const checkResult = await pool.query(checkQuery, [employeeId, email]);

        if (checkResult.rows.length > 0) {
            const existing = checkResult.rows[0];
            if (existing.employee_id === employeeId) {
                return res.status(400).json({ error: 'Employee ID already exists' });
            }
            if (existing.email === email) {
                return res.status(400).json({ error: 'Email already exists' });
            }
        }

        // Insert new employee
        const insertQuery = `
            INSERT INTO employees 
            (first_name, last_name, employee_id, email, phone, department, date_of_joining, role) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id
        `;
        const result = await pool.query(insertQuery, [
            firstName, 
            lastName, 
            employeeId, 
            email, 
            phone, 
            department, 
            dateOfJoining, 
            role
        ]);

        res.status(201).json({ 
            message: 'Employee added successfully', 
            id: result.rows[0].id 
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to add employee' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
