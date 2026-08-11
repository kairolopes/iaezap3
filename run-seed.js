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

async function runSeed() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await client.connect();
    console.log('✅ Conectado!\n');

    // Read seed file
    const seedPath = path.join(__dirname, 'supabase/migrations/seed.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');

    console.log('🌱 Inserindo dados de teste...');

    // Execute seed
    await client.query(seedSQL);

    console.log('\n✅ Seed executado com sucesso!\n');
    console.log('📋 Dados criados:');
    console.log('  ✓ Master User: kairo@zapbaratinho.com.br');
    console.log('  ✓ Company: Floral da Esquina');
    console.log('  ✓ Agents:');
    console.log('    - Iaê (TRIAGE) - Roteador inteligente');
    console.log('    - Sales Agent (SALES) - Vendedor de flores');
    console.log('    - Scheduler (SCHEDULING) - Agendador de entregas');
    console.log('    - Support (SUPPORT) - Suporte pós-venda');
    console.log('\n🎉 Sistema pronto para testes!');

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

runSeed();
