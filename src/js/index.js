import { setupToggles, setupMondayNames } from '../module/dom.js';
import {
    generateCalendar,
    prevPeriod,
    nextPeriod,
    showMonthlyView,
    showWeeklyView
} from '../module/calendar.js';

import "../styles/landing.css";

import "../styles/admin.css";
import "../styles/style_copy.css";
import "../styles/style.css";
import "../styles/style2.css";

import AttendanceManager from "../module/AttendanceManager.js";
import DashboardManager from '../module/home.js'; 
import DataManager from "../module/data.js";
import QuestionManager from "../module/technical.js";


import AttendanceSystem from '../module/bundle.js';
new AttendanceSystem();

document.addEventListener('DOMContentLoaded', () => {
    setupToggles();
    setupMondayNames();
    generateCalendar();

    document.getElementById('weekly-view-button').addEventListener('click', showWeeklyView);
    document.getElementById('monthly-view-button').addEventListener('click', showMonthlyView);
    document.getElementById('prev-button').addEventListener('click', prevPeriod);
    document.getElementById('next-button').addEventListener('click', nextPeriod);
});



const dashboardManager = new DashboardManager();
const questionManager = new QuestionManager();
// const attendanceDashboard = new AttendanceDashboard();


const dataManager = new DataManager();
DataManager.prototype.someMethod = function() {
    console.log('Method called successfully!');
};

const attendanceManager = new AttendanceManager();
AttendanceManager.prototype.someMethod = function() {
    console.log('Method called successfully!');
};

// // main.js
// document.addEventListener('DOMContentLoaded', () => {
//     generateCalendar(); // Initial calendar generation
//     document.getElementById('prev-button').onclick = prevPeriod;
//     document.getElementById('next-button').onclick = nextPeriod;
//     document.getElementById('monthly-view-button').onclick = showMonthlyView;
//     document.getElementById('weekly-view-button').onclick = showWeeklyView;
// });