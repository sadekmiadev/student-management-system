'use strict';

/**
 * REGISTER PAGE CONTROLLER
 * Handles user registration with validation
 */

(function() {
    'use strict';

    // ============================================================
    // CONFIGURATION
    // ============================================================

    // All 64 districts of Bangladesh
    const districts = [
        // Dhaka Division
        "Dhaka", "Faridpur", "Gazipur", "Gopalganj", "Jamalpur",
        "Kishoreganj", "Madaripur", "Manikganj", "Munshiganj",
        "Mymensingh", "Narayanganj", "Narsingdi", "Netrokona",
        "Rajbari", "Shariatpur", "Sherpur", "Tangail",
        // Rajshahi Division
        "Bogra", "Joypurhat", "Naogaon", "Natore", "Nawabganj",
        "Pabna", "Rajshahi", "Sirajganj",
        // Rangpur Division
        "Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat",
        "Nilphamari", "Panchagarh", "Rangpur", "Thakurgaon",
        // Barishal Division
        "Barguna", "Barishal", "Bhola", "Jhalokathi",
        "Patuakhali", "Pirojpur",
        // Chattogram Division
        "Bandarban", "Brahmanbaria", "Chandpur", "Chattogram",
        "Cumilla", "Cox's Bazar", "Feni", "Khagrachari",
        "Lakshmipur", "Noakhali", "Rangamati",
        // Sylhet Division
        "Habiganj", "Moulvibazar", "Sunamganj", "Sylhet",
        // Khulna Division
        "Bagerhat", "Chuadanga", "Jashore", "Jhenaidah",
        "Khulna", "Kushtia", "Magura", "Meherpur",
        "Narail", "Satkhira"
    ];

    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const MIN_PASSWORD_LENGTH = 8;
    const EARLIEST_YEAR = 1950;

    // ============================================================
    // DOM REFERENCES
    // ============================================================

    const form = document.getElementById('registerForm');
    const submitBtn = document.getElementById('registerBtn');

    const fields = {
        username: document.getElementById('username'),
        firstName: document.getElementById('firstName'),
        lastName: document.getElementById('lastName'),
        email: document.getElementById('email'),
        phoneNumber: document.getElementById('phoneNumber'),
        password: document.getElementById('password'),
        retypePassword: document.getElementById('retypePassword'),
        district: document.getElementById('district'),
        termsCheck: document.getElementById('termsCheck'),
        dobDay: document.getElementById('dobDay'),
        dobMonth: document.getElementById('dobMonth'),
        dobYear: document.getElementById('dobYear')
    };

    const popupOverlay = document.getElementById('successOverlay');
    const goToLoginBtn = document.getElementById('goToLogin');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const toggleRetypeBtn = document.getElementById('toggleRetypePassword');
    const passwordStrengthEl = document.getElementById('passwordStrength');
    const termsOverlay = document.getElementById('termsOverlay');
    const acceptTermsBtn = document.getElementById('acceptTerms');
    const cancelTermsBtn = document.getElementById('cancelTerms');
    const termsLink = document.getElementById('termsLink');

    let phoneInput = null;

    // ============================================================
    // POPULATE DROPDOWNS
    // ============================================================

    /**
     * Populate district dropdown with Bangladesh districts
     */
    function populateDistricts() {
        const select = fields.district;
        if (!select) return;
        
        select.innerHTML = '<option value="">Select your district</option>';
        
        // Sort alphabetically for better UX
        const sorted = [...districts].sort();
        
        sorted.forEach(district => {
            const option = document.createElement('option');
            option.value = district;
            option.textContent = district;
            select.appendChild(option);
        });
    }

    /**
     * Populate month dropdown
     */
    function populateMonths() {
        if (!fields.dobMonth) return;
        fields.dobMonth.innerHTML = '<option value="">Month</option>';
        MONTH_NAMES.forEach((name, i) => {
            const option = document.createElement('option');
            option.value = i + 1;
            option.textContent = name;
            fields.dobMonth.appendChild(option);
        });
    }

    /**
     * Populate year dropdown (1950 to current year)
     */
    function populateYears() {
        if (!fields.dobYear) return;
        const currentYear = new Date().getFullYear();
        fields.dobYear.innerHTML = '<option value="">Year</option>';
        for (let y = currentYear; y >= EARLIEST_YEAR; y--) {
            const option = document.createElement('option');
            option.value = y;
            option.textContent = y;
            fields.dobYear.appendChild(option);
        }
    }

    /**
     * Update days based on selected month and year
     * Handles leap year correctly
     */
    function updateDays() {
        if (!fields.dobDay || !fields.dobMonth || !fields.dobYear) return;
        
        const month = parseInt(fields.dobMonth.value, 10);
        const year = parseInt(fields.dobYear.value, 10);
        const prevDay = fields.dobDay.value;
        let maxDays = 31;
        
        // February - check for leap year
        if (month === 2) {
            const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
            maxDays = isLeapYear ? 29 : 28;
        } else if ([4, 6, 9, 11].includes(month)) {
            maxDays = 30;
        }
        
        fields.dobDay.innerHTML = '<option value="">Day</option>';
        for (let d = 1; d <= maxDays; d++) {
            const option = document.createElement('option');
            option.value = d;
            option.textContent = d;
            fields.dobDay.appendChild(option);
        }
        
        if (prevDay && Number(prevDay) <= maxDays) {
            fields.dobDay.value = prevDay;
        }
    }

    // ============================================================
    // PHONE INPUT (intl-tel-input)
    // ============================================================

    function setupPhoneInput() {
        if (!fields.phoneNumber || typeof intlTelInput === 'undefined') return;
        
        phoneInput = intlTelInput(fields.phoneNumber, {
            initialCountry: "bd",
            preferredCountries: ["bd", "in", "pk", "np", "us", "uk"],
            separateDialCode: true,
            utilsScript: 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.21/js/utils.js'
        });
    }

    // ============================================================
    // VALIDATION FUNCTIONS
    // ============================================================

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function validateUsername(username) {
        return /^[a-zA-Z0-9_]{3,30}$/.test(username);
    }

    function getPasswordStrength(password) {
        if (!password) return { score: 0, label: '' };
        let score = 0;
        if (password.length >= MIN_PASSWORD_LENGTH) score++;
        if (password.length >= 12) score++;
        if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        const labels = ['', 'Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        return { score, label: labels[score] };
    }

    function showFieldError(input, errorId, message) {
        const errorEl = document.getElementById(errorId);
        if (errorEl) errorEl.textContent = message;
        if (input) {
            input.classList.toggle('input-error', Boolean(message));
        }
    }

    function clearErrors() {
        document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
        document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    }

    /**
     * Validate all form fields
     * @returns {boolean} - True if valid
     */
    function validateForm() {
        let isValid = true;

        // ---- Username ----
        const username = fields.username.value.trim();
        if (!username || !validateUsername(username)) {
            showFieldError(fields.username, 'usernameError', 'Username must be 3-30 characters (letters, numbers, underscore)');
            isValid = false;
        } else {
            showFieldError(fields.username, 'usernameError', '');
        }

        // ---- First Name ----
        if (!fields.firstName.value.trim()) {
            showFieldError(fields.firstName, 'firstNameError', 'First name is required');
            isValid = false;
        } else {
            showFieldError(fields.firstName, 'firstNameError', '');
        }

        // ---- Last Name ----
        if (!fields.lastName.value.trim()) {
            showFieldError(fields.lastName, 'lastNameError', 'Last name is required');
            isValid = false;
        } else {
            showFieldError(fields.lastName, 'lastNameError', '');
        }

        // ---- Email ----
        if (!fields.email.value.trim() || !validateEmail(fields.email.value.trim())) {
            showFieldError(fields.email, 'emailError', 'Valid email address is required');
            isValid = false;
        } else {
            showFieldError(fields.email, 'emailError', '');
        }

        // ---- Phone Number (with max 11 digits check) ----
        const phoneRaw = fields.phoneNumber.value.replace(/\D/g, ''); // Remove non-digits
        
        // Check length (max 11 digits)
        if (phoneRaw.length > 11) {
            showFieldError(fields.phoneNumber, 'phoneError', 'Phone number cannot exceed 11 digits');
            isValid = false;
        } else if (phoneRaw.length < 6) {
            showFieldError(fields.phoneNumber, 'phoneError', 'Phone number must be at least 6 digits');
            isValid = false;
        } else {
            // Check with intl-tel-input if available
            let phoneValid = false;
            if (phoneInput) {
                try {
                    phoneValid = phoneInput.isValidNumber();
                } catch {
                    phoneValid = false;
                }
            } else {
                phoneValid = /^[0-9]+$/.test(phoneRaw);
            }
            
            if (!phoneValid) {
                showFieldError(fields.phoneNumber, 'phoneError', 'Valid phone number is required');
                isValid = false;
            } else {
                showFieldError(fields.phoneNumber, 'phoneError', '');
            }
        }

        // ---- Date of Birth ----
        if (!fields.dobDay.value || !fields.dobMonth.value || !fields.dobYear.value) {
            showFieldError(null, 'dobError', 'Full date of birth is required');
            isValid = false;
        } else {
            showFieldError(null, 'dobError', '');
        }

        // ---- Gender ----
        if (!document.querySelector('input[name="gender"]:checked')) {
            showFieldError(null, 'genderError', 'Please select your gender');
            isValid = false;
        } else {
            showFieldError(null, 'genderError', '');
        }

        // ---- District ----
        if (!fields.district.value) {
            showFieldError(fields.district, 'districtError', 'Please select your district');
            isValid = false;
        } else {
            showFieldError(fields.district, 'districtError', '');
        }

        // ---- Password ----
        if (fields.password.value.length < MIN_PASSWORD_LENGTH) {
            showFieldError(fields.password, 'passwordError', `Minimum ${MIN_PASSWORD_LENGTH} characters required`);
            isValid = false;
        } else {
            showFieldError(fields.password, 'passwordError', '');
        }

        // ---- Confirm Password ----
        if (fields.retypePassword.value !== fields.password.value) {
            showFieldError(fields.retypePassword, 'retypeError', 'Passwords do not match');
            isValid = false;
        } else {
            showFieldError(fields.retypePassword, 'retypeError', '');
        }

        // ---- Terms ----
        if (!fields.termsCheck.checked) {
            showFieldError(fields.termsCheck, 'termsError', 'You must agree to the Terms & Conditions');
            isValid = false;
        } else {
            showFieldError(fields.termsCheck, 'termsError', '');
        }

        return isValid;
    }

    // ============================================================
    // BUILD PAYLOAD
    // ============================================================

    function buildPayload() {
        const phoneNumber = phoneInput ? phoneInput.getNumber() : fields.phoneNumber.value.trim();
        
        return {
            username: fields.username.value.trim(),
            first_name: fields.firstName.value.trim(),
            last_name: fields.lastName.value.trim(),
            email: fields.email.value.trim(),
            phone_number: phoneNumber,
            dob: `${fields.dobYear.value}-${String(fields.dobMonth.value).padStart(2, '0')}-${String(fields.dobDay.value).padStart(2, '0')}`,
            gender: document.querySelector('input[name="gender"]:checked')?.value,
            district: fields.district.value,
            password: fields.password.value
        };
    }

    // ============================================================
    // UI HELPERS
    // ============================================================

    function setLoading(isLoading) {
        submitBtn.disabled = isLoading;
        submitBtn.textContent = isLoading ? 'Registering...' : 'Register';
    }

    function showSuccessPopup() {
        popupOverlay.removeAttribute('hidden');
        popupOverlay.classList.add('active');
    }

    function hideSuccessPopup() {
        popupOverlay.setAttribute('hidden', '');
        popupOverlay.classList.remove('active');
    }

    function showTermsModal() {
        termsOverlay.removeAttribute('hidden');
        termsOverlay.classList.add('active');
    }

    function hideTermsModal() {
        termsOverlay.setAttribute('hidden', '');
        termsOverlay.classList.remove('active');
    }

    function resetForm() {
        form.reset();
        clearErrors();
        if (passwordStrengthEl) {
            passwordStrengthEl.textContent = '';
            passwordStrengthEl.dataset.strength = 0;
        }
        updateDays();
    }

    // ============================================================
    // EVENT LISTENERS
    // ============================================================

    // ---- Password Toggle ----
    togglePasswordBtn.addEventListener('click', () => {
        const isHidden = fields.password.type === 'password';
        fields.password.type = isHidden ? 'text' : 'password';
        togglePasswordBtn.textContent = isHidden ? '🙈' : '👁';
    });

    toggleRetypeBtn.addEventListener('click', () => {
        const isHidden = fields.retypePassword.type === 'password';
        fields.retypePassword.type = isHidden ? 'text' : 'password';
        toggleRetypeBtn.textContent = isHidden ? '🙈' : '👁';
    });

    // ---- Password Strength ----
    fields.password.addEventListener('input', () => {
        const { score, label } = getPasswordStrength(fields.password.value);
        passwordStrengthEl.textContent = label;
        passwordStrengthEl.dataset.strength = score;
    });

    // ---- DOB Updates ----
    fields.dobMonth.addEventListener('change', updateDays);
    fields.dobYear.addEventListener('change', updateDays);

    // ---- Terms Modal ----
    termsLink.addEventListener('click', (e) => {
        e.preventDefault();
        showTermsModal();
    });

    acceptTermsBtn.addEventListener('click', () => {
        fields.termsCheck.checked = true;
        hideTermsModal();
        showFieldError(fields.termsCheck, 'termsError', '');
    });

    cancelTermsBtn.addEventListener('click', () => {
        fields.termsCheck.checked = false;
        hideTermsModal();
    });

    // ---- Success Popup ----
    goToLoginBtn.addEventListener('click', () => {
        window.location.href = '../login/login.html';
    });

    // ---- Close Modals on Outside Click ----
    termsOverlay.addEventListener('click', (e) => {
        if (e.target === termsOverlay) hideTermsModal();
    });

    popupOverlay.addEventListener('click', (e) => {
        if (e.target === popupOverlay) hideSuccessPopup();
    });

    // ============================================================
    // FORM SUBMISSION
    // ============================================================

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        clearErrors();
        
        if (!validateForm()) {
            // Focus first invalid field
            const firstError = document.querySelector('.input-error');
            if (firstError) firstError.focus();
            return;
        }

        setLoading(true);

        try {
            const payload = buildPayload();
            const response = await apiRequest(CONFIG.REGISTER_ENDPOINT, payload);
            
            resetForm();
            showSuccessPopup();
            
        } catch (error) {
            let statusEl = document.getElementById('formStatus');
            if (!statusEl) {
                statusEl = document.createElement('div');
                statusEl.id = 'formStatus';
                statusEl.className = 'error-msg full-width';
                statusEl.style.textAlign = 'center';
                statusEl.style.marginBottom = '12px';
                statusEl.style.padding = '10px';
                statusEl.style.background = '#fdf2f2';
                statusEl.style.borderRadius = '6px';
                statusEl.style.border = '1px solid #f8d7da';
                form.insertBefore(statusEl, form.firstChild);
            }
            statusEl.textContent = '❌ ' + (error.message || 'Registration failed. Please try again.');
            statusEl.style.color = 'var(--color-error)';
            
        } finally {
            setLoading(false);
        }
    });

    // ============================================================
    // INITIALIZE
    // ============================================================

    populateDistricts();
    populateMonths();
    populateYears();
    updateDays();
    setupPhoneInput();

})();