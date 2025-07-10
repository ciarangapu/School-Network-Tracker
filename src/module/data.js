// AttendanceManager.js
class DataManager {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
            this.resetDisplay();  
        });
    }

    setupEventListeners() {
        document.getElementById('toggleData').addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleElements('data');
        });

        document.getElementById('toggleDail').addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleElements('dail');
        });

    }

    // resetDisplay() {
    //     // This function ensures all sections are hidden
    //     const sections = [,'data', 'daily',];
    //     sections.forEach(id => {
    //         const element = document.getElementById(id);
    //         if (element) {
    //             element.style.display = "none"; // Hide all sections
    //         }
    //     });
    // }

    toggleElements(id) {
        const element = document.getElementById(id);
        element.style.display = element.style.display === "block" ? "none" : "block";
    }
}

//  // Step 1: Define the HTML Elements
//  const toggleHome = document.getElementById('toggleHome');
//  const toggleQuestion = document.getElementById('toggleQuestion');
//  const toggleAttendance = document.getElementById('toggleAttendance');
//  const toggleMonitor = document.getElementById('toggleMonitor');

//  const dashboardContent = document.getElementById('dashboardContent');
//  const technicalQContent = document.getElementById('technicalQContent');
//  const attendanceContent = document.getElementById('attendanceContent');
//  const dataContent = document.getElementById('dataContent');

//  // Step 2: Set Up Event Listeners
//  toggleHome.addEventListener('click', function(event) {
//      event.preventDefault(); // Prevent default anchor behavior
//      showContent(homeContent);
//  });

//  technicalQLink.addEventListener('click', function(event) {
//      event.preventDefault();
//      showContent(technicalQContent);
//  });

//  attendanceLink.addEventListener('click', function(event) {
//      event.preventDefault();
//      showContent(attendanceContent);
//  });

//  dataLink.addEventListener('click', function(event) {
//      event.preventDefault();
//      showContent(dataContent);
//  });

//  // Step 3: Show/Hide Logic
//  function showContent(contentToShow) {
//      // Hide all content sections
//      dashboardContent.classList.add('hidden');
//      technicalQContent.classList.add('hidden');
//      attendanceContent.classList.add('hidden');
//      dataContent.classList.add('hidden');

//      // Show the selected content section
//      contentToShow.classList.remove('hidden');
//  }


export default DataManager;