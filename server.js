// server.js - the main program that runs the web server
require("dotenv").config(); // Load the .env file into process.env[span_0](start_span)[span_0](end_span)
const path = require("path"); // Built-in helper for building file paths[span_1](start_span)[span_1](end_span)
const express = require("express"); // The web framework: it receives HTTP requests[span_2](start_span)[span_2](end_span)
const bcrypt = require("bcryptjs"); // Hashes passwords and checks them securely[span_3](start_span)[span_3](end_span)
const jwt = require("jsonwebtoken"); // Creates and verifies login tokens[span_4](start_span)[span_4](end_span)
const pool = require("./db"); // Our database connection[span_5](start_span)[span_5](end_span)

const JWT_SECRET = process.env.JWT_SECRET; // The secret key that signs and verifies JWTs[span_6](start_span)[span_6](end_span)
const PORT = process.env.PORT || 5000; // Use the port from .env or default to 5000[span_7](start_span)[span_7](end_span)

if (!JWT_SECRET || JWT_SECRET.length < 16) {
  // Refuse to start with a missing or weak secret[span_8](start_span)[span_8](end_span)
  console.error(
    "Please set JWT_SECRET (at least 16 characters) in your .env file"
  ); // Tell the developer what to fix[span_9](start_span)[span_9](end_span)
  process.exit(1); // Stop the program[span_10](start_span)[span_10](end_span)
}

const app = express(); // Create the web application[span_11](start_span)[span_11](end_span)
app.use(express.json()); // Read JSON sent by the browser and parse it into req.body[span_12](start_span)[span_12](end_span)
app.use(express.static(path.join(__dirname, "public"))); // Serve static files from the public folder[span_13](start_span)[span_13](end_span)

// STEP 1: REGISTER - create an account
// -------------------------------------------------------------
app.post("/api/register", async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    // Password hash karne (bcryptjs use karun)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Database madhe insert karne
    const newUser = await pool.query(
      "INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role",
      [username, hashedPassword, role || 'USER']
    );

    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// -------------------------------------------------------------
// STEP 2: LOGIN - check the password and hand out a token
// -------------------------------------------------------------
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // User database madhe shodhne
    const userQuery = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (userQuery.rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const user = userQuery.rows[0];

    // Password check karne
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // JWT Token generate karne
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error during login" });
  }
});

// Server start karne
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});