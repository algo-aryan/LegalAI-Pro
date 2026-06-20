// app setup
class LegalAIApp {
    constructor() {
        this.currentSection = "home";
        this.chatHistory = [];
        this.contractChatHistory = [];
        this.isAnalyzing = false;
        this.uploadedContract = null;
        this.currentSessionId = null;
        const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
        // REPLACE_ME_IN_PRODUCTION with your render backend URL (e.g., "https://legal-ai-backend.onrender.com/api")
        this.apiBaseUrl = isLocalhost ? "http://localhost:5000/api" : "https://legal-ai-backend.onrender.com/api";
        this.currentTheme = localStorage.getItem("theme") || "light";
        
        // init modules
        this.initModules();
    }
    
    initModules() {
        // core
        this.apiUtils = new window.APIUtils(this.apiBaseUrl);
        
        // page
        const path = window.location.pathname;
        
        if (path.includes('contract-analyzer') && window.ContractAnalyzer) {
            this.contractAnalyzer = new window.ContractAnalyzer(this.apiUtils);
        }
        
        if (path.includes('virtual-assistant') && window.VirtualAssistant) {
            this.virtualAssistant = new window.VirtualAssistant(this.apiUtils);
        }

    }
    
    // legacy
    showNotification(message, type) {
        if (window.uiUtils) {
            window.uiUtils.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
}

// init
document.addEventListener('DOMContentLoaded', function() {
    if (window.APIUtils) {
        window.legalAIApp = new LegalAIApp();
    }
});