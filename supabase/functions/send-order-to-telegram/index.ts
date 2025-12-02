import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const managerChatIdsString = Deno.env.get('TELEGRAM_MANAGER_CHAT_ID');

    if (!telegramBotToken || !managerChatIdsString) {
      console.error('TELEGRAM_BOT_TOKEN or TELEGRAM_MANAGER_CHAT_ID is not set in Supabase secrets.');
      return new Response('Telegram bot token or manager chat ID not configured.', { status: 500, headers: corsHeaders });
    }

    const managerChatIds = managerChatIdsString.split(',').map(id => id.trim()).filter(id => id.length > 0);

    if (managerChatIds.length === 0) {
      console.error('No valid manager chat IDs found in TELEGRAM_MANAGER_CHAT_ID.');
      return new Response('No valid manager chat IDs configured.', { status: 500, headers: corsHeaders });
    }

    const { orderNumber, items, totalAmount, customerInfo } = await req.json();

    const orderDetails = items.map((item: any) =>
      `  - ${item.name} (${item.quantity} шт.) - ${item.price.toFixed(2)} грн/шт.`
    ).join('\n');

    const messageText = `
*Нове замовлення №${orderNumber.substring(0, 8)}!*

*Клієнт:*
Ім'я: ${customerInfo.name}
Телефон: ${customerInfo.phone}
Місто: ${customerInfo.city}

*Деталі замовлення:*
${orderDetails}

*Загальна сума:* ${totalAmount.toFixed(2)} грн
`;

    const telegramApiUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;

    for (const chatId of managerChatIds) {
      await fetch(telegramApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageText,
          parse_mode: 'Markdown',
        }),
      });
    }

    return new Response('Order sent to Telegram managers successfully!', { headers: corsHeaders });
  } catch (error) {
    console.error('Error sending order to Telegram:', error);
    return new Response(`Error: ${error.message}`, { status: 500, headers: corsHeaders });
  }
});