document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Stop the form from submitting normally

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (validateLogin(email, password)) {
            // Simulate API call / loading state
            const btn = loginForm.querySelector('button');
            const originalText = btn.querySelector('span').innerText;
            
            btn.querySelector('span').innerText = "AUTHENTICATING...";
            btn.style.opacity = "0.8";
            
            setTimeout(() => {
                alert(`Welcome back, ${email}! Redirecting to dashboard...`);
                // Here you would redirect: window.location.href = '/admin/dashboard.html';
                
                // Reset button for demo purposes
                btn.querySelector('span').innerText = originalText;
                btn.style.opacity = "1";
            }, 1500);
        }
    });

    function validateLogin(email, password) {
        if (!email || !password) {
            alert("Please fill in all fields.");
            return false;
        }
        // Simple email regex for basic client-side validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("Please enter a valid email address.");
            return false;
        }
        return true;
    }
    
    // Optional: Add a subtle focus effect to parent group if needed
    [emailInput, passwordInput].forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('focused');
        });
    });
});