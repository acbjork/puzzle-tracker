// I'm Puzzled - Module Auto-Discovery System v1.0
class ModuleLoader {
  constructor() {
    this.modules = new Map();
    this.loadedModules = new Set();
    this.devMode = localStorage.getItem('devMode') === 'true';
    this.baseUrl = this.devMode ? './modules/' : 'https://cdn.puzzleapp.com/modules/';
    console.log(`🚀 Module Loader initialized in ${this.devMode ? 'DEVELOPMENT' : 'PRODUCTION'} mode`);
  }

  async loadModule(modulePath) {
    if (this.loadedModules.has(modulePath)) {
      return this.modules.get(modulePath);
    }

    try {
      const fullPath = this.baseUrl + modulePath;
      const module = await import(fullPath);
      this.modules.set(modulePath, module);
      this.loadedModules.add(modulePath);
      console.log(`✅ Loaded: ${modulePath}`);
      return module;
    } catch (error) {
      console.error(`❌ Failed to load ${modulePath}:`, error);
      
      // Fallback to CDN if local fails, or vice versa
      const fallbackUrl = this.devMode ? 'https://cdn.puzzleapp.com/modules/' : './modules/';
      try {
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
      'core/supabase-client.js',
      'core/user-management.js', 
      'core/puzzle-logic.js'
    ];
    
    const uiModules = [
      'ui/chat-system.js',
      'ui/puzzle-table.js',
      'ui/scoreboard.js',
      'ui/history-modal.js'
    ];

    const utilModules = [
      'utils/date-helpers.js',
      'utils/html-helpers.js'
    ];

    // Load in dependency order
    for (const module of [...coreModules, ...utilModules, ...uiModules]) {
      await this.loadModule(module);
    }
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