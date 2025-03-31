const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false // Render에서 PostgreSQL 연결 시 필요할 수 있음
    }
});

pool.on('connect', () => {
    console.log('✅ 데이터베이스 연결 성공');
});

pool.on('error', (err) => {
    console.error('❌ 데이터베이스 연결 오류:', err);
});

module.exports = { pool };
