// api class
class APIUtils {
    constructor(baseUrl = null) {
        if (baseUrl) {
            this.apiBaseUrl = baseUrl;
        } else {
            const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
            this.apiBaseUrl = isLocalhost ? "http://localhost:5000/api" : "https://legalai-pro-lav4.onrender.com/api";
        }
    }
    
    async apiCall(endpoint, method = "GET", data = null) {
        try {
            const config = {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                },
            };
            
            if (data && method !== "GET") {
                config.body = JSON.stringify(data);
            }
            
            const response = await fetch(`${this.apiBaseUrl}${endpoint}`, config);
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || `HTTP error! status: ${response.status}`);
            }
            
            return result;
        } catch (error) {
            console.error("API call failed:", error);
            this.showNotification("API Error: " + error.message, "error");
            throw error;
        }
    }
    
    async uploadFile(file) {
        try {
            const formData = new FormData();
            formData.append("file", file);
            
            const response = await fetch(`${this.apiBaseUrl}/contract/upload`, {
                method: "POST",
                body: formData,
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || `HTTP error! status: ${response.status}`);
            }
            
            return result;
        } catch (error) {
            console.error("File upload failed:", error);
            this.showNotification("Upload failed: " + error.message, "error");
            throw error;
        }
    }
    
    showNotification(message, type) {
        // notify
        if (window.uiUtils) {
            window.uiUtils.showNotification(message, type);
        } else {
            console.log('[' + type.toUpperCase() + '] ' + message);
        }
    }
}

// export
window.APIUtils = APIUtils;