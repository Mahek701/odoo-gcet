// Sample employee data
const employees = [
    { id: 'EMP001', name: 'Yash Rana', post: 'Senior Developer', department: 'Engineering', status: 'active', avatar: 'https://via.placeholder.com/80?text=YR' },
    { id: 'EMP002', name: 'John Doe', post: 'Product Manager', department: 'Product', status: 'active', avatar: 'https://via.placeholder.com/80?text=JD' },
    { id: 'EMP003', name: 'Jane Smith', post: 'UI/UX Designer', department: 'Design', status: 'active', avatar: 'https://via.placeholder.com/80?text=JS' },
    { id: 'EMP004', name: 'Mike Johnson', post: 'HR Manager', department: 'Human Resources', status: 'inactive', avatar: 'https://via.placeholder.com/80?text=MJ' },
    { id: 'EMP005', name: 'Sarah Williams', post: 'Marketing Lead', department: 'Marketing', status: 'active', avatar: 'https://via.placeholder.com/80?text=SW' },
    { id: 'EMP006', name: 'David Brown', post: 'Data Analyst', department: 'Analytics', status: 'active', avatar: 'https://via.placeholder.com/80?text=DB' },
    { id: 'EMP007', name: 'Emily Davis', post: 'QA Engineer', department: 'Quality Assurance', status: 'inactive', avatar: 'https://via.placeholder.com/80?text=ED' },
    { id: 'EMP008', name: 'Chris Wilson', post: 'DevOps Engineer', department: 'Engineering', status: 'active', avatar: 'https://via.placeholder.com/80?text=CW' },
    { id: 'EMP009', name: 'Lisa Anderson', post: 'Finance Manager', department: 'Finance', status: 'active', avatar: 'https://via.placeholder.com/80?text=LA' }
];

// State management
let isCheckedIn = false;
let checkInTime = null;
let filteredEmployees = [...employees];
let timeInterval = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeCheckInIndicator();
    renderEmployees();
    setupEventListeners();
});

// Initialize check-in/check-out indicator
function initializeCheckInIndicator() {
    const checkinCircle = document.getElementById('checkinCircle');
    const checkinIndicator = document.getElementById('checkinIndicator');
    const checkinPopup = document.getElementById('checkinPopup');
    
    // Set initial state
    updateCheckInStatus();
    
    // Toggle popup on circle click
    checkinIndicator.addEventListener('click', function(e) {
        e.stopPropagation();
        checkinPopup.classList.toggle('show');
        updateCheckInPopup();
    });
    
    // Close popup when clicking outside
    document.addEventListener('click', function(e) {
        if (!checkinIndicator.contains(e.target)) {
            checkinPopup.classList.remove('show');
        }
    });
    
    // Check In button
    document.getElementById('checkInBtn').addEventListener('click', function(e) {
        e.stopPropagation();
        performCheckIn();
        checkinPopup.classList.remove('show');
    });
    
    // Check Out button
    document.getElementById('checkOutBtn').addEventListener('click', function(e) {
        e.stopPropagation();
        performCheckOut();
        checkinPopup.classList.remove('show');
    });
}

// Update check-in status display
function updateCheckInStatus() {
    const checkinCircle = document.getElementById('checkinCircle');
    checkinCircle.classList.remove('checked-in', 'checked-out');
    checkinCircle.classList.add(isCheckedIn ? 'checked-in' : 'checked-out');
}

// Update check-in popup content
function updateCheckInPopup() {
    const popupTitle = document.getElementById('checkinPopupTitle');
    const timeDisplay = document.getElementById('checkinTimeDisplay');
    const checkInBtn = document.getElementById('checkInBtn');
    const checkOutBtn = document.getElementById('checkOutBtn');
    
    if (isCheckedIn) {
        popupTitle.textContent = 'Checked IN';
        timeDisplay.style.display = 'block';
        checkInBtn.style.display = 'none';
        checkOutBtn.style.display = 'block';
        updateTimeDisplay();
    } else {
        popupTitle.textContent = 'Check IN';
        timeDisplay.style.display = 'none';
        checkInBtn.style.display = 'block';
        checkOutBtn.style.display = 'none';
    }
}

// Perform check-in
function performCheckIn() {
    isCheckedIn = true;
    checkInTime = new Date();
    updateCheckInStatus();
    updateCheckInPopup();
    startTimeTracking();
    showNotification('Successfully Checked In');
}

// Perform check-out
function performCheckOut() {
    isCheckedIn = false;
    checkInTime = null;
    updateCheckInStatus();
    updateCheckInPopup();
    stopTimeTracking();
    showNotification('Successfully Checked Out');
}

// Start time tracking
function startTimeTracking() {
    if (timeInterval) {
        clearInterval(timeInterval);
    }
    
    timeInterval = setInterval(() => {
        if (isCheckedIn && checkInTime) {
            updateTimeDisplay();
        }
    }, 1000);
    
    updateTimeDisplay();
}

// Stop time tracking
function stopTimeTracking() {
    if (timeInterval) {
        clearInterval(timeInterval);
        timeInterval = null;
    }
}

// Update time display
function updateTimeDisplay() {
    if (!isCheckedIn || !checkInTime) {
        return;
    }
    
    const now = new Date();
    const diff = now - checkInTime;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    // Format time as "Since HH:MM AM/PM"
    const checkInDate = new Date(checkInTime);
    const hours12 = checkInDate.getHours() % 12 || 12;
    const minutes12 = checkInDate.getMinutes().toString().padStart(2, '0');
    const ampm = checkInDate.getHours() >= 12 ? 'PM' : 'AM';
    
    const timeValue = document.getElementById('checkinTimeValue');
    timeValue.textContent = `${hours12}:${minutes12} ${ampm}`;
}

// Render employee cards
function renderEmployees() {
    const employeeGrid = document.getElementById('employeeGrid');
    employeeGrid.innerHTML = '';

    filteredEmployees.forEach(employee => {
        const card = createEmployeeCard(employee);
        employeeGrid.appendChild(card);
    });
}

// Create employee card element
function createEmployeeCard(employee) {
    const card = document.createElement('div');
    card.className = 'employee-card';
    card.dataset.employeeId = employee.id;

    card.innerHTML = `
        <div class="employee-status ${employee.status}"></div>
        <div class="employee-avatar">
            <img src="${employee.avatar}" alt="${employee.name}" onerror="this.style.display='none'; this.parentElement.innerHTML='${employee.name.charAt(0)}'">
        </div>
        <div class="employee-name">${employee.name}</div>
    `;

    card.addEventListener('click', function() {
        showEmployeePopup(employee);
    });

    return card;
}

// Show employee details popup
function showEmployeePopup(employee) {
    const popup = document.getElementById('popupOverlay');
    document.getElementById('popupAvatar').src = employee.avatar;
    document.getElementById('popupName').textContent = employee.name;
    document.getElementById('popupId').textContent = employee.id;
    document.getElementById('popupPost').textContent = employee.post;
    document.getElementById('popupDepartment').textContent = employee.department;
    
    popup.classList.add('show');
}

// Close popup
function closePopup() {
    document.getElementById('popupOverlay').classList.remove('show');
}

// Setup event listeners
function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const tabName = this.dataset.tab;
            handleTabSwitch(tabName);
        });
    });

    // Search functionality
    document.getElementById('searchInput').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        filterEmployees(searchTerm);
    });

    // User avatar dropdown
    const userAvatar = document.getElementById('userAvatar');
    const userDropdown = document.getElementById('userDropdown');
    
    userAvatar.addEventListener('click', function(e) {
        e.stopPropagation();
        userDropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!userAvatar.contains(e.target) && !userDropdown.contains(e.target)) {
            userDropdown.classList.remove('show');
        }
    });

    // My Profile button
    document.getElementById('myProfileBtn').addEventListener('click', function(e) {
        e.preventDefault();
        userDropdown.classList.remove('show');
        // This will be handled by the other team's dashboard
        // For now, we'll just show an alert
        const userType = 'admin'; // This should come from your authentication system
        if (userType === 'admin') {
            // Redirect to admin dashboard (to be implemented by other team)
            alert('Redirecting to Admin Dashboard (to be implemented by other team)');
        } else {
            // Redirect to employee dashboard (to be implemented by other team)
            alert('Redirecting to Employee Dashboard (to be implemented by other team)');
        }
    });

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        userDropdown.classList.remove('show');
        if (confirm('Are you sure you want to logout?')) {
            // Handle logout (redirect to login page, clear session, etc.)
            alert('Logging out... (to be implemented)');
        }
    });

    // Popup close button
    document.getElementById('popupClose').addEventListener('click', closePopup);
    
    // Close popup when clicking overlay
    document.getElementById('popupOverlay').addEventListener('click', function(e) {
        if (e.target === this) {
            closePopup();
        }
    });

    // Close popup with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closePopup();
        }
    });

    // NEW button
    document.getElementById('newBtn').addEventListener('click', function() {
        alert('New Employee form will open here (to be implemented)');
    });
}

// Handle tab switching
function handleTabSwitch(tabName) {
    // This will be implemented when other tabs are ready
    console.log(`Switched to ${tabName} tab`);
    
    // For now, we'll just show a message
    if (tabName === 'attendance') {
        alert('Attendance tab (to be implemented)');
    } else if (tabName === 'timeoff') {
        alert('Time Off tab (to be implemented)');
    }
    // Employees tab is already showing
}

// Filter employees based on search term
function filterEmployees(searchTerm) {
    if (searchTerm === '') {
        filteredEmployees = [...employees];
    } else {
        filteredEmployees = employees.filter(employee => 
            employee.name.toLowerCase().includes(searchTerm) ||
            employee.id.toLowerCase().includes(searchTerm) ||
            employee.post.toLowerCase().includes(searchTerm) ||
            employee.department.toLowerCase().includes(searchTerm)
        );
    }
    renderEmployees();
}

// Show notification (simple implementation)
function showNotification(message) {
    // Create a simple notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #4caf50;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 4px;
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

