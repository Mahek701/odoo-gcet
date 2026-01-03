/**
 * Employee Management System - Shared Application Logic
 * =====================================================
 * 
 * This file contains all shared functionality including:
 * - Authentication system
 * - Login ID auto-generation logic
 * - Employee data management
 * - Role-based rendering
 * - Attendance system
 * - Profile management
 */

// ============================================
// STORAGE KEYS
// ============================================

const STORAGE_KEYS = {
    USERS: 'ems_users',
    CURRENT_USER: 'ems_current_user',
    EMPLOYEES: 'ems_employees',
    ATTENDANCE: 'ems_attendance'
};

// ============================================
// LOGIN ID AUTO-GENERATION LOGIC
// ============================================

/**
 * Generates a Login ID for a new employee
 * Format: [CompanyCode][First2LettersOfFirstName][First2LettersOfLastName][YearOfJoining][4-digit serial]
 * 
 * Example: OIODO20220001
 * - OIODO: Company code (first 5 letters of company name, uppercase)
 * - 20: First 2 letters of first name
 * - 22: First 2 letters of last name
 * - 2022: Year of joining
 * - 0001: 4-digit serial number
 * 
 * @param {Object} employeeData - Employee data object
 * @returns {string} Generated Login ID
 */
function generateLoginID(employeeData) {
    const { firstName, lastName, companyName, yearOfJoining } = employeeData;
    
    // Get company code (first 5 letters, uppercase, pad if needed)
    let companyCode = (companyName || 'COMP').substring(0, 5).toUpperCase().padEnd(5, 'X');
    
    // Get first 2 letters of first name (uppercase, pad if needed)
    let firstNameCode = (firstName || 'XX').substring(0, 2).toUpperCase().padEnd(2, 'X');
    
    // Get first 2 letters of last name (uppercase, pad if needed)
    let lastNameCode = (lastName || 'XX').substring(0, 2).toUpperCase().padEnd(2, 'X');
    
    // Get year of joining (default to current year)
    const year = yearOfJoining || new Date().getFullYear();
    
    // Get existing employees to determine serial number
    const employees = getEmployees();
    const yearEmployees = employees.filter(emp => {
        const empYear = emp.loginId ? emp.loginId.substring(9, 13) : null;
        return empYear === year.toString();
    });
    
    // Generate 4-digit serial number
    const serial = String(yearEmployees.length + 1).padStart(4, '0');
    
    // Combine: CompanyCode + FirstNameCode + LastNameCode + Year + Serial
    const loginId = `${companyCode}${firstNameCode}${lastNameCode}${year}${serial}`;
    
    return loginId;
}

// ============================================
// STORAGE UTILITIES
// ============================================

function getStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error('Error reading from storage:', e);
        return null;
    }
}

function setStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (e) {
        console.error('Error writing to storage:', e);
        return false;
    }
}

// ============================================
// USER MANAGEMENT
// ============================================

function getUsers() {
    return getStorage(STORAGE_KEYS.USERS) || [];
}

function saveUsers(users) {
    return setStorage(STORAGE_KEYS.USERS, users);
}

function getCurrentUser() {
    return getStorage(STORAGE_KEYS.CURRENT_USER) || null;
}

function setCurrentUser(user) {
    return setStorage(STORAGE_KEYS.CURRENT_USER, user);
}

function clearCurrentUser() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

// ============================================
// EMPLOYEE MANAGEMENT
// ============================================

function getEmployees() {
    // Employees are stored as users with role 'employee'
    const users = getUsers();
    return users.filter(user => user.role === 'employee' || user.role === 'admin');
}

function saveEmployee(employee) {
    const users = getUsers();
    const index = users.findIndex(u => u.id === employee.id || u.loginId === employee.loginId);
    
    if (index >= 0) {
        users[index] = employee;
    } else {
        users.push(employee);
    }
    
    return saveUsers(users);
}

// ============================================
// AUTHENTICATION
// ============================================

/**
 * Login function
 * @param {string} loginIdOrEmail - Login ID or Email
 * @param {string} password - Password
 * @returns {boolean} Success status
 */
function login(loginIdOrEmail, password) {
    const users = getUsers();
    const user = users.find(u => 
        (u.loginId && u.loginId.toLowerCase() === loginIdOrEmail.toLowerCase()) ||
        (u.email && u.email.toLowerCase() === loginIdOrEmail.toLowerCase())
    );
    
    if (user && user.password === password) {
        setCurrentUser(user);
        return true;
    }
    
    return false;
}

/**
 * Logout function
 */
function logout() {
    clearCurrentUser();
}

/**
 * Check if user is logged in
 * @returns {boolean}
 */
function isLoggedIn() {
    return getCurrentUser() !== null;
}

// ============================================
// EMPLOYEE CREATION
// ============================================

/**
 * Create a new employee account
 * @param {Object} employeeData - Employee data
 * @returns {boolean} Success status
 */
function createEmployee(employeeData) {
    const users = getUsers();
    
    // Check if email already exists
    if (users.some(u => u.email && u.email.toLowerCase() === employeeData.email.toLowerCase())) {
        return false;
    }
    
    // Generate Login ID
    const loginId = generateLoginID({
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        companyName: employeeData.companyName,
        yearOfJoining: new Date().getFullYear()
    });
    
    // Create employee object
    const employee = {
        id: `EMP${Date.now()}`,
        loginId: loginId,
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        name: `${employeeData.firstName} ${employeeData.lastName}`,
        email: employeeData.email,
        phone: employeeData.phone,
        password: employeeData.password,
        companyName: employeeData.companyName || 'Company',
        role: employeeData.role || 'employee',
        
        // Profile fields
        jobPosition: employeeData.jobPosition || '',
        department: employeeData.department || '',
        manager: employeeData.manager || '',
        location: employeeData.location || '',
        
        // Private info
        dateOfBirth: employeeData.dateOfBirth || '',
        address: employeeData.address || '',
        nationality: employeeData.nationality || '',
        personalEmail: employeeData.personalEmail || '',
        gender: employeeData.gender || '',
        maritalStatus: employeeData.maritalStatus || '',
        dateOfJoining: employeeData.dateOfJoining || new Date().toISOString().split('T')[0],
        
        // Attendance status
        attendanceStatus: 'absent', // present, on-leave, absent
        
        // Avatar
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(employeeData.firstName + ' ' + employeeData.lastName)}&background=a855f7&color=fff`
    };
    
    users.push(employee);
    return saveUsers(users);
}

// ============================================
// ATTENDANCE SYSTEM
// ============================================

function getAttendance() {
    return getStorage(STORAGE_KEYS.ATTENDANCE) || {};
}

function saveAttendance(attendance) {
    return setStorage(STORAGE_KEYS.ATTENDANCE, attendance);
}

function getAttendanceRecords() {
    return getAttendance();
}

function checkIn(userId) {
    const attendance = getAttendance();
    const now = new Date();
    
    attendance[userId] = {
        checkedIn: true,
        checkInTime: now.toISOString(),
        date: now.toISOString().split('T')[0]
    };
    
    // Update employee status
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex >= 0) {
        users[userIndex].attendanceStatus = 'present';
        saveUsers(users);
        
        // Update current user if it's the same user
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            currentUser.attendanceStatus = 'present';
            setCurrentUser(currentUser);
        }
    }
    
    return saveAttendance(attendance);
}

function checkOut(userId) {
    const attendance = getAttendance();
    
    if (attendance[userId]) {
        attendance[userId].checkedOut = true;
        attendance[userId].checkOutTime = new Date().toISOString();
    }
    
    // Update employee status (keep as present for the day, but no longer checked in)
    // Status will reset to 'absent' on next day (logic would be handled by backend)
    
    return saveAttendance(attendance);
}

function isCheckedIn(userId) {
    const attendance = getAttendance();
    const record = attendance[userId];
    
    if (!record) return false;
    
    // Check if checked in today
    const today = new Date().toISOString().split('T')[0];
    return record.checkedIn && record.date === today && !record.checkedOut;
}

function getCheckInTime(userId) {
    const attendance = getAttendance();
    const record = attendance[userId];
    
    if (!record || !record.checkInTime) return null;
    
    return new Date(record.checkInTime);
}

// ============================================
// PASSWORD MANAGEMENT
// ============================================

function changePassword(currentPassword, newPassword) {
    const currentUser = getCurrentUser();
    
    if (!currentUser || currentUser.password !== currentPassword) {
        return false;
    }
    
    // Update password
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex >= 0) {
        users[userIndex].password = newPassword;
        saveUsers(users);
        
        currentUser.password = newPassword;
        setCurrentUser(currentUser);
        return true;
    }
    
    return false;
}

// ============================================
// RENDERING FUNCTIONS
// ============================================

/**
 * Render employee cards on dashboard
 */
function renderEmployees() {
    const employeeGrid = document.getElementById('employeeGrid');
    if (!employeeGrid) return;
    
    const employees = getEmployees();
    
    // Show all employees in the grid
    employeeGrid.innerHTML = '';
    
    employees.forEach(employee => {
        const card = document.createElement('div');
        card.className = 'employee-card';
        card.dataset.employeeId = employee.id;
        
        // Determine status class
        let statusClass = 'absent';
        let statusLabel = 'Absent';
        
        if (employee.attendanceStatus === 'present') {
            statusClass = 'present';
            statusLabel = 'Present';
        } else if (employee.attendanceStatus === 'on-leave') {
            statusClass = 'on-leave';
            statusLabel = 'On Leave';
        }
        
        card.innerHTML = `
            <div class="employee-status-dot ${statusClass}" title="${statusLabel}"></div>
            <div class="employee-avatar">
                <img src="${employee.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=a855f7&color=fff`}" 
                     alt="${employee.name}"
                     onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=a855f7&color=fff'">
            </div>
            <div class="employee-name">${employee.name}</div>
        `;
        
        card.addEventListener('click', function() {
            // Navigate to profile view (view-only for non-admin)
            window.location.href = `profile.html?userId=${employee.id}`;
        });
        
        employeeGrid.appendChild(card);
    });
}

/**
 * Initialize check-in system
 */
function initCheckIn() {
    const checkinIndicator = document.getElementById('checkinIndicator');
    const checkinCircle = document.getElementById('checkinCircle');
    const checkinPopup = document.getElementById('checkinPopup');
    const checkInBtn = document.getElementById('checkInBtn');
    const checkOutBtn = document.getElementById('checkOutBtn');
    const checkinTimeDisplay = document.getElementById('checkinTimeDisplay');
    const checkinTimeValue = document.getElementById('checkinTimeValue');
    const checkinPopupTitle = document.getElementById('checkinPopupTitle');
    
    if (!checkinIndicator) return;
    
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const userId = currentUser.id;
    let checkInInterval = null;
    
    function updateCheckInStatus() {
        const checkedIn = isCheckedIn(userId);
        checkinCircle.classList.toggle('checked-in', checkedIn);
        checkinCircle.textContent = checkedIn ? '✓' : '⏰';
        
        if (checkedIn) {
            const checkInTime = getCheckInTime(userId);
            if (checkInTime) {
                updateTimeDisplay(checkInTime);
                if (!checkInInterval) {
                    checkInInterval = setInterval(() => updateTimeDisplay(checkInTime), 1000);
                }
            }
        } else {
            if (checkInInterval) {
                clearInterval(checkInInterval);
                checkInInterval = null;
            }
        }
    }
    
    function updateTimeDisplay(checkInTime) {
        const now = new Date();
        const hours12 = checkInTime.getHours() % 12 || 12;
        const minutes = String(checkInTime.getMinutes()).padStart(2, '0');
        const ampm = checkInTime.getHours() >= 12 ? 'PM' : 'AM';
        checkinTimeValue.textContent = `${hours12}:${minutes} ${ampm}`;
    }
    
    function updatePopup() {
        const checkedIn = isCheckedIn(userId);
        checkinPopupTitle.textContent = checkedIn ? 'Checked IN' : 'Check IN';
        checkInBtn.style.display = checkedIn ? 'none' : 'block';
        checkOutBtn.style.display = checkedIn ? 'block' : 'none';
        checkinTimeDisplay.style.display = checkedIn ? 'block' : 'none';
    }
    
    // Toggle popup
    checkinIndicator.addEventListener('click', function(e) {
        e.stopPropagation();
        checkinPopup.classList.toggle('show');
        updatePopup();
    });
    
    // Close popup when clicking outside
    document.addEventListener('click', function(e) {
        if (!checkinIndicator.contains(e.target)) {
            checkinPopup.classList.remove('show');
        }
    });
    
    // Check In button
    checkInBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        checkIn(userId);
        updateCheckInStatus();
        updatePopup();
        checkinPopup.classList.remove('show');
        renderEmployees(); // Refresh employee grid
        alert('Successfully checked in!');
    });
    
    // Check Out button
    checkOutBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        checkOut(userId);
        updateCheckInStatus();
        updatePopup();
        checkinPopup.classList.remove('show');
        renderEmployees(); // Refresh employee grid
        alert('Successfully checked out!');
    });
    
    // Initial update
    updateCheckInStatus();
    updatePopup();
}

/**
 * Render profile page
 * @param {Object} user - User/Employee object to render
 * @param {boolean} canEdit - Whether the current user can edit this profile
 */
function renderProfile(user, canEdit) {
    if (!user) return;
    
    // Update header
    const profileName = document.getElementById('profileName');
    const profileAvatarImg = document.getElementById('profileAvatarImg');
    const profileInfoGrid = document.getElementById('profileInfoGrid');
    
    if (profileName) profileName.textContent = user.name || 'Employee Name';
    if (profileAvatarImg) {
        profileAvatarImg.src = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=a855f7&color=fff`;
    }
    
    // Render header info grid
    if (profileInfoGrid) {
        profileInfoGrid.innerHTML = `
            <div class="info-item">
                <span class="info-label">Job Position</span>
                <span class="info-value">${user.jobPosition || 'N/A'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Email</span>
                <span class="info-value">${user.email || 'N/A'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Mobile</span>
                <span class="info-value">${user.phone || 'N/A'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Company</span>
                <span class="info-value">${user.companyName || 'N/A'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Department</span>
                <span class="info-value">${user.department || 'N/A'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Manager</span>
                <span class="info-value">${user.manager || 'N/A'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Location</span>
                <span class="info-value">${user.location || 'N/A'}</span>
            </div>
        `;
    }
    
    // Render Resume tab
    renderResumeTab(user, canEdit);
    
    // Render Private Info tab
    renderPrivateInfoTab(user, canEdit);
    
    // Render Salary tab (admin only)
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.role === 'admin') {
        renderSalaryTab(user);
    }
}

function renderResumeTab(user, canEdit) {
    const resumeFormGrid = document.getElementById('resumeFormGrid');
    if (!resumeFormGrid) return;
    
    resumeFormGrid.innerHTML = `
        <div class="input-group">
            <label>Job Position</label>
            <input type="text" value="${user.jobPosition || ''}" ${!canEdit ? 'disabled' : ''}>
        </div>
        <div class="input-group">
            <label>Department</label>
            <input type="text" value="${user.department || ''}" ${!canEdit ? 'disabled' : ''}>
        </div>
        <div class="input-group">
            <label>Manager</label>
            <input type="text" value="${user.manager || ''}" ${!canEdit ? 'disabled' : ''}>
        </div>
        <div class="input-group">
            <label>Location</label>
            <input type="text" value="${user.location || ''}" ${!canEdit ? 'disabled' : ''}>
        </div>
    `;
}

function renderPrivateInfoTab(user, canEdit) {
    const privateFormGrid = document.getElementById('privateFormGrid');
    if (!privateFormGrid) return;
    
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toISOString().split('T')[0];
    };
    
    privateFormGrid.innerHTML = `
        <div class="input-group">
            <label>Date of Birth</label>
            <input type="date" value="${formatDate(user.dateOfBirth)}" ${!canEdit ? 'disabled' : ''}>
        </div>
        <div class="input-group">
            <label>Address</label>
            <input type="text" value="${user.address || ''}" ${!canEdit ? 'disabled' : ''}>
        </div>
        <div class="input-group">
            <label>Nationality</label>
            <input type="text" value="${user.nationality || ''}" ${!canEdit ? 'disabled' : ''}>
        </div>
        <div class="input-group">
            <label>Personal Email</label>
            <input type="email" value="${user.personalEmail || ''}" ${!canEdit ? 'disabled' : ''}>
        </div>
        <div class="input-group">
            <label>Gender</label>
            <input type="text" value="${user.gender || ''}" ${!canEdit ? 'disabled' : ''}>
        </div>
        <div class="input-group">
            <label>Marital Status</label>
            <input type="text" value="${user.maritalStatus || ''}" ${!canEdit ? 'disabled' : ''}>
        </div>
        <div class="input-group">
            <label>Date of Joining</label>
            <input type="date" value="${formatDate(user.dateOfJoining)}" disabled>
        </div>
    `;
}

function renderSalaryTab(user) {
    const salaryGrid = document.getElementById('salaryGrid');
    if (!salaryGrid) return;
    
    // Sample salary data (in real app, this would come from backend)
    const salaryData = user.salaryData || {
        monthlyWage: '50000',
        yearlyWage: '600000',
        workingDays: '22',
        workingHours: '176',
        basicSalary: '30000',
        hra: '15000',
        specialAllowance: '3000',
        fixedAllowance: '2000',
        pfEmployee: '3600',
        pfEmployer: '3600',
        taxDeductions: '5000',
        pan: user.pan || 'ABCDE1234F',
        uan: user.uan || '123456789012',
        empCode: user.loginId || '',
        ifsc: user.ifsc || 'SBIN0001234',
        bankName: user.bankName || 'State Bank of India',
        accountNumber: user.accountNumber || '1234567890'
    };
    
    salaryGrid.innerHTML = `
        <div class="salary-section">
            <h4>Salary Overview</h4>
            <div class="salary-item">
                <span class="salary-label">Monthly Wage</span>
                <span class="salary-value">₹${salaryData.monthlyWage}</span>
            </div>
            <div class="salary-item">
                <span class="salary-label">Yearly Wage</span>
                <span class="salary-value">₹${salaryData.yearlyWage}</span>
            </div>
            <div class="salary-item">
                <span class="salary-label">Working Days</span>
                <span class="salary-value">${salaryData.workingDays} days</span>
            </div>
            <div class="salary-item">
                <span class="salary-label">Working Hours</span>
                <span class="salary-value">${salaryData.workingHours} hours</span>
            </div>
        </div>
        
        <div class="salary-section">
            <h4>Salary Components</h4>
            <div class="salary-item">
                <span class="salary-label">Basic Salary</span>
                <span class="salary-value">₹${salaryData.basicSalary}</span>
            </div>
            <div class="salary-item">
                <span class="salary-label">HRA</span>
                <span class="salary-value">₹${salaryData.hra}</span>
            </div>
            <div class="salary-item">
                <span class="salary-label">Special Allowance</span>
                <span class="salary-value">₹${salaryData.specialAllowance}</span>
            </div>
            <div class="salary-item">
                <span class="salary-label">Fixed Allowance</span>
                <span class="salary-value">₹${salaryData.fixedAllowance}</span>
            </div>
        </div>
        
        <div class="salary-section">
            <h4>PF Contribution</h4>
            <div class="salary-item">
                <span class="salary-label">Employee</span>
                <span class="salary-value">₹${salaryData.pfEmployee}</span>
            </div>
            <div class="salary-item">
                <span class="salary-label">Employer</span>
                <span class="salary-value">₹${salaryData.pfEmployer}</span>
            </div>
        </div>
        
        <div class="salary-section">
            <h4>Tax Deductions</h4>
            <div class="salary-item">
                <span class="salary-label">Tax</span>
                <span class="salary-value">₹${salaryData.taxDeductions}</span>
            </div>
        </div>
        
        <div class="salary-section">
            <h4>Bank Details</h4>
            <div class="salary-item">
                <span class="salary-label">PAN</span>
                <span class="salary-value">${salaryData.pan}</span>
            </div>
            <div class="salary-item">
                <span class="salary-label">UAN</span>
                <span class="salary-value">${salaryData.uan}</span>
            </div>
            <div class="salary-item">
                <span class="salary-label">Emp Code</span>
                <span class="salary-value">${salaryData.empCode}</span>
            </div>
            <div class="salary-item">
                <span class="salary-label">IFSC</span>
                <span class="salary-value">${salaryData.ifsc}</span>
            </div>
            <div class="salary-item">
                <span class="salary-label">Bank Name</span>
                <span class="salary-value">${salaryData.bankName}</span>
            </div>
            <div class="salary-item">
                <span class="salary-label">Account Number</span>
                <span class="salary-value">${salaryData.accountNumber}</span>
            </div>
        </div>
    `;
}

/**
 * Render attendance records
 */
function renderAttendance() {
    const attendanceContainer = document.getElementById('attendanceContainer');
    if (!attendanceContainer) return;
    
    const currentUser = getCurrentUser();
    const isAdmin = currentUser && currentUser.role === 'admin';
    const attendance = getAttendance();
    const employees = getEmployees();
    
    // Get attendance records for current user (or all if admin)
    const records = [];
    const today = new Date().toISOString().split('T')[0];
    
    if (isAdmin) {
        // Admin sees all attendance records
        employees.forEach(emp => {
            const empAttendance = attendance[emp.id];
            if (empAttendance && empAttendance.date === today) {
                records.push({
                    employee: emp,
                    ...empAttendance
                });
            }
        });
    } else {
        // Employee sees only their own records
        const userAttendance = attendance[currentUser.id];
        if (userAttendance && userAttendance.date === today) {
            records.push({
                employee: currentUser,
                ...userAttendance
            });
        }
    }
    
    if (records.length === 0) {
        attendanceContainer.innerHTML = `
            <div class="empty-state">
                <h3>No attendance records for today</h3>
                <p>Check in to start tracking your attendance</p>
            </div>
        `;
        return;
    }
    
    attendanceContainer.innerHTML = `
        <div class="attendance-table">
            <table>
                <thead>
                    <tr>
                        <th>Employee</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Status</th>
                        <th>Duration</th>
                    </tr>
                </thead>
                <tbody>
                    ${records.map(record => {
                        const checkInTime = record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '-';
                        const checkOutTime = record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : '-';
                        const status = record.checkedIn ? 'Present' : 'Checked Out';
                        let duration = '-';
                        if (record.checkInTime) {
                            const endTime = record.checkOutTime ? new Date(record.checkOutTime) : new Date();
                            const diff = endTime - new Date(record.checkInTime);
                            const hours = Math.floor(diff / (1000 * 60 * 60));
                            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                            duration = `${hours}h ${minutes}m`;
                        }
                        return `
                            <tr>
                                <td>${record.employee.name}</td>
                                <td>${checkInTime}</td>
                                <td>${checkOutTime}</td>
                                <td><span class="status-badge ${record.checkedIn ? 'present' : 'checked-out'}">${status}</span></td>
                                <td>${duration}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

/**
 * Render time off requests
 */
function renderTimeOff() {
    const timeoffContainer = document.getElementById('timeoffContainer');
    if (!timeoffContainer) return;
    
    const currentUser = getCurrentUser();
    const isAdmin = currentUser && currentUser.role === 'admin';
    
    // Get time off requests (stored in localStorage)
    const timeOffRequests = getStorage('ems_timeoff') || [];
    
    // Filter based on role
    let displayRequests = [];
    if (isAdmin) {
        displayRequests = timeOffRequests;
    } else {
        displayRequests = timeOffRequests.filter(req => req.employeeId === currentUser.id);
    }
    
    if (displayRequests.length === 0) {
        timeoffContainer.innerHTML = `
            <div class="empty-state">
                <h3>No time off requests</h3>
                <p>${isAdmin ? 'Employees can request time off here' : 'Request time off when needed'}</p>
            </div>
        `;
        return;
    }
    
    timeoffContainer.innerHTML = `
        <div class="timeoff-list">
            ${displayRequests.map((request) => {
                const statusClass = request.status || 'pending';
                const requestId = request.id || Date.now();
                return `
                    <div class="timeoff-card">
                        <div class="timeoff-header">
                            <div>
                                <h4>${request.employeeName || 'Employee'}</h4>
                                <p class="timeoff-date">${request.startDate} to ${request.endDate}</p>
                            </div>
                            <span class="status-badge ${statusClass}">${statusClass.charAt(0).toUpperCase() + statusClass.slice(1)}</span>
                        </div>
                        <div class="timeoff-details">
                            <p><strong>Type:</strong> ${request.type || 'Leave'}</p>
                            <p><strong>Reason:</strong> ${request.reason || 'N/A'}</p>
                            <p><strong>Days:</strong> ${request.days || 'N/A'}</p>
                        </div>
                        ${isAdmin && statusClass === 'pending' ? `
                            <div class="timeoff-actions">
                                <button class="btn btn-primary" onclick="app.approveTimeOff('${requestId}')">Approve</button>
                                <button class="btn btn-secondary" onclick="app.rejectTimeOff('${requestId}')">Reject</button>
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

/**
 * Approve time off request
 */
function approveTimeOff(requestId) {
    const timeOffRequests = getStorage('ems_timeoff') || [];
    const request = timeOffRequests.find(req => req.id === requestId || req.id === parseInt(requestId));
    if (request) {
        request.status = 'approved';
        setStorage('ems_timeoff', timeOffRequests);
        renderTimeOff();
        alert('Time off request approved');
    }
}

/**
 * Reject time off request
 */
function rejectTimeOff(requestId) {
    const timeOffRequests = getStorage('ems_timeoff') || [];
    const request = timeOffRequests.find(req => req.id === requestId || req.id === parseInt(requestId));
    if (request) {
        request.status = 'rejected';
        setStorage('ems_timeoff', timeOffRequests);
        renderTimeOff();
        alert('Time off request rejected');
    }
}

// ============================================
// EXPORT APP OBJECT
// ============================================

const app = {
    // Authentication
    login,
    logout,
    isLoggedIn,
    getCurrentUser,
    
    // Employee management
    createEmployee,
    getEmployees,
    generateLoginID,
    
    // Attendance
    initCheckIn,
    checkIn,
    checkOut,
    isCheckedIn,
    getCheckInTime,
    
    // Password
    changePassword,
    
    // Rendering
    renderEmployees,
    renderProfile,
    renderAttendance,
    renderTimeOff,
    
    // Time Off
    approveTimeOff,
    rejectTimeOff
};

// ============================================
// INITIALIZE DEFAULT DATA (for demo)
// ============================================

// Create a default admin user if no users exist
if (getUsers().length === 0) {
    const defaultAdmin = {
        id: 'admin001',
        loginId: 'ADMIN001',
        firstName: 'Admin',
        lastName: 'User',
        name: 'Admin User',
        email: 'admin@company.com',
        phone: '1234567890',
        password: 'admin123',
        companyName: 'Company Name',
        role: 'admin',
        jobPosition: 'Administrator',
        department: 'Administration',
        manager: '',
        location: 'Head Office',
        attendanceStatus: 'present',
        avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=a855f7&color=fff'
    };
    
    const users = getUsers();
    users.push(defaultAdmin);
    saveUsers(users);
}

