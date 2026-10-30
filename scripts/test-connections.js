import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

const geminiKey = process.env.GEMINI_API_KEY;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing connectivity...');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase key length:', supabaseSecret ? supabaseSecret.length : 0);
console.log('Gemini key length:', geminiKey ? geminiKey.length : 0);

async function testGemini() {
  if (!geminiKey) return console.log('No Gemini key found.');
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Return JSON: {"ok": true, "message": "JASHN AI active"}' }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });
    console.log('Gemini status:', res.status);
    const data = await res.json();
    console.log('Gemini result:', data.candidates?.[0]?.content?.parts?.[0]?.text?.trim());
  } catch (err) {
    console.error('Gemini test failed:', err);
  }
}

async function testSupabase() {
  if (!supabaseUrl || !supabaseSecret) return console.log('No Supabase credentials found.');
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        apikey: supabaseSecret,
        Authorization: `Bearer ${supabaseSecret}`
      }
    });
    console.log('Supabase REST API status:', res.status);
  } catch (err) {
    console.error('Supabase test failed:', err);
  }
}

async function run() {
  await testGemini();
  await testSupabase();
}
run();
