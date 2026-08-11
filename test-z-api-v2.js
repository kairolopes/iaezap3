const axios = require('axios');
require('dotenv').config({ path: './backend/.env' });

const instanceId = process.env.Z_API_INSTANCE_ID;
const token = process.env.Z_API_TOKEN;

const client = axios.create({
  baseURL: 'https://api.z-api.io',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Client-Token': token,
  },
});

async function testAPIs() {
  try {
    console.log('🔍 Testando diferentes endpoints Z-API...\n');

    // Test 1: Get instance (com Client-Token header)
    console.log('Teste 1: GET /instances/{instanceId}');
    try {
      const res = await client.get(`/instances/${instanceId}`);
      console.log('✅ Resposta:', res.data);
    } catch (e) {
      console.log('❌', e.response?.status, e.response?.data?.message || e.message);
    }

    // Test 2: Simple send test
    console.log('\nTeste 2: POST /instances/{instanceId}/token/{token}/send-text');
    try {
      const res = await axios.post(
        `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`,
        {
          phone: '5585987654321',
          message: 'Teste de conexão IAEZAP',
        },
        { timeout: 10000 }
      );
      console.log('✅ Resposta:', res.data);
    } catch (e) {
      console.log('❌', e.response?.status, e.response?.data || e.message);
    }

    // Test 3: Get webhook URL
    console.log('\nTeste 3: Verificando webhook config');
    try {
      const res = await axios.post(
        `https://api.z-api.io/instances/${instanceId}/token/${token}/webhook`,
        { url: 'http://localhost:3000/api/whatsapp/webhook' },
        { timeout: 10000 }
      );
      console.log('✅ Webhook registrado:', res.data);
    } catch (e) {
      console.log('❌', e.response?.status, e.response?.data || e.message);
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO:');
    console.log('='.repeat(60));
    console.log(`✅ Instance ID: ${instanceId}`);
    console.log(`✅ Token configurado: ${token.substring(0, 10)}...`);
    console.log(`✅ Backend pronto em: http://localhost:3000`);
    console.log(`✅ Webhook URL: http://localhost:3000/api/whatsapp/webhook`);
    console.log('\n🚀 Próximo passo: Reiniciar backend com novo módulo WhatsApp\n');

  } catch (error) {
    console.error('Erro:', error.message);
  }
}

testAPIs();
