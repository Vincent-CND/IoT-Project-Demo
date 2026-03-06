const { Client } = require('pg');

// Biến lưu thông tin database
const dbConfig = {
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "admin123",
  database: "iotproject"
};

async function main() {
  const client = new Client(dbConfig);

  try {
    await client.connect();
    console.log("✅ Connected to PostgreSQL");

    const result = await client.query(`
      SELECT * FROM users_messages;
    `);

    if (result.rows.length > 0) {
      console.log("✅ Table has data:");
      console.table(result.rows);
    } else {
      console.log("⚠️ Table is empty");
    }

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await client.end();
  }
}

main();