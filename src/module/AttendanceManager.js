class AttendanceManager {
    constructor() {
        this.init();
        this.selectedDate = null;
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
            this.resetDisplay();
            this.generateCalendar();
            this.initializeTimeDisplay(); // Initialize time display
        });
    }

    setupEventListeners() {
        document.getElementById('toggleAttendance').addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleAttendanceSection(); 
        });

        document.getElementById('toggleDaily').addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleElements('daily');
        });

        document.getElementById('toggleWeekly').addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleElements('weekly');
        });

        document.getElementById('toggleMonthly').addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleElements('monthly');
        });

        document.getElementById('export-pdf').onclick = () => this.exportReport('pdf');
        document.getElementById('export-email').onclick = () => this.exportReport('email');
        document.getElementById('export-excel').onclick = () => this.exportReport('excel');
    }

    resetDisplay() {
        const sections = ['attendance', 'data', 'daily', 'weekly', 'monthly', 'mondayNames'];
        sections.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.style.display = "none"; 
            }
        });
    }

    toggleElements(id) {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = element.style.display === "block" ? "none" : "block"; 
        }
    }

    toggleAttendanceSection() {
        const attendance = document.getElementById('attendance');
        const calendar = document.getElementById('same');

        if (attendance) {
            attendance.style.display = attendance.style.display === "block" ? "none" : "block"; 
            if (calendar) {
                calendar.style.display = attendance.style.display === "block" ? "block" : "none"; 
            }
        }
    }

    closeOtherSections(sectionIds) {
        sectionIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.style.display = "none"; 
            }
        });
    }

    hideCalendar() {
        const calendar = document.getElementById('same');
        if (calendar) {
            calendar.style.display = "none"; 
        }
    }

    exportReport(type) {
        switch (type) {
            case 'pdf':
                alert("Exporting as PDF...");
                break;
            case 'email':
                alert("Emailing report...");
                break;
            case 'excel':
                alert("Exporting as Excel...");
                break;
            default:
                console.error("Unknown export type");
        }
    }

    initializeTimeDisplay() {
        const myTime = document.getElementById('myTime');
        const myDate = document.getElementById('myDate');

        function displayTime(date) {
            const options = {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            };
            return date.toLocaleString('en-US', options);
        }

        if (myDate) {
            setInterval(() => {
                const d = new Date();
                myDate.innerHTML = displayTime(d);
            }, 1000);
        }
    }
}

export default AttendanceManager;