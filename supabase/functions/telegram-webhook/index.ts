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
    if (!telegramBotToken) {
      console.error('TELEGRAM_BOT_TOKEN is not set in Supabase secrets.');
      return new Response('Telegram bot token not configured.', { status: 500, headers: corsHeaders });
    }

    const update = await req.json();
    const message = update.message;

    if (message && message.text && message.chat.id) {
      const chatId = message.chat.id;
      const text = message.text;

      if (text === '/start') {
        // Replace with your actual deployed Vercel app URL
        const webAppUrl = "https://YOUR_VERCEL_APP_URL.vercel.app/lighting-store"; 
        const responseText = `Ласкаво просимо до нашого магазину освітлення! ✨\n\nПерегляньте наші товари тут: ${webAppUrl}`;

        const telegramApiUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
        await fetch(telegramApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: responseText,
            parse_mode: 'Markdown',
          }),
        });
      }
    }

    return new Response('OK', { headers: corsHeaders });
  } catch (error) {
    console.error('Error processing Telegram webhook:', error);
    return new Response(`Error: ${error.message}`, { status: 500, headers: corsHeaders });
  }
});