// I'm Puzzled - Module Auto-Discovery System v1.1 (Fixed)
class ModuleLoader {
  constructor() {
    this.modules = new Map();
    this.loadedModules = new Set();
    // DEFAULT TO DEVELOPMENT MODE since CDN doesn't exist yet
    this.devMode = localStorage.getItem('devMode') !== 'false'; // Default to true
    this.baseUrl = this.devMode ? './modules/' : 'https://cdn.puzzleapp.com/modules/';
    console.log(`🚀 Module Loader initialized in ${this.devMode ? 'DEVELOPMENT' : 'PRODUCTION'} mode`);
  }

  async loadModule(modulePath) {
    if (this.loadedModules.has(modulePath)) {
      return this.modules.get(modulePath);
    }

    try {
      const fullPath = this.baseUrl + modulePath;
      console.log(`📥 Loading: ${fullPath}`);
      const module = await import(fullPath);
      this.modules.set(modulePath, module);
      this.loadedModules.add(modulePath);
      console.log(`✅ Loaded: ${modulePath}`);
      return module;
    } catch (error) {
      console.error(`❌ Failed to load ${modulePath}:`, error);
      
      // Fallback to local if CDN fails, or vice versa
      const fallbackUrl = this.devMode ? 'https://cdn.puzzleapp.com/modules/' : './modules/';
      try {
        console.log(`🔄 Trying fallback: ${fallbackUrl + modulePath}`);
        const module = await import(fallbackUrl + modulePath);
        this.modules.set(modulePath, module);
        this.loadedModules.add(modulePath);
        console.log(`🔄 Fallback loaded: ${modulePath}`);
        return module;
      } catch (fallbackError) {
        console.error(`💥 Complete failure loading ${modulePath}`);
        throw fallbackError;
      }
    }
  }

  async autoDiscover() {
    const coreModules = [
      'core/supabase-client.js'
    ];
    
    // Start with just one module for testing
    for (const module of coreModules) {
      await this.loadModule(module);
    }
    
    console.log('🎯 Core modules loaded successfully!');
  }

  toggleDevMode() {
    this.devMode = !this.devMode;
    localStorage.setItem('devMode', this.devMode.toString());
    console.log(`🔧 Switched to ${this.devMode ? 'DEVELOPMENT' : 'PRODUCTION'} mode`);
    location.reload(); // Reload to apply changes
  }
}

// Global module loader instance
window.moduleLoader = new ModuleLoader();

// Development helper
window.toggleDevMode = () => window.moduleLoader.toggleDevMode();