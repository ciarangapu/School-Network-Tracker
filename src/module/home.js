// class DashboardManager {
//     constructor() {
//         this.init();
//     }

//     init() {
//         document.addEventListener('DOMContentLoaded', () => {
//             this.setupEventListeners();
//             this.resetDisplay(); // Hide all sections initially
//         });
//     }

//     setupEventListeners() {
//         const toggleHomeButton = document.getElementById('toggleHome');

//         if (toggleHomeButton) {
//             toggleHomeButton.addEventListener('click', (e) => {
//                 e.preventDefault();
//                 this.toggleDashboard(); // Toggle the dashboard visibility
//             });
//         }
//     }

//     resetDisplay() {
//         const containers = document.getElementById('some');
//         if (containers) {
//             containers.style.display = 'none'; // Hide all containers initially
//         }
//     }

//     toggleDashboard() {
//         const containers = document.getElementById('some');
//         if (containers) {
//             // Toggle the display property
//             if (containers.style.display === 'block') {
//                 containers.style.display = 'none'; // Hide the cards
//             } else {
//                 containers.style.display = 'block'; // Show the cards
//             }
//         }
//     }
// }

// // Instantiate the DashboardManager
// const dashboardManager = new DashboardManager();














// DashboardManager.js

class DashboardManager {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
            // this.resetDisplay(); // Hide all sections initially
        });
    }

    setupEventListeners() {
        const toggleHomeButton = document.getElementById('toggleHome');

        if (toggleHomeButton) {
            toggleHomeButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleDashboard(); 
            });
        }
    }

    // resetDisplay() {
    //     const containers = document.getElementById('some');
    //     if (containers) {
    //         containers.style.display = 'none'; 
    //     }
    // }

    toggleDashboard() {
        const containers = document.getElementById('some');
        if (containers) {
            // Toggle the display property
            if (containers.style.display === 'block') {
                containers.style.display = 'none'; // Hide the cards
            } else {
                containers.style.display = 'block'; // Show the cards
            }
        }
    }
}

// Export the class
export default DashboardManager;