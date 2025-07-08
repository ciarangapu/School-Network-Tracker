import { setupToggles, setupMondayNames } from '../module/dom.js';
import {
    generateCalendar,
    prevPeriod,
    nextPeriod,
    showMonthlyView,
    showWeeklyView
} from '../module/calendar.js';
import "../styles/admin.css";
import "../styles/style_copy.css";
import "../styles/style.css";
import "../styles/style2.css";


document.addEventListener('DOMContentLoaded', () => {
    setupToggles();
    setupMondayNames();
    generateCalendar();

    document.getElementById('weekly-view-button').addEventListener('click', showWeeklyView);
    document.getElementById('monthly-view-button').addEventListener('click', showMonthlyView);
    document.getElementById('prev-button').addEventListener('click', prevPeriod);
    document.getElementById('next-button').addEventListener('click', nextPeriod);
});

// // src/js/index.js
// import DashboardManager from './dashboardManager.js';
// import '../../styles/style.css'; // Adjust path to point to styles folder

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    if (path.includes('index.html')) {
        console.log('Dashboard initialized');
        new DashboardManager(); // Initialize dashboard only for index.html
    } else if (path.includes('admin.html')) {
        console.log('Admin page loaded');
    } else if (path.includes('indext.html')) {
        console.log('Indext page loaded');
    } else if (path.includes('indext2.html')) {
        console.log('Indext2 page loaded');
    } else if (path.includes('update.html')) {
        console.log('Update page loaded');
    } else if (path.includes('userdashboard.html')) {
        console.log('User Dashboard page loaded');
    } else if (path.includes('users.html')) {
        console.log('Users page loaded');
    }
});
