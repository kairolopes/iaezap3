const axios = require('axios');
require('dotenv').config({ path: './backend/.env' });

const instanceId = process.env.Z_API_INSTANCE_ID;
const token = process.env.Z_API_TOKEN;
const clientToken = process.env.Z_API_CLIENT_TOKEN;

console.log('📋 Credenciais:');
console.log(`Instance ID: ${instanceId}`);
console.log(`Token: ${token}`);
console.log(`Client Token: ${clientToken}\n`);

async function testDirectSend() {
  try {
    console.log('🚀 Enviando mensagem de teste...\n');

    const response = await axios.post(
      `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`,
      {
        phone: '5585987654321',
        message: 'Teste de conexão IAEZAP - Sistema pronto!',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Client-Token': clientToken,
        },
        timeout: 10000,
      }
    );

    console.log('✅ SUCESSO! Z-API respondeu:');
    console.log(JSON.stringify(response.data, null, 2));

  } catch (error) {
    if (error.response) {
      console.error('❌ Erro da Z-API:');
      console.error(`Status: ${error.response.status}`);
      console.error(`Dados: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error('❌ Erro de conexão:', error.message);
    }
  }
}

testDirectSend();
