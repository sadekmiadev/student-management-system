'use strict';

/**
 * LOGIN PAGE CONTROLLER
 * Handles user authentication with clean UI
 */

(function() {
    'use strict';

    // ===== DOM REFS =====
    const loginForm = document.getElementById('loginForm');
    const loginIdentifier = document.getElementById('loginIdentifier');
    const loginPassword = document.getElementById('loginPassword');
    const loginStatus = document.getElementById('loginStatus');
    const loginBtn = document.getElementById('loginBtn');

    // ===== REDIRECT IF ALREADY LOGGED IN =====
    if (Auth.isLoggedIn()) {
        window.location.href = '../dashboard/dashboard.html';
        return;
    }

    // ===== STATUS FUNCTIONS =====
    function setStatus(message, type = '') {
        loginStatus.textContent = message;
        loginStatus.className = 'login-status ' + type;
    }

    function setLoading(isLoading) {
        loginBtn.disabled = isLoading;
        loginBtn.textContent = isLoading ? 'Logging in...' : 'Login';
    }

    // ===== FORM SUBMISSION =====
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        setStatus('', '');
        setLoading(true);

        const identifier = loginIdentifier.value.trim();
        const password = loginPassword.value.trim();

        // Validate
        if (!identifier || !password) {
            setStatus('Please fill in all fields.', 'error');
            setLoading(false);
            if (!identifier) loginIdentifier.focus();
            else loginPassword.focus();
            return;
        }

        try {
            const data = await apiRequest(CONFIG.LOGIN_ENDPOINT, { 
                identifier, 
                password 
            });

            Auth.saveSession({ 
                token: data.token, 
                user: data.user 
            });

            setStatus('Login successful! Redirecting...', 'success');

            setTimeout(() => {
                window.location.href = '../dashboard/dashboard.html';
            }, 600);

        } catch (err) {
            setStatus(err.message || 'Invalid credentials. Please try again.', 'error');
            setLoading(false);
            loginPassword.value = '';
            loginPassword.focus();
        }
    });

})();