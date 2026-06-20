// ui utils
class UIUtils {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupModals();
        this.setupResponsive();
        this.setupNotifications();
    }
    
    setupModals() {
        // escape
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                this.closeAllModals();
            }
        });
        
        // close handlers
        document.querySelectorAll('.modal-close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                this.closeAllModals();
            });
        });
        
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', () => {
                this.closeAllModals();
            });
        });
    }
    
    closeAllModals() {
        // close modals
        document.querySelectorAll(".modal:not(.hidden)").forEach((modal) => {
            modal.classList.add("hidden");
        });
        
        // close sidebar
        const sidebar = document.querySelector(".chat-sidebar.active");
        if (sidebar) {
            sidebar.classList.remove("active");
        }
    }
    
    setupResponsive() {
        // mobile menu
        const hamburger = document.getElementById("nav-hamburger");
        const navMenu = document.getElementById("nav-menu");
        if (hamburger && navMenu) {
            hamburger.addEventListener("click", () => {
                navMenu.classList.toggle("active");
                hamburger.classList.toggle("active");
            });
        }
        
        // scroll
        window.addEventListener("scroll", () => {
            const navbar = document.getElementById("navbar");
            if (window.scrollY > 50) {
                navbar.classList.add("scrolled");
            } else {
                navbar.classList.remove("scrolled");
            }
        });
    }
    
    setupNotifications() {
        // container setup
        if (!document.getElementById('notification-container')) {
            const container = document.createElement('div');
            container.id = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
            `;
            document.body.appendChild(container);
        }
    }
    
    showNotification(message, type = 'info', duration = 5000) {
        const container = document.getElementById('notification-container');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            padding: 12px 16px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            max-width: 300px;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        
        // bg color
        const colors = {
            success: '#10b981',
            error: '#ef4444', 
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        container.appendChild(notification);
        
        // animate
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // auto remove
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (container.contains(notification)) {
                    container.removeChild(notification);
                }
            }, 300);
        }, duration);
    }
}

// global
window.UIUtils = UIUtils;

// init
document.addEventListener('DOMContentLoaded', function() {
    window.uiUtils = new UIUtils();
});