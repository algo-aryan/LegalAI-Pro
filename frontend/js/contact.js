// Contact Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 8px;"></i>Sending...';
            submitBtn.disabled = true;
            
            // Simulate form submission (replace with actual API call)
            setTimeout(() => {
                // Show success message
                if (window.uiUtils) {
                    window.uiUtils.showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
                } else {
                    alert('Message sent successfully!');
                }
                
                // Reset form
                this.reset();
                
                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 2000);
        });
    }
});

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
