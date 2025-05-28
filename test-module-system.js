// Test script to verify v0.7.0 module system works
// Run this in browser console after loading index-v0.7.0.html

async function testModuleSystem() {
  console.log('🧪 Testing I\'m Puzzled v0.7.0 Module System...');
  
  try {
    // Test 1: Module Loader exists
    console.log('📋 Test 1: Module Loader exists');
    if (!window.moduleLoader) {
      throw new Error('❌ window.moduleLoader not found');
    }
    console.log('✅ Module Loader found');
    
    // Test 2: Load Supabase client module
    console.log('📋 Test 2: Loading Supabase client module');
    const supabaseModule = await window.moduleLoader.loadModule('core/supabase-client.js');
    
    if (!supabaseModule.default) {
      throw new Error('❌ Supabase module not exported correctly');
    }
    console.log('✅ Supabase module loaded');
    
    // Test 3: Test Supabase connection
    console.log('📋 Test 3: Testing Supabase connection');
    const client = supabaseModule.default;
    const isHealthy = await client.testConnection();
    
    if (!isHealthy) {
      throw new Error('❌ Supabase connection failed');
    }
    console.log('✅ Supabase connection healthy');
    
    // Test 4: Test dev mode toggle
    console.log('📋 Test 4: Testing dev mode toggle');
    const originalMode = window.moduleLoader.devMode;
    console.log(`Current mode: ${originalMode ? 'DEVELOPMENT' : 'PRODUCTION'}`);
    console.log('✅ Dev mode toggle available (use toggleDevMode())');
    
    // Test 5: Module loading metrics
    console.log('📋 Test 5: Module loading metrics');
    console.log(`Modules loaded: ${window.moduleLoader.loadedModules.size}`);
    console.log(`Modules cached: ${window.moduleLoader.modules.size}`);
    console.log('Loaded modules:', Array.from(window.moduleLoader.loadedModules));
    
    console.log('🎉 ALL TESTS PASSED! Module system is working correctly.');
    console.log('💡 Next steps:');
    console.log('   1. Create user-management.js module');
    console.log('   2. Create date-helpers.js module');
    console.log('   3. Begin extracting UI components');
    
    return true;
    
  } catch (error) {
    console.error('💥 Module system test failed:', error);
    console.log('🔧 Troubleshooting steps:');
    console.log('   1. Check if index-v0.7.0.html is loaded');
    console.log('   2. Ensure modules/ folder exists');
    console.log('   3. Check browser console for module loading errors');
    console.log('   4. Try toggleDevMode() to switch between local/CDN');
    
    return false;
  }
}

// Auto-run test if loaded directly
if (typeof window !== 'undefined') {
  window.testModuleSystem = testModuleSystem;
  console.log('🧪 Module system test loaded. Run testModuleSystem() to begin.');
}