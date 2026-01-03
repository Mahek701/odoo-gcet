// Sample attendance data for employee view
const employeeAttendanceData = [
    { date: '2025-10-28', status: 'present', checkIn: '10:00', checkOut: '19:00', workHours: '09:00', extraHours: '01:00' },
    { date: '2025-10-29', status: 'present', checkIn: '10:00', checkOut: '19:00', workHours: '09:00', extraHours: '01:00' },
    { date: '2025-10-30', status: 'present', checkIn: '09:30', checkOut: '18:30', workHours: '09:00', extraHours: '00:00' },
    { date: '2025-10-31', status: 'leave', checkIn: '-', checkOut: '-', workHours: '00:00', extraHours: '00:00' },
    { date: '2025-11-01', status: 'present', checkIn: '10:15', checkOut: '19:15', workHours: '09:00', extraHours: '00:00' },
    { date: '2025-11-02', status: 'absent', checkIn: '-', checkOut: '-', workHours: '00:00', extraHours: '00:00' },
    { date: '2025-11-03', status: 'present', checkIn: '09:45', checkOut: '18:45', workHours: '09:00', extraHours: '00:00' }
];

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let filteredAttendance = [...employeeAttendanceData];

// Check-in/Check-out state management
let isCheckedIn = false;
let checkInTime = null;
let timeInterval = null;

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeCheckInIndicator();
    initializeMonthControls();
    renderAttendanceTable();
    updateStatistics();
    setupEventListeners();
    updateMonthDisplay();
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

// Initialize month controls
function initializeMonthControls() {
    updateMonthDisplay();
}

// Update month display
function updateMonthDisplay() {
    document.getElementById('selectedMonth').textContent = monthNames[currentMonth];
}

// Setup event listeners
function setupEventListeners() {
    // Previous month button
    document.getElementById('prevMonthBtn').addEventListener('click', function() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        updateMonthDisplay();
        filterByMonth();
        renderAttendanceTable();
        updateStatistics();
    });

    // Next month button
    document.getElementById('nextMonthBtn').addEventListener('click', function() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        updateMonthDisplay();
        filterByMonth();
        renderAttendanceTable();
        updateStatistics();
    });

    // Month selector (can be expanded to show a month picker)
    document.getElementById('monthSelector').addEventListener('click', function() {
        const monthOptions = monthNames.map((month, index) => 
            `${month} ${currentYear === new Date().getFullYear() && index === currentMonth ? '(Current)' : ''}`
        ).join('\n');
        
        const selected = prompt(`Select month (0-11):\n${monthNames.map((m, i) => `${i}: ${m}`).join('\n')}`, currentMonth);
        if (selected !== null) {
            const monthIndex = parseInt(selected);
            if (monthIndex >= 0 && monthIndex <= 11) {
                currentMonth = monthIndex;
                updateMonthDisplay();
                filterByMonth();
                renderAttendanceTable();
                updateStatistics();
            }
        }
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
            window.location.href = '../index.html';
        }
    });
}

// Filter attendance by current month
function filterByMonth() {
    filteredAttendance = employeeAttendanceData.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    });
}

// Update statistics
function updateStatistics() {
    const presentDays = filteredAttendance.filter(r => r.status === 'present').length;
    const leaveDays = filteredAttendance.filter(r => r.status === 'leave').length;
    
    // Calculate total working days in the month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    
    // Count weekdays (Monday to Friday)
    let totalWorkingDays = 0;
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dayOfWeek = date.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
            totalWorkingDays++;
        }
    }
    
    document.getElementById('daysPresent').textContent = presentDays;
    document.getElementById('leavesCount').textContent = leaveDays;
    document.getElementById('totalWorkingDays').textContent = totalWorkingDays;
}

// Get status display text
function getStatusText(status) {
    switch(status) {
        case 'present':
            return 'Present';
        case 'absent':
            return 'Absent';
        case 'leave':
            return 'Leave';
        default:
            return status;
    }
}

// Render attendance table
function renderAttendanceTable() {
    const tbody = document.getElementById('attendanceTableBody');
    tbody.innerHTML = '';

    if (filteredAttendance.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <div class="empty-state-text">No attendance records for this month</div>
                </td>
            </tr>
        `;
        return;
    }

    // Sort by date (most recent first)
    const sortedAttendance = [...filteredAttendance].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });

    sortedAttendance.forEach(record => {
        const row = document.createElement('tr');
        const recordDate = new Date(record.date);
        const formattedDate = recordDate.toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
        
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>
                <span class="status-cell ${record.status}">${getStatusText(record.status)}</span>
            </td>
            <td class="work-hours-cell">${record.workHours}</td>
            <td class="extra-hours-cell">${record.extraHours}</td>
        `;
        
        tbody.appendChild(row);
    });
}

// Initialize on load
filterByMonth();

