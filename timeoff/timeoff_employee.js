// Sample time off data for employee view
const employeeTimeoffData = [
    {
        id: 1,
        name: 'Employee Name',
        startDate: '2025-10-28',
        endDate: '2025-10-28',
        type: 'Paid time Off',
        status: 'approved'
    },
    {
        id: 2,
        name: 'Employee Name',
        startDate: '2025-11-01',
        endDate: '2025-11-03',
        type: 'Sick Leave',
        status: 'pending'
    }
];

let filteredTimeoff = [...employeeTimeoffData];

// Check-in/Check-out state management
let isCheckedIn = false;
let checkInTime = null;
let timeInterval = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeCheckInIndicator();
    renderTimeoffTable();
    setupEventListeners();
    setupModal();
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
    // NEW Request button
    const newRequestBtn = document.getElementById('newRequestBtn');
    if (newRequestBtn) {
        newRequestBtn.addEventListener('click', function() {
            if (typeof openTimeoffModal === 'function') {
                openTimeoffModal();
            }
        });
    }
    // Search functionality (if needed in future)
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase().trim();
            filterTimeoff(searchTerm);
        });
    }

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

// Setup modal
function setupModal() {
    const modal = document.getElementById('timeoffModal');
    const closeModal = document.getElementById('closeModal');
    const discardBtn = document.getElementById('discardBtn');
    const form = document.getElementById('timeoffRequestForm');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const allocationInput = document.getElementById('allocation');
    const timeoffTypeSelect = document.getElementById('timeoffType');

    // Calculate allocation when dates change
    function calculateAllocation() {
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);
        
        if (startDate && endDate && endDate >= startDate) {
            const diffTime = endDate - startDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            allocationInput.value = `${diffDays.toFixed(2)} Days`;
        } else {
            allocationInput.value = '';
        }
    }

    startDateInput.addEventListener('change', calculateAllocation);
    endDateInput.addEventListener('change', calculateAllocation);

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    startDateInput.setAttribute('min', today);
    endDateInput.setAttribute('min', today);

    // Update end date min when start date changes
    startDateInput.addEventListener('change', function() {
        if (this.value) {
            endDateInput.setAttribute('min', this.value);
        }
    });

    // Open modal (can be triggered by a button - to be added)
    window.openTimeoffModal = function() {
        modal.classList.add('show');
        // Reset form
        form.reset();
        allocationInput.value = '';
        startDateInput.setAttribute('min', today);
        endDateInput.setAttribute('min', today);
    };

    // Close modal
    function closeModalFunc() {
        modal.classList.remove('show');
        form.reset();
        allocationInput.value = '';
    }

    closeModal.addEventListener('click', closeModalFunc);
    discardBtn.addEventListener('click', closeModalFunc);

    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModalFunc();
        }
    });

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            employee: document.getElementById('employeeName').value,
            type: timeoffTypeSelect.value,
            startDate: startDateInput.value,
            endDate: endDateInput.value,
            allocation: allocationInput.value,
            attachment: document.getElementById('attachment').files[0]
        };

        // Here you would typically send data to server
        console.log('Time off request submitted:', formData);
        showNotification('Time off request submitted successfully');
        closeModalFunc();
        
        // Add to table (for demo purposes)
        const newRequest = {
            id: employeeTimeoffData.length + 1,
            name: formData.employee,
            startDate: formData.startDate,
            endDate: formData.endDate,
            type: timeoffTypeSelect.options[timeoffTypeSelect.selectedIndex].text,
            status: 'pending'
        };
        employeeTimeoffData.unshift(newRequest);
        filterTimeoff('');
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeModalFunc();
        }
    });
}

// Filter timeoff based on search term
function filterTimeoff(searchTerm) {
    if (searchTerm === '') {
        filteredTimeoff = [...employeeTimeoffData];
    } else {
        filteredTimeoff = employeeTimeoffData.filter(record => 
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
                <span class="status-badge ${record.status}">${record.status.charAt(0).toUpperCase() + record.status.slice(1)}</span>
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

