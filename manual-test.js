// Manual test - bypassing the auto-discovery system
console.log('🧪 Manual module test starting...');

// Import the working Supabase module
import('./modules/core/supabase-client.js').then(async (supabaseModule) => {
  console.log('✅ Supabase module loaded manually');
  
  // Test the connection
  const client = supabaseModule.default;
  const isHealthy = await client.testConnection();
  console.log('Database connection:', isHealthy ? '✅ Healthy' : '❌ Failed');
  
  // Test a simple query
  try {
    const today = new Date().toISOString().slice(0, 10);
    const results = await client.loadTodayResults(today);
    console.log(`✅ Loaded ${results.length} puzzle results for today`);
    
    console.log('🎉 Module system is fully functional!');
    console.log('💡 Next step: Fix the auto-discovery system');
    
    // Make the client available globally for testing
    window.supabaseClient = client;
    console.log('📍 Supabase client available as window.supabaseClient');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
  
}).catch(error => {
  console.error('💥 Manual module load failed:', error);
});