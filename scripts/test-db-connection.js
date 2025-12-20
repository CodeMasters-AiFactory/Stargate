import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.log('❌ DATABASE_URL not set in environment');
  process.exit(1);
}

console.log('🔍 Testing database connection...');
console.log(`   URL: ${DATABASE_URL.replace(/:[^:@]+@/, ':****@')}`);

const pool = new Pool({ connectionString: DATABASE_URL });

try {
  const result = await pool.query('SELECT version(), current_database(), current_user');
  console.log('✅ Database connection successful!');
  console.log(`   PostgreSQL Version: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`);
  console.log(`   Database: ${result.rows[0].current_database}`);
  console.log(`   User: ${result.rows[0].current_user}`);
  
  // Test if tables exist
  const tablesResult = await pool.query(`
    SELECT COUNT(*) as count 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
  `);
  console.log(`   Tables in database: ${tablesResult.rows[0].count}`);
  
  await pool.end();
  process.exit(0);
} catch (error) {
  console.error('❌ Database connection failed:');
  console.error(`   Error: ${error.message}`);
  
  if (error.message.includes('password authentication failed')) {
    console.error('\n💡 Password authentication failed.');
    console.error('   Check your DATABASE_URL in .env file');
  } else if (error.message.includes('ECONNREFUSED')) {
    console.error('\n💡 Connection refused. PostgreSQL may not be running.');
    console.error('   Start PostgreSQL: Get-Service -Name postgresql* | Start-Service');
  } else if (error.message.includes('does not exist')) {
    console.error('\n💡 Database does not exist.');
    console.error('   Run: node scripts/setup-database.js');
  }
  
  await pool.end().catch(() => {});
  process.exit(1);
}

