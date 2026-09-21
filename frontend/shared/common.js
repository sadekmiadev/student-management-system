'use strict';

/**
 * SHARED UTILITIES - COMMON.JS
 * 
 * This file contains shared functionality used across all pages:
 * - Configuration (API endpoints)
 * - Authentication (Auth object)
 * - API request handler
 * - Student CRUD operations (StudentAPI)
 * - Utility functions
 */

// ============================================================
// CONFIGURATION
// ============================================================

/**
 * Application configuration object
 * Contains all API endpoints and other constants
 */
const CONFIG = {
    API_BASE: 'http://localhost:3000/api',
    LOGIN_ENDPOINT: 'http://localhost:3000/api/auth/login',
    REGISTER_ENDPOINT: 'http://localhost:3000/api/auth/register',
    STUDENTS_ENDPOINT: 'http://localhost:3000/api/students',
};

// ============================================================
// AUTH HELPER
// ============================================================

/**
 * Authentication helper object
 * Handles session management, token storage, and route protection
 */
const Auth = {
    /**
     * Save authentication data to storage
     * @param {Object} data - Contains token and user data
     */
    saveSession: (data) => {
        if (data?.token) {
            localStorage.setItem('authToken', data.token);
        }
        if (data?.user) {
            sessionStorage.setItem('userData', JSON.stringify(data.user));
        }
    },
    
    /**
     * Clear all session data (logout)
     */
    clearSession: () => {
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('userData');
    },
    
    /**
     * Check if user is currently logged in
     * @returns {boolean} - True if token exists
     */
    isLoggedIn: () => {
        return !!localStorage.getItem('authToken');
    },
    
    /**
     * Get the current authentication token
     * @returns {string|null} - JWT token or null
     */
    getToken: () => {
        return localStorage.getItem('authToken');
    },
    
    /**
     * Get the current user data from sessionStorage
     * @returns {Object} - User data object
     */
    getUser: () => {
        try {
            return JSON.parse(sessionStorage.getItem('userData') || '{}');
        } catch {
            return {};
        }
    },
    
    /**
     * Logout user - clear session and redirect to login
     */
    logout: () => {
        Auth.clearSession();
        window.location.href = '../login/login.html';
    },
    
    /**
     * Protect a route - redirect to login if not authenticated
     * Used on dashboard, students, and other protected pages
     */
    protectRoute: () => {
        if (!Auth.isLoggedIn()) {
            window.location.href = '../login/login.html';
        }
    },
    
    /**
     * Redirect to dashboard if already logged in
     * Used on login and register pages to prevent access
     */
    redirectIfLoggedIn: () => {
        if (Auth.isLoggedIn()) {
            window.location.href = '../dashboard/dashboard.html';
        }
    }
};

// ============================================================
// API REQUEST HANDLER
// ============================================================

/**
 * Generic API request handler
 * Automatically adds authentication header if token exists
 * Handles JSON parsing and error responses
 * 
 * @param {string} endpoint - API endpoint URL
 * @param {Object} payload - Request body (for POST/PUT)
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @returns {Promise<Object>} - Parsed JSON response
 * @throws {Error} - If request fails or returns error
 */
const apiRequest = async (endpoint, payload, method = 'POST') => {
    try {
        // Build request options
        const options = {
            method: method,
            headers: { 
                'Content-Type': 'application/json' 
            }
        };
        
        // Add authorization token if user is logged in
        const token = Auth.getToken();
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Add body for non-GET requests with payload
        if (method !== 'GET' && payload) {
            options.body = JSON.stringify(payload);
        }
        
        // Make the request
        const response = await fetch(endpoint, options);
        const data = await response.json();
        
        // Check if response indicates failure
        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Request failed');
        }
        
        return data;
        
    } catch (err) {
        // Handle network errors and re-throw with user-friendly message
        throw new Error(err.message || 'Network error occurred');
    }
};

// ============================================================
// STUDENT API (CRUD OPERATIONS)
// ============================================================

/**
 * Student API object
 * Provides CRUD operations for student management
 * All methods return promises that resolve to API responses
 */
const StudentAPI = {
    /**
     * CREATE: Add a new student
     * @param {Object} data - Student data
     * @returns {Promise<Object>} - API response
     */
    create: (data) => apiRequest(CONFIG.STUDENTS_ENDPOINT, data, 'POST'),
    
    /**
     * READ: Get all students for the current user
     * @returns {Promise<Object>} - API response with students array
     */
    getAll: () => apiRequest(CONFIG.STUDENTS_ENDPOINT, null, 'GET'),
    
    /**
     * READ: Get a single student by ID
     * @param {string} id - Student ID
     * @returns {Promise<Object>} - API response with student data
     */
    getById: (id) => apiRequest(`${CONFIG.STUDENTS_ENDPOINT}/${id}`, null, 'GET'),
    
    /**
     * UPDATE: Update an existing student
     * @param {string} id - Student ID
     * @param {Object} data - Updated student data
     * @returns {Promise<Object>} - API response
     */
    update: (id, data) => apiRequest(`${CONFIG.STUDENTS_ENDPOINT}/${id}`, data, 'PUT'),
    
    /**
     * DELETE: Delete a student by ID
     * @param {string} id - Student ID
     * @returns {Promise<Object>} - API response
     */
    delete: (id) => apiRequest(`${CONFIG.STUDENTS_ENDPOINT}/${id}`, null, 'DELETE')
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Escape HTML to prevent XSS attacks
 * Converts special characters to their HTML entities
 * 
 * @param {string} text - Text to escape
 * @returns {string} - Escaped HTML string
 */
const escapeHtml = (text) => {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

/**
 * Format a date string to a readable format
 * @param {string} dateString - Date string
 * @returns {string} - Formatted date (e.g., "Jan 15, 2024")
 */
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return 'N/A';
    }
};

/**
 * Display a toast notification
 * @param {string} message - Message to display
 * @param {string} type - 'success' or 'error'
 */
const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 24px;
        border-radius: 6px;
        background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
        color: white;
        font-weight: 500;
        z-index: 9999;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        max-width: 350px;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

// Add toast animation style if not already present
if (!document.getElementById('toastStyles')) {
    const toastStyles = document.createElement('style');
    toastStyles.id = 'toastStyles';
    toastStyles.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(toastStyles);
}