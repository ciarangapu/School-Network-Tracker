import { setupToggles, setupMondayNames } from './module/dom.js';
import {
    generateCalendar,
    prevPeriod,
    nextPeriod,
    showMonthlyView,
    showWeeklyView
} from './module/calendar.js';

import AttendanceSystem from './bundle.js';
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