// Initialize theme
const currentTheme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-color-scheme", currentTheme);

// Theme toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
        themeToggle.addEventListener("click", function() {
            const currentTheme = document.documentElement.getAttribute("data-color-scheme");
            const newTheme = currentTheme === "light" ? "dark" : "light";
            document.documentElement.setAttribute("data-color-scheme", newTheme);
            localStorage.setItem("theme", newTheme);
            
            const icon = themeToggle.querySelector("i");
            if (icon) {
                icon.className = newTheme === "light" ? "fas fa-moon" : "fas fa-sun";
            }
        });
    }
    
    // Update theme toggle icon
    const themeToggle2 = document.getElementById("theme-toggle");
    if (themeToggle2) {
        const icon = themeToggle2.querySelector("i");
        if (icon) {
            icon.className = currentTheme === "light" ? "fas fa-moon" : "fas fa-sun";
        }
    }
});

// Simple navigation for multi-page setup
document.addEventListener('DOMContentLoaded', function() {
    // Update navigation links to point to separate HTML files
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const section = link.getAttribute('data-section');
        if (section && section !== 'features') {
            if (section === 'home') {
                link.href = 'index.html';
            } else {
                link.href = section + '.html';
            }
        }
    });
    
    // Update feature card links
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        const feature = card.getAttribute('data-feature');
        if (feature) {
            card.addEventListener('click', () => {
                window.location.href = feature + '.html';
            });
        }
    });
    
    // Update hero buttons
    const heroBtn = document.querySelector('.hero-btn-primary');
    if (heroBtn) {
        heroBtn.addEventListener('click', () => {
            window.location.href = 'contract-analyzer.html';
        });
    }
});
