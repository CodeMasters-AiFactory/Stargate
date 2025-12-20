import pg from 'pg';
const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/stargate';

async function setupDatabase() {
  // Parse the connection string to get database name
  const url = new URL(DATABASE_URL.replace('postgresql://', 'http://'));
  const dbName = url.pathname.slice(1); // Remove leading /
  const baseUrl = DATABASE_URL.replace(`/${dbName}`, '/postgres'); // Connect to default 'postgres' database first

  console.log('🔍 Checking database connection...');
  console.log(`   Database URL: ${DATABASE_URL.replace(/:[^:@]+@/, ':****@')}`); // Hide password
  console.log(`   Target database: ${dbName}`);

  // First, connect to default 'postgres' database to check if target database exists
  const adminPool = new Pool({ connectionString: baseUrl });

  try {
    // Test connection to default database
    await adminPool.query('SELECT 1');
    console.log('✅ Connected to PostgreSQL server');

    // Check if database exists
    const dbCheck = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );

    if (dbCheck.rows.length === 0) {
      console.log(`📦 Database '${dbName}' does not exist, creating...`);
      await adminPool.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Database '${dbName}' created successfully`);
    } else {
      console.log(`✅ Database '${dbName}' already exists`);
    }

    // Now test connection to the actual database
    const appPool = new Pool({ connectionString: DATABASE_URL });
    await appPool.query('SELECT 1');
    console.log(`✅ Successfully connected to database '${dbName}'`);

    // Run migrations/schema setup if needed
    console.log('📋 Checking if schema needs to be initialized...');
    const tablesCheck = await appPool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    if (tablesCheck.rows.length === 0) {
      console.log('📋 No tables found, you may need to run migrations');
      console.log('   Run: npm run db:push');
    } else {
      console.log(`✅ Found ${tablesCheck.rows.length} table(s) in database`);
    }

    await appPool.end();
    await adminPool.end();
    
    console.log('\n✅ Database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:');
    console.error(`   Error: ${error.message}`);
    
    if (error.message.includes('password authentication failed')) {
      console.error('\n💡 Password authentication failed.');
      console.error('   Please check your DATABASE_URL in .env file');
      console.error('   Format: postgresql://username:password@localhost:5432/database');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Connection refused. PostgreSQL may not be running.');
      console.error('   Start PostgreSQL service: Get-Service -Name postgresql* | Start-Service');
    } else if (error.message.includes('does not exist')) {
      console.error('\n💡 Database user does not exist.');
      console.error('   Create user or update DATABASE_URL with correct username');
    }
    
    await adminPool.end().catch(() => {});
    process.exit(1);
  }
}

setupDatabase();

