import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  port: 3307,
  user: 'root',
  password: 'S@ksham123',
  database: 'nawa_db'
});

try {
  // Add section column to Students table
  await connection.execute(`
    ALTER TABLE Students 
    ADD COLUMN section VARCHAR(255) DEFAULT 'A'
  `);
  console.log('✅ Section column added successfully!');
} catch (error) {
  if (error.code === 'ER_DUP_FIELDNAME') {
    console.log('ℹ️  Section column already exists');
  } else {
    console.error('❌ Error adding section column:', error.message);
  }
} finally {
  await connection.end();
}
