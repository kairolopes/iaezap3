// ⚠️ SCRIPT SEGURO - Apenas lê do Supabase, NÃO toca na Z-API!
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMessages() {
  try {
    console.log('\n📱 Verificando mensagens no banco de dados...\n');

    // Get all conversations
    const { data: conversations } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    console.log(`📊 Total de conversas: ${conversations?.length || 0}\n`);

    if (!conversations || conversations.length === 0) {
      console.log('❌ Nenhuma conversa encontrada');
      return;
    }

    // Get latest messages
    const { data: messages } = await supabase
      .from('messages')
      .select(
        `
        id,
        text,
        sender,
        is_from_ai,
        created_at,
        conversation_id
      `,
      )
      .order('created_at', { ascending: false })
      .limit(20);

    console.log('📨 Últimas mensagens:');
    console.log('='.repeat(80));

    if (messages && messages.length > 0) {
      messages.forEach((msg, idx) => {
        const conversation = conversations.find((c) => c.id === msg.conversation_id);
        console.log(`\n${idx + 1}. ${msg.sender === 'CUSTOMER' ? '📱' : '🤖'} ${msg.sender}`);
        console.log(
          `   Número: ${conversation?.customer_phone || 'DESCONHECIDO'}`,
        );
        console.log(`   Nome: ${conversation?.customer_name || 'N/A'}`);
        console.log(`   Mensagem: ${msg.text}`);
        console.log(`   Timestamp: ${new Date(msg.created_at).toLocaleString('pt-BR')}`);
      });
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('\n📊 RESUMO:');
    console.log(`✅ Total de conversas: ${conversations.length}`);
    console.log(`✅ Total de mensagens: ${messages?.length || 0}`);

    const incomingMessages = messages?.filter((m) => m.sender === 'CUSTOMER') || [];
    const aiMessages = messages?.filter((m) => m.sender === 'AI') || [];

    console.log(`📱 Mensagens recebidas: ${incomingMessages.length}`);
    console.log(`🤖 Respostas da IA: ${aiMessages.length}`);

    if (incomingMessages.length > 0) {
      const latest = incomingMessages[0];
      const conversation = conversations.find((c) => c.id === latest.conversation_id);
      console.log(`\n✅ Última mensagem recebida:`);
      console.log(`   De: ${conversation?.customer_phone}`);
      console.log(`   Nome: ${conversation?.customer_name}`);
      console.log(`   Texto: "${latest.text}"`);
      console.log(
        `   Hora: ${new Date(latest.created_at).toLocaleString('pt-BR')}`,
      );
    }

    console.log('\n✅ Script seguro - nenhuma chamada para Z-API feita!\n');
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

checkMessages();
