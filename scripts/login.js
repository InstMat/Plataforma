// Optimized login system with DOM caching and enhanced UX
(() => {
    'use strict';
    
    // Configuration
    const CONFIG = {
        clave: "instmat2025", // Change to desired password
        sessionKey: 'autenticado',
        sessionValue: '1'
    };
    
    // Cached DOM elements for performance
    let cachedElements = null;
    
    // Initialize DOM element cache
    function initializeCache() {
        if (!cachedElements) {
            cachedElements = {
                modal: document.getElementById('login-modal'),
                passwordInput: document.getElementById('login-password'),
                loginBtn: document.getElementById('login-btn'),
                errorElement: document.getElementById('login-error')
            };
        }
        return cachedElements;
    }
    
    // Enhanced login UI with smooth animations
    function mostrarLogin() {
        const { modal, passwordInput } = initializeCache();
        if (modal) {
            requestAnimationFrame(() => {
                modal.style.display = 'flex';
                // Auto-focus password input for better UX
                setTimeout(() => {
                    if (passwordInput) {
                        passwordInput.focus();
                        passwordInput.select();
                    }
                }, 100);
            });
        }
    }
    
    function ocultarLogin() {
        const { modal } = initializeCache();
        if (modal) {
            requestAnimationFrame(() => {
                modal.style.display = 'none';
            });
        }
    }
    
    // Show error with enhanced UX
    function mostrarError() {
        const { errorElement, passwordInput } = initializeCache();
        if (errorElement) {
            requestAnimationFrame(() => {
                errorElement.style.display = 'block';
                // Auto-select password for retry
                if (passwordInput) {
                    passwordInput.select();
                    // Add visual feedback (subtle shake animation could be added via CSS)
                    passwordInput.classList.add('error');
                    setTimeout(() => passwordInput.classList.remove('error'), 300);
                }
            });
        }
    }
    
    function ocultarError() {
        const { errorElement } = initializeCache();
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }
    
    // Optimized login attempt with better error handling
    function intentarLogin() {
        const { passwordInput } = initializeCache();
        if (!passwordInput) return;
        
        const password = passwordInput.value.trim();
        
        // Hide previous errors
        ocultarError();
        
        if (password === CONFIG.clave) {
            // Successful login
            try {
                sessionStorage.setItem(CONFIG.sessionKey, CONFIG.sessionValue);
                ocultarLogin();
                // Clear password for security
                passwordInput.value = '';
            } catch (e) {
                console.error('Error saving session:', e);
                mostrarError();
            }
        } else {
            // Failed login
            mostrarError();
        }
    }
    
    // Enhanced event handlers with better performance
    function initializeEventListeners() {
        const { loginBtn, passwordInput } = initializeCache();
        
        // Login button click handler
        if (loginBtn) {
            loginBtn.addEventListener('click', intentarLogin, { passive: true });
        }
        
        // Enhanced keyboard handling
        if (passwordInput) {
            passwordInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    intentarLogin();
                }
                // Hide error on typing
                if (e.key.length === 1) {
                    ocultarError();
                }
            }, { passive: false });
            
            // Clear error on input focus
            passwordInput.addEventListener('focus', ocultarError, { passive: true });
        }
    }
    
    // Check authentication status with enhanced session handling
    function verificarAutenticacion() {
        try {
            const authStatus = sessionStorage.getItem(CONFIG.sessionKey);
            if (authStatus !== CONFIG.sessionValue) {
                mostrarLogin();
            }
        } catch (e) {
            // If sessionStorage fails, show login as fallback
            console.warn('SessionStorage access failed, showing login:', e);
            mostrarLogin();
        }
    }
    
    // Initialize login system
    function initializeLogin() {
        // Initialize DOM cache and event listeners
        initializeCache();
        initializeEventListeners();
        
        // Check authentication status
        verificarAutenticacion();
    }
    
    // Enhanced page load handling
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeLogin);
    } else {
        initializeLogin();
    }
})();