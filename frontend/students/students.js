'use strict';

/**
 * STUDENTS PAGE CONTROLLER
 * Handles CRUD operations for students:
 * - Display list of students
 * - Add new student
 * - Edit existing student
 * - Delete student
 */

(function() {
    'use strict';

    // ============================================================
    // DOM REFERENCES
    // ============================================================
    
    const studentsList = document.getElementById('studentsList');
    const addBtn = document.getElementById('addStudentBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const modal = document.getElementById('studentModal');
    const modalTitle = document.getElementById('modalTitle');
    const studentForm = document.getElementById('studentForm');
    const submitBtn = document.getElementById('submitStudentBtn');
    const cancelBtn = document.getElementById('cancelModalBtn');
    const modalError = document.getElementById('modalError');

    // Form input fields
    const nameInput = document.getElementById('studentName');
    const emailInput = document.getElementById('studentEmail');
    const phoneInput = document.getElementById('studentPhone');
    const courseInput = document.getElementById('studentCourse');
    const semesterInput = document.getElementById('studentSemester');
    const gpaInput = document.getElementById('studentGPA');
    const statusSelect = document.getElementById('studentStatus');

    // Track which student is being edited (null = add mode)
    let editingId = null;

    // ============================================================
    // ROUTE PROTECTION
    // ============================================================
    
    Auth.protectRoute();

    // ============================================================
    // LOGOUT
    // ============================================================
    
    logoutBtn.addEventListener('click', () => {
        Auth.logout();
    });

    // ============================================================
    // LOAD STUDENTS
    // ============================================================
    
    /**
     * Fetch all students from the API and render them
     */
    async function loadStudents() {
        try {
            const result = await StudentAPI.getAll();
            if (result.success) {
                displayStudents(result.data);
            } else {
                showError('Failed to load students: ' + result.message);
            }
        } catch (error) {
            showError('Error loading students: ' + error.message);
        }
    }

    // ============================================================
    // DISPLAY STUDENTS
    // ============================================================
    
    /**
     * Render students list in the DOM
     * @param {Array} students - Array of student objects
     */
    function displayStudents(students) {
        // If no students, show empty state
        if (!students || students.length === 0) {
            studentsList.innerHTML = `
                <div class="empty-state">
                    <div class="icon">📋</div>
                    <p>No students found. Click "Add New Student" to get started!</p>
                </div>
            `;
            return;
        }

        // Build HTML table with student data
        let html = `
            <table class="student-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Course</th>
                        <th>Semester</th>
                        <th>GPA</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        students.forEach(student => {
            // Safely format GPA: convert to number, then toFixed(2) if valid
            let gpaDisplay = 'N/A';
            const gpaValue = student.gpa;
            if (gpaValue !== null && gpaValue !== undefined && !isNaN(parseFloat(gpaValue))) {
                gpaDisplay = parseFloat(gpaValue).toFixed(2);
            }

            html += `
                <tr>
                    <td><strong>${escapeHtml(student.name)}</strong></td>
                    <td>${escapeHtml(student.email)}</td>
                    <td>${escapeHtml(student.phone)}</td>
                    <td>${escapeHtml(student.course)}</td>
                    <td>${escapeHtml(student.semester)}</td>
                    <td>${gpaDisplay}</td>
                    <td><span class="status-${student.status.toLowerCase()}">${student.status}</span></td>
                    <td>
                        <button class="btn-edit" onclick="window.editStudent('${student.id}')">✏️ Edit</button>
                        <button class="btn-delete" onclick="window.deleteStudent('${student.id}')">🗑️ Delete</button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        studentsList.innerHTML = html;
    }

    // ============================================================
    // UTILITY FUNCTIONS
    // ============================================================
    
    /**
     * Escape HTML to prevent XSS attacks
     */
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Show error message with retry button
     */
    function showError(message) {
        studentsList.innerHTML = `
            <div class="empty-state">
                <div class="icon">❌</div>
                <p style="color: var(--color-error);">${escapeHtml(message)}</p>
                <button onclick="loadStudents()" style="margin-top: var(--space-md); padding: 8px 16px; border: 1px solid var(--color-primary); border-radius: var(--radius-sm); background: none; color: var(--color-primary); cursor: pointer; font-weight: 600;">Retry</button>
            </div>
        `;
    }

    // ============================================================
    // MODAL FUNCTIONS
    // ============================================================
    
    /**
     * Open modal for adding or editing a student
     * @param {string} title - Modal title
     * @param {Object} studentData - Student data (null for add mode)
     */
    function openModal(title, studentData = null) {
        modalTitle.textContent = title;
        editingId = studentData?.id || null;

        if (studentData) {
            // Edit mode - populate form with existing data
            nameInput.value = studentData.name || '';
            emailInput.value = studentData.email || '';
            phoneInput.value = studentData.phone || '';
            courseInput.value = studentData.course || '';
            semesterInput.value = studentData.semester || '';
            gpaInput.value = studentData.gpa || '';
            statusSelect.value = studentData.status || 'Active';
            submitBtn.textContent = 'Update Student';
        } else {
            // Add mode - reset form
            studentForm.reset();
            gpaInput.value = '';
            statusSelect.value = 'Active';
            submitBtn.textContent = 'Save Student';
        }

        modalError.classList.remove('show');
        modal.classList.add('active');
    }

    /**
     * Close the modal and reset state
     */
    function closeModal() {
        modal.classList.remove('active');
        editingId = null;
        studentForm.reset();
        modalError.classList.remove('show');
    }

    // ============================================================
    // CRUD OPERATIONS
    // ============================================================
    
    /**
     * Add a new student
     * @param {Object} studentData - Student data to create
     * @returns {boolean} - Success status
     */
    window.addStudent = async function(studentData) {
        try {
            const result = await StudentAPI.create(studentData);
            if (result.success) {
                loadStudents();
                return true;
            } else {
                alert('Error: ' + result.message);
                return false;
            }
        } catch (error) {
            alert('Error: ' + error.message);
            return false;
        }
    };

    /**
     * Edit a student - fetches data and opens modal
     * @param {string} id - Student ID
     */
    window.editStudent = async function(id) {
        try {
            const result = await StudentAPI.getById(id);
            if (result.success) {
                openModal('Edit Student', result.data);
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    /**
     * Update an existing student
     * @param {string} id - Student ID
     * @param {Object} studentData - Updated student data
     * @returns {boolean} - Success status
     */
    window.updateStudent = async function(id, studentData) {
        try {
            const result = await StudentAPI.update(id, studentData);
            if (result.success) {
                loadStudents();
                return true;
            } else {
                alert('Error: ' + result.message);
                return false;
            }
        } catch (error) {
            alert('Error: ' + error.message);
            return false;
        }
    };

    /**
     * Delete a student with confirmation
     * @param {string} id - Student ID
     */
    window.deleteStudent = async function(id) {
        if (!confirm('Are you sure you want to delete this student?')) return;

        try {
            const result = await StudentAPI.delete(id);
            if (result.success) {
                loadStudents();
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    // ============================================================
    // FORM SUBMISSION
    // ============================================================
    
    /**
     * Handle form submission for add/edit student
     */
    studentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        modalError.classList.remove('show');

        // Validate required fields
        if (!nameInput.value.trim() || !emailInput.value.trim() || 
            !phoneInput.value.trim() || !courseInput.value.trim() || 
            !semesterInput.value.trim()) {
            modalError.textContent = 'Please fill in all required fields';
            modalError.classList.add('show');
            return;
        }

        // Build student data object
        const studentData = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim(),
            course: courseInput.value.trim(),
            semester: semesterInput.value.trim(),
            gpa: gpaInput.value ? parseFloat(gpaInput.value) : undefined,
            status: statusSelect.value
        };

        let success = false;

        if (editingId) {
            // Update existing student
            success = await window.updateStudent(editingId, studentData);
        } else {
            // Add new student
            success = await window.addStudent(studentData);
        }

        if (success) {
            closeModal();
        }
    });

    // ============================================================
    // MODAL EVENT LISTENERS
    // ============================================================
    
    addBtn.addEventListener('click', () => openModal('Add New Student'));
    cancelBtn.addEventListener('click', closeModal);

    // Close modal on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });

    // ============================================================
    // INITIALIZE
    // ============================================================
    
    loadStudents();
    window.loadStudents = loadStudents;

})();