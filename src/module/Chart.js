// export default class AttendanceDashboard {
//     constructor() {
//         // Sample student data (replace with actual modem connection data)
//         this.students = [
//             { id: "S001", connected: true },
//             { id: "S002", connected: false },
//             { id: "S003", connected: true },
//             { id: "S004", connected: false },
//             { id: "S005", connected: true }
//         ];

//         // Sample weekly attendance data (replace with actual data)
//         this.weeklyData = {
//             monday: { present: 3, absent: 2 },
//             tuesday: { present: 4, absent: 1 },
//             wednesday: { present: 2, absent: 3 },
//             thursday: { present: 5, absent: 0 },
//             friday: { present: 3, absent: 2 }
//         };

//         // DOM elements
//         this.chartCanvas = document.getElementById('attendanceChart');
//         this.tableBody = document.getElementById('attendance-data');
//         this.selectedDateElement = document.getElementById('selected-date');
//         this.manualScreenshotBtn = document.getElementById('manual-screenshot');

//         // Initialize Chart.js
//         this.chart = new Chart(this.chartCanvas.getContext('2d'), {
//             type: 'line',
//             data: {
//                 labels: ['Attendance Status'],
//                 datasets: [
//                     {
//                         label: 'Present',
//                         data: [0],
//                         borderColor: '#4CAF50',
//                         backgroundColor: '#4CAF50',
//                         fill: false,
//                         pointRadius: 5,
//                         pointBackgroundColor: '#4CAF50'
//                     },
//                     {
//                         label: 'Absent',
//                         data: [0],
//                         borderColor: '#FF5733',
//                         backgroundColor: '#FF5733',
//                         fill: false,
//                         pointRadius: 5,
//                         pointBackgroundColor: '#FF5733'
//                     }
//                 ]
//             },
//             options: {
//                 scales: {
//                     y: {
//                         beginAtZero: true,
//                         title: { display: true, text: 'Number of Students' }
//                     },
//                     x: { title: { display: true, text: 'Status' } }
//                 },
//                 plugins: { title: { display: true, text: 'Daily Attendance Overview' } }
//             }
//         });
//     }

//     init() {
//         // Setup event listeners
//         this.manualScreenshotBtn.addEventListener('click', () => this.takeScreenshot());
//         this.setupDayHandlers();

//         // Initial update and schedule
//         this.updateAttendance(new Date());
//         this.scheduleScreenshots();
//     }

//     updateAttendance(selectedDate, dayId = null) {
//         const present = this.students.filter(s => s.connected).length;
//         const absent = this.students.length - present;

//         // Update chart
//         this.chart.data.datasets[0].data = [present];
//         this.chart.data.datasets[1].data = [absent];
//         this.chart.update();

//         // Update table
//         this.tableBody.innerHTML = '';
//         this.students.forEach(student => {
//             const row = document.createElement('tr');
//             row.innerHTML = `
//                 <td>${student.id}</td>
//                 <td>${student.connected ? 'Present' : 'Absent'}</td>
//             `;
//             this.tableBody.appendChild(row);
//         });

//         // Update selected date display
//         this.selectedDateElement.textContent = `Attendance for ${selectedDate.toDateString()}`;

//         // Update daily data
//         if (dayId && this.weeklyData[dayId]) {
//             const dayElement = document.getElementById(dayId);
//             dayElement.querySelector('.attendance-data').textContent = `Present: ${this.weeklyData[dayId].present}, Absent: ${this.weeklyData[dayId].absent}`;
//         } else {
//             // Update all days with weekly data
//             ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
//                 const dayElement = document.getElementById(day);
//                 if (this.weeklyData[day]) {
//                     dayElement.querySelector('.attendance-data').textContent = `Present: ${this.weeklyData[day].present}, Absent: ${this.weeklyData[day].absent}`;
//                 }
//             });
//         }
//     }

//     takeScreenshot() {
//         html2canvas(document.body).then(canvas => {
//             const link = document.createElement('a');
//             const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
//             link.download = `attendance-screenshot-${timestamp}.png`;
//             link.href = canvas.toDataURL('image/png');
//             link.click();
//         });
//     }

//     scheduleScreenshots() {
//         const now = new Date();
//         const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0);
//         const endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 0, 0); // 4:00 PM
//         const interval = (endTime - startTime) / 3; // 2 hours 20 minutes in milliseconds

//         const times = [
//             startTime,
//             new Date(startTime.getTime() + interval),
//             new Date(startTime.getTime() + 2 * interval)
//         ];

//         times.forEach(time => {
//             if (now < time) {
//                 const delay = time - now;
//                 setTimeout(() => {
//                     this.updateAttendance(new Date());
//                     this.takeScreenshot();
//                 }, delay);
//             }
//         });

//         // Schedule for next day
//         setTimeout(() => this.scheduleScreenshots(), 24 * 60 * 60 * 1000);
//     }

//     setupDayHandlers() {
//         ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
//             const dayElement = document.getElementById(day);
//             dayElement.addEventListener('click', () => {
//                 this.updateAttendance(new Date(), day);
//             });
//         });
//     }
// }









 class AttendanceDashboard {
    constructor() {
        // Sample student data
        this.students = [
            { id: "S001", connected: true },
            { id: "S002", connected: false },
            { id: "S003", connected: true },
            { id: "S004", connected: false },
            { id: "S005", connected: true }
        ];

        // Sample weekly attendance data
        this.weeklyData = {
            monday: { present: 3, absent: 2 },
            tuesday: { present: 4, absent: 1 },
            wednesday: { present: 2, absent: 3 },
            thursday: { present: 5, absent: 0 },
            friday: { present: 3, absent: 2 }
        };

        // DOM elements
        this.chartCanvas = document.getElementById('attendanceChart');
        this.tableBody = document.getElementById('attendance-data');
        this.selectedDateElement = document.getElementById('selected-date');
        this.manualScreenshotBtn = document.getElementById('manual-screenshot');

        // Initialize Chart.js
        this.chart = new Chart(this.chartCanvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Attendance Status'],
                datasets: [
                    {
                        label: 'Present',
                        data: [0],
                        borderColor: '#4CAF50',
                        backgroundColor: '#4CAF50',
                        fill: false,
                        pointRadius: 5,
                        pointBackgroundColor: '#4CAF50'
                    },
                    {
                        label: 'Absent',
                        data: [0],
                        borderColor: '#FF5733',
                        backgroundColor: '#FF5733',
                        fill: false,
                        pointRadius: 5,
                        pointBackgroundColor: '#FF57333'
                    }
                ]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Number of Students' }
                    },
                    x: { title: { display: true, text: 'Status' } }
                },
                plugins: { title: { display: true, text: 'Daily Attendance Overview' } }
            }
        });

        // Initialize event listeners
        this.init();
    }

    init() {
        this.manualScreenshotBtn.addEventListener('click', () => this.takeScreenshot());
        document.getElementById('toggleData').addEventListener('click', () => this.showDataChart());
        this.setupDayHandlers();
        this.updateAttendance(new Date());
    }

    showDataChart() {
        const statusContainer = document.getElementById('some');
        statusContainer.style.display = 'block'; // Show the status container
        this.updateAttendance(new Date()); // Update attendance data
    }

    updateAttendance(selectedDate) {
        const present = this.students.filter(s => s.connected).length;
        const absent = this.students.length - present;

        // Update chart
        this.chart.data.datasets[0].data = [present];
        this.chart.data.datasets[1].data = [absent];
        this.chart.update();

        // Update table
        this.tableBody.innerHTML = '';
        this.students.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.id}</td>
                <td>${student.connected ? 'Present' : 'Absent'}</td>
            `;
            this.tableBody.appendChild(row);
        });

        // Update selected date display
        this.selectedDateElement.textContent = `Attendance for ${selectedDate.toDateString()}`;
    }

    takeScreenshot() {
        html2canvas(document.body).then(canvas => {
            const link = document.createElement('a');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            link.download = `attendance-screenshot-${timestamp}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    }

    setupDayHandlers() {
        ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
            const dayElement = document.getElementById(day);
            dayElement.addEventListener('click', () => {
                this.updateAttendance(new Date(), day);
            });
        });
    }
}

export default AttendanceDashboard