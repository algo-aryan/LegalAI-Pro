// Initialize theme
const currentTheme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-color-scheme", currentTheme);

document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
        const icon = themeToggle.querySelector("i");
        if (icon) {
            icon.className = currentTheme === "light" ? "fas fa-moon" : "fas fa-sun";
        }
        
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
});
