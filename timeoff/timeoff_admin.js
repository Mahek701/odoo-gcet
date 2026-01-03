// Sample time off data for admin view
const timeoffData = [
    {
        id: 1,
        name: 'Yash Rana',
        startDate: '2025-10-28',
        endDate: '2025-10-28',
        type: 'Paid time Off',
        status: 'pending'
    },
    {
        id: 2,
        name: 'John Doe',
        startDate: '2025-11-01',
        endDate: '2025-11-03',
        type: 'Sick Leave',
        status: 'pending'
    },
    {
        id: 3,
        name: 'Jane Smith',
        startDate: '2025-10-25',
        endDate: '2025-10-25',
        type: 'Paid time Off',
        status: 'approved'
    },
    {
        id: 4,
        name: 'Sarah Williams',
        startDate: '2025-11-05',
        endDate: '2025-11-07',
        type: 'Unpaid Leaves',
        status: 'pending'
    }
];

let filteredTimeoff = [...timeoffData];
let activeSubtab = 'timeoff';

// Check-in/Check-out state management
let isCheckedIn = false;
let checkInTime = null;
let timeInterval = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeCheckInIndicator();
    renderTimeoffTable();
    setupEventListeners();
});

// Initialize check-in/check-out indicator
function initializeCheckInIndicator() {
    const checkinCircle = document.getElementById('checkinCircle');
    const checkinIndicator = document.getElementById('checkinIndicator');
    const checkinPopup = document.getElementById('checkinPopup');
    
    if (!checkinCircle || !checkinIndicator || !checkinPopup) {
        return;
    }
    
    updateCheckInStatus();
    
    checkinIndicator.addEventListener('click', function(e) {
        e.stopPropagation();
        checkinPopup.classList.toggle('show');
        updateCheckInPopup();
    });
    
    document.addEventListener('click', function(e) {
        if (!checkinIndicator.contains(e.target)) {
            checkinPopup.classList.remove('show');
        }
    });
    
    const checkInBtn = document.getElementById('checkInBtn');
    if (checkInBtn) {
        checkInBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            performCheckIn();
            checkinPopup.classList.remove('show');
        });
    }
    
    const checkOutBtn = document.getElementById('checkOutBtn');
    if (checkOutBtn) {
        checkOutBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            performCheckOut();
            checkinPopup.classList.remove('show');
        });
    }
}

function updateCheckInStatus() {
    const checkinCircle = document.getElementById('checkinCircle');
    if (!checkinCircle) return;
    checkinCircle.classList.remove('checked-in', 'checked-out');
    checkinCircle.classList.add(isCheckedIn ? 'checked-in' : 'checked-out');
}

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

function performCheckIn() {
    isCheckedIn = true;
    checkInTime = new Date();
    updateCheckInStatus();
    updateCheckInPopup();
    startTimeTracking();
    showNotification('Successfully Checked In');
}

function performCheckOut() {
    isCheckedIn = false;
    checkInTime = null;
    updateCheckInStatus();
    updateCheckInPopup();
    stopTimeTracking();
    showNotification('Successfully Checked Out');
}

function startTimeTracking() {
    if (timeInterval) clearInterval(timeInterval);
    timeInterval = setInterval(() => {
        if (isCheckedIn && checkInTime) updateTimeDisplay();
    }, 1000);
    updateTimeDisplay();
}

function stopTimeTracking() {
    if (timeInterval) {
        clearInterval(timeInterval);
        timeInterval = null;
    }
}

function updateTimeDisplay() {
    if (!isCheckedIn || !checkInTime) return;
    const timeValue = document.getElementById('checkinTimeValue');
    if (!timeValue) return;
    const checkInDate = new Date(checkInTime);
    const hours12 = checkInDate.getHours() % 12 || 12;
    const minutes12 = checkInDate.getMinutes().toString().padStart(2, '0');
    const ampm = checkInDate.getHours() >= 12 ? 'PM' : 'AM';
    timeValue.textContent = `${hours12}:${minutes12} ${ampm}`;
}

function showNotification(message) {
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

// Setup event listeners
function setupEventListeners() {
    // Sub-tabs
    document.querySelectorAll('.subtab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.subtab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            activeSubtab = this.dataset.subtab;
            // Handle subtab switching (for future implementation)
            console.log(`Switched to ${activeSubtab} subtab`);
        });
    });

    // Search functionality
    document.getElementById('searchBar').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        filterTimeoff(searchTerm);
    });

    // NEW button
    document.getElementById('newBtn').addEventListener('click', function() {
        // For admin, this could open a modal to create allocation or view details
        alert('NEW functionality (to be implemented for Allocation)');
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

// Filter timeoff based on search term
function filterTimeoff(searchTerm) {
    if (searchTerm === '') {
        filteredTimeoff = [...timeoffData];
    } else {
        filteredTimeoff = timeoffData.filter(record => 
            record.name.toLowerCase().includes(searchTerm) ||
            record.type.toLowerCase().includes(searchTerm) ||
            record.status.toLowerCase().includes(searchTerm)
        );
    }
    renderTimeoffTable();
}

// Render timeoff table
function renderTimeoffTable() {
    const tbody = document.getElementById('timeoffTableBody');
    tbody.innerHTML = '';

    if (filteredTimeoff.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <div class="empty-state-text">No time off requests found</div>
                </td>
            </tr>
        `;
        return;
    }

    filteredTimeoff.forEach(record => {
        const row = document.createElement('tr');
        const startDate = formatDate(record.startDate);
        const endDate = formatDate(record.endDate);
        
        row.innerHTML = `
            <td>${record.name}</td>
            <td>${startDate}</td>
            <td>${endDate}</td>
            <td>${record.type}</td>
            <td>
                <div class="status-actions">
                    ${record.status === 'pending' ? `
                        <button class="status-btn reject" onclick="handleReject(${record.id})" title="Reject">✕</button>
                        <button class="status-btn approve" onclick="handleApprove(${record.id})" title="Approve">✓</button>
                    ` : `
                        <span class="status-badge ${record.status}">${record.status.charAt(0).toUpperCase() + record.status.slice(1)}</span>
                    `}
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Format date as DD/MM/YYYY
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Handle reject action
function handleReject(id) {
    if (confirm('Are you sure you want to reject this time off request?')) {
        const record = timeoffData.find(r => r.id === id);
        if (record) {
            record.status = 'rejected';
            filterTimeoff(document.getElementById('searchBar').value.toLowerCase().trim());
            showNotification('Time off request rejected');
        }
    }
}

// Handle approve action
function handleApprove(id) {
    if (confirm('Are you sure you want to approve this time off request?')) {
        const record = timeoffData.find(r => r.id === id);
        if (record) {
            record.status = 'approved';
            filterTimeoff(document.getElementById('searchBar').value.toLowerCase().trim());
            showNotification('Time off request approved');
        }
    }
}

