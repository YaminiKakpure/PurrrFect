const mysql = require("mysql2/promise");

// Create the pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root@123",
  database: process.env.DB_NAME || "petcare_app",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Create a wrapper object
const db = {
  // The actual pool
  pool: pool,
  
  // Helper method to get a connection
  getConnection: () => pool.getConnection(),
  
  // Direct query method
  query: (sql, values) => pool.query(sql, values)
};

// Export the wrapper object
module.exports = db;


// const mysql = require('mysql2');
// const dotenv = require('dotenv');

// dotenv.config(); // Load environment variables

// // ✅ MySQL Database Connection
// const db = mysql.createConnection({
//     host: process.env.DB_HOST || 'localhost',
//     user: process.env.DB_USER || 'root',
//     password: process.env.DB_PASS || 'root@123',
//     database: process.env.DB_NAME || 'petcare_app'
// });

// // ✅ Connect to MySQL
// db.connect((err) => {
//     if (err) {
//         console.error('❌ MySQL Connection Error:', err);
//     } else {
//         console.log('✅ MySQL Connected Successfully');
//     }
// });

// module.exports = db; // Exporting DB connection for use in other files
