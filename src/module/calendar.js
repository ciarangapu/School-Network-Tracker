const attendanceData = {
    '2025-06-27': [
        { student_id: 'ST001', status: 'Present' },
        { student_id: 'ST002', status: 'Absent' }
    ],
    '2025-06-26': [
        { student_id: 'ST001', status: 'Late' },
        { student_id: 'ST002', status: 'Present' }
    ]
};

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let viewMode = 'monthly'; // Default view
let selectedDate = null;

export function generateCalendar() {
    const calendar = document.getElementById('calendar');
    const monthYear = document.getElementById('month-year');
    if (!calendar || !monthYear) return;
    calendar.innerHTML = '';

    monthYear.textContent = viewMode === 'monthly'
        ? `${new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })} ${currentYear}`
        : `Week of ${currentDate.toLocaleDateString()}`;

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    daysOfWeek.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = 'day header';
        dayElement.textContent = day;
        calendar.appendChild(dayElement);
    });

    if (viewMode === 'monthly') {
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'day';
            calendar.appendChild(emptyDay);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'day';
            dayElement.textContent = i;
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            dayElement.onclick = () => selectDate(dateStr);
            if (attendanceData[dateStr]) {
                dayElement.classList.add('has-data');
            }
            if (selectedDate === dateStr) {
                dayElement.classList.add('selected');
            }
            calendar.appendChild(dayElement);
        }
    } else {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            const dateStr = day.toISOString().split('T')[0];
            const dayElement = document.createElement('div');
            dayElement.className = 'day';
            dayElement.textContent = `${day.getDate()} ${day.toLocaleString('default', { month: 'short' })}`;
            dayElement.onclick = () => selectDate(dateStr);
            if (attendanceData[dateStr]) {
                dayElement.classList.add('has-data');
            }
            if (selectedDate === dateStr) {
                dayElement.classList.add('selected');
            }
            calendar.appendChild(dayElement);
        }
    }
}

export function prevPeriod() {
    if (viewMode === 'monthly') {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
    } else {
        currentDate.setDate(currentDate.getDate() - 7);
    }
    generateCalendar();
}

export function nextPeriod() {
    if (viewMode === 'monthly') {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
    } else {
        currentDate.setDate(currentDate.getDate() + 7);
    }
    generateCalendar();
}

export function showMonthlyView() {
    viewMode = 'monthly';
    generateCalendar();
}

export function showWeeklyView() {
    viewMode = 'weekly';
    generateCalendar();
}

export function selectDate(dateStr) {
    selectedDate = dateStr;
    const dateDisplay = document.getElementById('selected-date');
    const tableBody = document.getElementById('attendance-data');
    if (dateDisplay) dateDisplay.textContent = `Attendance for ${dateStr}`;
    if (tableBody) {
        tableBody.innerHTML = '';

        if (attendanceData[dateStr]) {
            attendanceData[dateStr].forEach(data => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${data.student_id}</td>
                    <td>${data.status}</td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            tableBody.innerHTML = '<tr><td colspan="2">No attendance data for this date.</td></tr>';
        }
    }
    generateCalendar(); // Refresh calendar to highlight selected date
}