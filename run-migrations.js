const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });
const fs = require('fs');
const path = require('path');

// Extract connection details from Supabase URL
const supabaseUrl = process.env.SUPABASE_URL;
const match = supabaseUrl.match(/https:\/\/([a-z0-9]+)\.supabase\.co/);
const projectRef = match ? match[1] : null;

if (!projectRef) {
  console.error('❌ Não consegui extrair o project ref da URL');
  process.exit(1);
}

// Supabase default connection
const connectionString = `postgresql://postgres:Bate123ria@5@db.${projectRef}.supabase.co:5432/postgres`;

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function runMigrations() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await client.connect();
    console.log('✅ Conectado!');

    // Read migration file
    const migrationPath = path.join(__dirname, 'supabase/migrations/20260811_init.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('🗑️  Deletando tabelas antigas...');
    console.log('✅ Criando tabelas novas...');

    // Execute migration
    await client.query(migrationSQL);

    console.log('✅ Todas as migrations executadas com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('1. cd backend && npm install');
    console.log('2. npm run start:dev');
    console.log('3. Em outro terminal: cd frontend && npm install && npm run dev');
    console.log('\nFrontend: http://localhost:5173');
    console.log('Backend: http://localhost:3000');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.message.includes('password authentication failed')) {
      console.error('\n⚠️  A senha do PostgreSQL pode estar incorreta.');
      console.error('Tenta com sua senha pessoal ou reseta em: https://app.supabase.com/account/password');
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
