// server.js
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

// Supabase setup
const supabase = createClient(
  'https://qpdjxackiwheeleoqgss.supabase.co',
  'sb_publishable_PsQCBWrFcEMoYbGQhRJZrg_wLFG5Say'
);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'FitFlow API live from Syria!' });
});

// Add user (from Tally form)
app.post('/api/add-user', async (req, res) => {
  const { name, phone, language = 'en' } = req.body;
  try {
    const { error } = await supabase
      .from('users')
      .insert([{ name, phone, language }]);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
