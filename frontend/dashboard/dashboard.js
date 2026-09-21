'use strict';

/**
 * DASHBOARD PAGE CONTROLLER
 * Handles user display, statistics loading, modals, profile update, and export
 */

(function() {
    'use strict';

    // ============================================================
    // DOM REFERENCES
    // ============================================================
    
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutBtn2 = document.getElementById('logoutBtn2');
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const userDistrict = document.getElementById('userDistrict');
    const userJoined = document.getElementById('userJoined');
    const totalStudents = document.getElementById('totalStudents');
    const activeStudents = document.getElementById('activeStudents');
    const inactiveStudents = document.getElementById('inactiveStudents');
    const avgGPA = document.getElementById('avgGPA');

    // ============================================================
    // ROUTE PROTECTION
    // ============================================================
    
    Auth.protectRoute();

    // ============================================================
    // DISPLAY USER INFORMATION
    // ============================================================
    
    const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');

    userName.textContent = userData.first_name 
        ? `${userData.first_name} ${userData.last_name || ''}` 
        : 'User';
    userEmail.textContent = userData.email || 'N/A';
    userDistrict.textContent = userData.district || 'N/A';
    userJoined.textContent = userData.created_at 
        ? new Date(userData.created_at).toLocaleDateString() 
        : 'Just now';

    if (!userData.email) {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = '../login/login.html';
        } else {
            const userInfo = document.getElementById('userInfo');
            if (userInfo) {
                userInfo.innerHTML = `
                    <p style="color:var(--color-text-muted);">
                        User data not found. Please log in again.
                    </p>
                `;
            }
        }
    }

    // ============================================================
    // LOAD STATISTICS
    // ============================================================
    
    async function loadStatistics() {
        try {
            const result = await StudentAPI.getAll();
            
            if (result.success && result.data) {
                const students = result.data;
                
                totalStudents.textContent = students.length;
                
                const active = students.filter(s => s.status === 'Active').length;
                const inactive = students.filter(s => s.status === 'Inactive').length;
                activeStudents.textContent = active;
                inactiveStudents.textContent = inactive;
                
                const studentsWithGPA = students.filter(s => s.gpa !== undefined && s.gpa !== null);
                if (studentsWithGPA.length > 0) {
                    const sum = studentsWithGPA.reduce((acc, s) => acc + s.gpa, 0);
                    const avg = (sum / studentsWithGPA.length).toFixed(2);
                    avgGPA.textContent = avg;
                } else {
                    avgGPA.textContent = 'N/A';
                }
            } else {
                setDefaultStats();
            }
        } catch (error) {
            console.error('Error loading statistics:', error);
            setDefaultStats();
        }
    }

    function setDefaultStats() {
        totalStudents.textContent = '0';
        activeStudents.textContent = '0';
        inactiveStudents.textContent = '0';
        avgGPA.textContent = '0.00';
    }

    // ============================================================
    // LOGOUT
    // ============================================================
    
    function handleLogout() {
        Auth.logout();
    }

    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (logoutBtn2) logoutBtn2.addEventListener('click', handleLogout);

    // ============================================================
    // STATISTICS MODAL (Chart)
    // ============================================================

    let chartInstance = null;

    window.openStatsModal = function() {
        const modal = document.getElementById('statsModal');
        modal.removeAttribute('hidden');
        modal.classList.add('active');
        loadChart();
    };

    window.closeStatsModal = function() {
        const modal = document.getElementById('statsModal');
        modal.setAttribute('hidden', '');
        modal.classList.remove('active');
    };

    async function loadChart() {
        try {
            const result = await StudentAPI.getAll();
            if (!result.success) return;

            const students = result.data || [];
            const active = students.filter(s => s.status === 'Active').length;
            const inactive = students.filter(s => s.status === 'Inactive').length;

            const ctx = document.getElementById('statsChart').getContext('2d');

            if (chartInstance) chartInstance.destroy();

            chartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Active', 'Inactive'],
                    datasets: [{
                        data: [active, inactive],
                        backgroundColor: ['#0e9f4f', '#e74c3c'],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });
        } catch (error) {
            console.error('Chart load error:', error);
        }
    }

    // ============================================================
    // SETTINGS MODAL (Profile Update)
    // ============================================================

    window.openSettingsModal = function() {
        const userData = Auth.getUser();
        document.getElementById('profileFirstName').value = userData.first_name || '';
        document.getElementById('profileLastName').value = userData.last_name || '';
        document.getElementById('profileEmail').value = userData.email || '';
        document.getElementById('profilePassword').value = '';

        const modal = document.getElementById('settingsModal');
        modal.removeAttribute('hidden');
        modal.classList.add('active');
    };

    window.closeSettingsModal = function() {
        const modal = document.getElementById('settingsModal');
        modal.setAttribute('hidden', '');
        modal.classList.remove('active');
    };

    /**
     * Handle profile update form submission
     */
    document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const statusEl = document.getElementById('profileStatus');
        statusEl.textContent = '';
        statusEl.style.color = '';

        const payload = {
            first_name: document.getElementById('profileFirstName').value.trim(),
            last_name: document.getElementById('profileLastName').value.trim(),
            email: document.getElementById('profileEmail').value.trim(),
            password: document.getElementById('profilePassword').value || undefined
        };

        try {
            const response = await fetch(`${CONFIG.API_BASE}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.message);

            // Update session storage
            const userData = Auth.getUser();
            const updatedUser = { ...userData, ...payload };
            sessionStorage.setItem('userData', JSON.stringify(updatedUser));

            statusEl.textContent = '✅ Profile updated successfully!';
            statusEl.style.color = 'var(--color-success)';
            setTimeout(() => closeSettingsModal(), 1200);
        } catch (error) {
            statusEl.textContent = '❌ ' + error.message;
            statusEl.style.color = 'var(--color-error)';
        }
    });

    // ============================================================
    // EXPORT CSV (Reports)
    // ============================================================

    window.exportCSV = async function() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert('Please login first.');
            return;
        }

        try {
            const response = await fetch(`${CONFIG.API_BASE}/students/export`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Download failed');
            }

            // Create a blob and download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'students.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            alert('Error exporting: ' + error.message);
        }
    };

    // ============================================================
    // INITIALIZE
    // ============================================================
    
    loadStatistics();
    setInterval(loadStatistics, 30000);

})();