const { Pool } = require('pg');

// Create a new pool instance
const pool = new Pool({
    user: 'postgres',
    password: 'root',
    host: 'localhost',
    port: 5432, // default PostgreSQL port
    database: 'Missing',
});

// Test the connection
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    console.log('Connected to PostgreSQL database');

    // Perform database operations here

    // Release the client back to the pool
    release();
});

// Export the pool for other modules to use
module.exports = pool;