const axios = require('axios');
require('dotenv').config({ path: './backend/.env' });

const instanceId = process.env.Z_API_INSTANCE_ID;
const token = process.env.Z_API_TOKEN;
const clientToken = process.env.Z_API_CLIENT_TOKEN;

async function testNumbers() {
  const numbers = [
    '62985635204',      // Original
    '5562985635204',    // Com código Brasil +55
    '5585987654321',    // Teste
  ];

  console.log('🔍 Testando diferentes formatos de número...\n');

  for (const phone of numbers) {
    try {
      console.log(`📱 Testando: ${phone}`);
      const res = await axios.post(
        `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`,
        {
          phone,
          message: 'Teste IAEZAP - Sistema funcional!'
        },
        {
          headers: { 'Client-Token': clientToken },
          timeout: 5000
        }
      );
      console.log(`   ✅ Enviado! ID: ${res.data.messageId}\n`);
    } catch (e) {
      console.log(`   ❌ Erro: ${e.response?.data?.error || e.message}\n`);
    }
  }
}

testNumbers();
