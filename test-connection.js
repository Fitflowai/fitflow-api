const { createClient } = require('@supabase/supabase-js');
   require('dotenv').config();

   const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

   async function test() {
     console.log('🔌 Testing Supabase connection...');
     
     const { data, error } = await supabase
       .from('users')
       .select('*');

     if (error) {
       console.error('❌ Supabase Error:', error);
      } else {
       console.log('✅ SUCCESS! Connected to database.');
       console.log('👥 Found users:', data);
     }
   }

   test();