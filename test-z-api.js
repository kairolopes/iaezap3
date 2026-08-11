const axios = require('axios');
require('dotenv').config({ path: './backend/.env' });

const instanceId = process.env.Z_API_INSTANCE_ID;
const token = process.env.Z_API_TOKEN;

if (!instanceId || !token) {
  console.error('❌ Variáveis Z_API_INSTANCE_ID ou Z_API_TOKEN não configuradas');
  process.exit(1);
}

const client = axios.create({
  baseURL: 'https://api.z-api.io',
  timeout: 10000,
});

async function testConnection() {
  try {
    console.log('🔍 Testando conexão Z-API...\n');
    console.log(`Instance ID: ${instanceId}`);
    console.log(`Token: ${token.substring(0, 10)}...${token.substring(-10)}\n`);

    // Test 1: Check instance status
    console.log('📋 Teste 1: Verificando status da instância...');
    const statusResponse = await client.get(
      `/instances/${instanceId}/token/${token}/status`,
    );
    console.log('✅ Status:', statusResponse.data);

    // Test 2: Get profile info
    console.log('\n👤 Teste 2: Obtendo info do perfil...');
    const profileResponse = await client.get(
      `/instances/${instanceId}/token/${token}/profile`,
    );
    console.log('✅ Perfil:', {
      phone: profileResponse.data.phone,
      name: profileResponse.data.name,
      isConnected: profileResponse.data.isConnected,
    });

    // Test 3: List recent messages
    console.log('\n💬 Teste 3: Listando mensagens recentes...');
    const messagesResponse = await client.get(
      `/instances/${instanceId}/token/${token}/chats`,
    );
    console.log('✅ Chats encontrados:', messagesResponse.data.chats?.length || 0);

    console.log('\n🎉 Todos os testes passaram! Z-API funcionando corretamente.\n');
    console.log('📝 Próximos passos:');
    console.log('1. cd backend && npm install');
    console.log('2. npm run start:dev');
    console.log('3. POST http://localhost:3000/api/whatsapp/register-webhook');
    console.log('4. Enviar mensagem no WhatsApp para testar webhook\n');

  } catch (error) {
    console.error('❌ Erro na Z-API:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      errors: error.response?.data?.errors,
    });
    process.exit(1);
  }
}

testConnection();
