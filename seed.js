// seed.js - creates database tables and sample data
require('dotenv').config();
const pool = require('./db');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    console.log("Creating tables...");

    // Users table tayar karne
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'USER'
      );
    `);

    console.log("Table 'users' created successfully.");

    // Optional: Sample Admin user add karne (Password: admin123)
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await pool.query(`
      INSERT INTO users (username, password, role)
      VALUES ($1, $2, $3)
      ON CONFLICT (username) DO NOTHING;
    `, ["admin", hashedPassword, "ADMIN"]);

    console.log("Sample admin user created (Username: admin, Password: admin123).");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding database:", err); // Ithe .message kadhun takla ahe
    process.exit(1);
  }
}

seedDatabase();