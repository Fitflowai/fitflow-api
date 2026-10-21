const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const router = express.Router();

// Initialize Supabase using your environment variables
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// POST /api/webhook/tally
router.post('/', async (req, res) => {
  try {
    const { answers } = req.body;
    
    // Tally sends answers as an object keyed by field ID. 
    // This extracts the text values dynamically so it doesn't break if IDs change.
    const values = Object.values(answers).map(a => a.text || a.value || '');
    
    // Map to your form fields (Adjust indices if your form order changes):
    // 0: Name, 1: Phone, 2: Bottleneck, 3: Language
    const name = values[0] || 'FitFlow User';
    const phone = values[1] || '';
    const bottleneck = values[2] || 'None';
    const language = values[3] || 'en';

    // Safety check: We need a phone number to text them!
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Insert into your Supabase 'users' table
    const { data, error } = await supabase
      .from('users')
      .insert([{ 
        name, 
        phone, 
        bottleneck, 
        language,
        created_at: new Date()
      }]);

    if (error) throw error;

    console.log(`✅ New user added: ${name} (${phone})`);
    res.status(200).json({ success: true, user: data });
    
  } catch (error) {
    console.error(' Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
