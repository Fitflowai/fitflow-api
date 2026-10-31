// daily-dispatch.js
const { createClient } = require('@supabase/supabase-js');
const twilio = require('twilio');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// The AI Brain: Generates safe, personalized SMS workouts
async function generateWorkout(bottleneck, language) {
  const prompt = `Act as an elite biomechanics coach. Generate a 10-minute desk-worker workout via SMS. 
  User bottleneck: ${bottleneck}. Language: ${language}.
  RULES: 
  1. Under 300 characters total.
  2. Zero equipment. 
  3. If bottleneck is 'lower_back' or 'disc', STRICTLY AVOID spinal flexion, crunches, or high impact. Use gentle decompression only.
  4. Format: ⏱️ Day X: [Name]. Min 0-3: [Move 1]. Min 3-6: [Move 2]. Min 6-9: [Move 3]. 
  5. End with: "Reply DONE 10 when finished."`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://fitflow.ai',
      'X-Title': 'FitFlow AI Dispatcher'
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3-haiku', // Fast, cheap, excellent at following rules
      messages: [{ role: 'user', content: prompt }]
    })
  });
  
  const data = await response.json();
  return data.choices[0].message.content;
}

// The Engine: Fetches users and dispatches
async function dispatchDailyWorkouts() {
  console.log('🚀 Starting daily dispatch...');
  
  // 1. Fetch all active users
  const { data: users, error } = await supabase
    .from('users')
    .select('id, name, phone, bottleneck, language, streak')
    .eq('status', 'active');

  if (error) { console.error('Supabase fetch error:', error); return; }

  // 2. Loop and send
  for (const user of users) {
    try {
      const workoutText = await generateWorkout(user.bottleneck, user.language);
      
      await client.messages.create({
        body: workoutText,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: user.phone
      });
      
      console.log(`✅ Sent to ${user.name} (${user.phone})`);
      
      // Optional: Increment streak or log dispatch here
      
    } catch (err) {
      console.error(`❌ Failed for ${user.name}:`, err.message);
    }
  }
  console.log('🏁 Dispatch complete.');
}

// Run it
dispatchDailyWorkouts();