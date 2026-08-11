const axios = require('axios');
require('dotenv').config({ path: './backend/.env' });

const instanceId = process.env.Z_API_INSTANCE_ID;
const token = process.env.Z_API_TOKEN;
const clientToken = process.env.Z_API_CLIENT_TOKEN;

async function sendMessage() {
  try {
    console.log('📱 Enviando mensagem via Z-API...\n');

    const response = await axios.post(
      `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`,
      {
        phone: '62985635204',
        message: '🤖 Olá! Esta é uma mensagem de teste do sistema IAEZAP. O WhatsApp está integrado e funcionando corretamente! 🚀',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Client-Token': clientToken,
        },
        timeout: 10000,
      }
    );

    console.log('✅ MENSAGEM ENVIADA COM SUCESSO!\n');
    console.log('📊 Detalhes:');
    console.log(`  📱 Número: 62985635204`);
    console.log(`  💬 Mensagem: "Olá! Esta é uma mensagem de teste..."`);
    console.log(`  🆔 Message ID: ${response.data.messageId}`);
    console.log(`  🎫 Zaap ID: ${response.data.zaapId}\n`);
    console.log('⏱️  A mensagem deve chegar em segundos!\n');

  } catch (error) {
    console.error('❌ Erro ao enviar:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Erro: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(error.message);
    }
  }
}

sendMessage();
