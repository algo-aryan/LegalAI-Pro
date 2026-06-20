// app setup
class LegalAIApp {
    constructor() {
        this.currentSection = "home";
        this.chatHistory = [];
        this.contractChatHistory = [];
        this.isAnalyzing = false;
        this.uploadedContract = null;
        this.currentSessionId = null;
        this.apiBaseUrl = "http://localhost:5000/api";
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