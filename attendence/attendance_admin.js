// Sample attendance data for admin view
const attendanceData = [
    { 
        id: 'EMP001', 
        name: 'Yash Rana', 
        avatar: 'https://via.placeholder.com/32?text=YR',
        checkIn: '10:00',
        checkOut: '19:00',
        workHours: '09:00',
        extraHours: '01:00'
    },
    { 
        id: 'EMP002', 
        name: 'John Doe', 
        avatar: 'https://via.placeholder.com/32?text=JD',
        checkIn: '10:00',
        checkOut: '19:00',
        workHours: '09:00',
        extraHours: '01:00'
    },
    { 
        id: 'EMP003', 
        name: 'Jane Smith', 
        avatar: 'https://via.placeholder.com/32?text=JS',
        checkIn: '09:30',
        checkOut: '18:30',
        workHours: '09:00',
        extraHours: '00:00'
    },
    { 
        id: 'EMP005', 
        name: 'Sarah Williams', 
        avatar: 'https://via.placeholder.com/32?text=SW',
        checkIn: '10:15',
        checkOut: '19:15',
        workHours: '09:00',
        extraHours: '00:00'
    },
    { 
        id: 'EMP006', 
        name: 'David Brown', 
        avatar: 'https://via.placeholder.com/32?text=DB',
        checkIn: '09:45',
        checkOut: '18:45',
        workHours: '09:00',
        extraHours: '00:00'
    }
];

let currentDate = new Date();
let filteredAttendance = [...attendanceData];

// Check-in/Check-out state management
let isCheckedIn = false;
let checkInTime = null;
let timeInterval = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeCheckInIndicator();
    initializeDateControls();
    renderAttendanceTable();
    setupEventListeners();
    updateDateDisplay();
});

// Initialize check-in/check-out indicator
function initializeCheckInIndicator() {
    const checkinCircle = document.getElementById('checkinCircle');
    const checkinIndicator = document.getElementById('checkinIndicator');
    const checkinPopup = document.getElementById('checkinPopup');
    
    if (!checkinCircle || !checkinIndicator || !checkinPopup) {
        return; // Elements not found, skip initialization
    }
    
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
    const checkInBtn = document.getElementById('checkInBtn');
    if (checkInBtn) {
        checkInBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            performCheckIn();
            checkinPopup.classList.remove('show');
        });
    }
    
    // Check Out button
    const checkOutBtn = document.getElementById('checkOutBtn');
    if (checkOutBtn) {
        checkOutBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            performCheckOut();
            checkinPopup.classList.remove('show');
        });
    }
}

// Update check-in status display
function updateCheckInStatus() {
    const checkinCircle = document.getElementById('checkinCircle');
    if (!checkinCircle) return;
    
    checkinCircle.classList.remove('checked-in', 'checked-out');
    checkinCircle.classList.add(isCheckedIn ? 'checked-in' : 'checked-out');
}

// Update check-in popup content
function updateCheckInPopup() {
    const popupTitle = document.getElementById('checkinPopupTitle');
    const timeDisplay = document.getElementById('checkinTimeDisplay');
    const checkInBtn = document.getElementById('checkInBtn');
    const checkOutBtn = document.getElementById('checkOutBtn');
    
    if (!popupTitle || !timeDisplay || !checkInBtn || !checkOutBtn) return;
    
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
    
    const timeValue = document.getElementById('checkinTimeValue');
    if (!timeValue) return;
    
    // Format time as "Since HH:MM AM/PM"
    const checkInDate = new Date(checkInTime);
    const hours12 = checkInDate.getHours() % 12 || 12;
    const minutes12 = checkInDate.getMinutes().toString().padStart(2, '0');
    const ampm = checkInDate.getHours() >= 12 ? 'PM' : 'AM';
    
    timeValue.textContent = `${hours12}:${minutes12} ${ampm}`;
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
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 2000);
}

// Initialize date controls
function initializeDateControls() {
    updateDateDisplay();
}

// Update date display
function updateDateDisplay() {
    const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = currentDate.toLocaleDateString('en-US', dateOptions);
    document.getElementById('selectedDate').textContent = formattedDate;
}

// Setup event listeners
function setupEventListeners() {
    // Previous date button
    document.getElementById('prevDateBtn').addEventListener('click', function() {
        currentDate.setDate(currentDate.getDate() - 1);
        updateDateDisplay();
        renderAttendanceTable();
    });

    // Next date button
    document.getElementById('nextDateBtn').addEventListener('click', function() {
        currentDate.setDate(currentDate.getDate() + 1);
        updateDateDisplay();
        renderAttendanceTable();
    });

    // Date selector (can be expanded to show a calendar picker)
    document.getElementById('dateSelector').addEventListener('click', function() {
        // For now, just show an alert. Can be expanded to show a date picker
        const newDate = prompt('Enter date (MM/DD/YYYY):', currentDate.toLocaleDateString('en-US'));
        if (newDate) {
            const parsedDate = new Date(newDate);
            if (!isNaN(parsedDate.getTime())) {
                currentDate = parsedDate;
                updateDateDisplay();
                renderAttendanceTable();
            }
        }
    });

    // Day button
    document.getElementById('dayBtn').addEventListener('click', function() {
        // Reset to today
        currentDate = new Date();
        updateDateDisplay();
        renderAttendanceTable();
    });

    // Search functionality
    document.getElementById('searchInput').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        filterAttendance(searchTerm);
    });

    // User dropdown
    const userAvatar = document.getElementById('userAvatar');
    const userDropdown = document.getElementById('userDropdown');
    
    userAvatar.addEventListener('click', function(e) {
        e.stopPropagation();
        userDropdown.classList.toggle('show');
    });

    document.addEventListener('click', function(e) {
        if (!userAvatar.contains(e.target) && !userDropdown.contains(e.target)) {
            userDropdown.classList.remove('show');
        }
    });

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        userDropdown.classList.remove('show');
        if (confirm('Are you sure you want to logout?')) {
            window.location.href = '../authentication/login.html';
        }
    });
}

// Filter attendance based on search term
function filterAttendance(searchTerm) {
    if (searchTerm === '') {
        filteredAttendance = [...attendanceData];
    } else {
        filteredAttendance = attendanceData.filter(record => 
            record.name.toLowerCase().includes(searchTerm) ||
            record.id.toLowerCase().includes(searchTerm)
        );
    }
    renderAttendanceTable();
}

// Render attendance table
function renderAttendanceTable() {
    const tbody = document.getElementById('attendanceTableBody');
    tbody.innerHTML = '';

    if (filteredAttendance.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <div class="empty-state-text">No attendance records found</div>
                </td>
            </tr>
        `;
        return;
    }

    filteredAttendance.forEach(record => {
        const row = document.createElement('tr');
        
        // Get initials for avatar fallback
        const initials = record.name.split(' ').map(n => n[0]).join('').substring(0, 2);
        
        row.innerHTML = `
            <td>
                <div class="employee-cell">
                    <div class="employee-avatar-small">
                        <img src="${record.avatar}" alt="${record.name}" onerror="this.parentElement.textContent='${initials}'">
                    </div>
                    <span class="employee-name-cell">${record.name}</span>
                </div>
            </td>
            <td class="time-cell">${record.checkIn}</td>
            <td class="time-cell">${record.checkOut}</td>
            <td class="work-hours-cell">${record.workHours}</td>
            <td class="extra-hours-cell">${record.extraHours}</td>
        `;
        
        tbody.appendChild(row);
    });
}

