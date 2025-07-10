class AttendanceSystem {
    constructor() {
        this.MAC_ADDRESS_REGEX = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
        this.EMAIL_REGEX = /^[a-z]+(@gmail\.com|[0-9]+@gmail\.com)$/; // Allows name@gmail.com or name123@gmail.com
        this.initializeLocalStorage();
        this.setupEventListeners();
    }

    // Validate MAC address
    validateMacAddress(mac) {
        return this.MAC_ADDRESS_REGEX.test(mac);
    }

    // Validate email
    validateEmail(email) {
        return this.EMAIL_REGEX.test(email);
    }

    // Initialize localStorage with default admin user if not present
    initializeLocalStorage() {
        if (!localStorage.getItem('users')) {
            localStorage.setItem(
                'users',
                JSON.stringify([
                    {
                        id: 1,
                        name: '#admin',
                        mac: '00:00:00:00:00:00',
                        email: 'admin1@gmail.com',
                        role: 'admin',
                    },
                ])
            );
        }
        // Initialize last refresh if not present
        if (!localStorage.getItem('usersListLastRefresh')) {
            localStorage.setItem('usersListLastRefresh', Date.now().toString());
        }
    }

    // Restrict access to dashboards
    restrictDashboardAccess() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const currentPage = window.location.pathname.split('/').pop();

        if (currentPage === 'userdashboard.html' && (!currentUser.id || currentUser.role !== 'student')) {
            alert('Please log in as a student or register to access the User Dashboard.');
            window.location.href = 'index.html';
            return;
        }
        if (currentPage === 'dashboard.html' && (!currentUser.id || currentUser.role !== 'admin')) {
            alert('Please log in as an admin to access the Admin Dashboard.');
            window.location.href = 'index.html';
            return;
        }
    }

    // Check if 24 hours have passed since last refresh
    shouldRefreshUsersList() {
        const lastRefresh = localStorage.getItem('usersListLastRefresh');
        const now = Date.now();
        const oneDayInMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        if (!lastRefresh) {
            localStorage.setItem('usersListLastRefresh', now.toString());
            return true;
        }

        const timeSinceLastRefresh = now - parseInt(lastRefresh, 10);
        if (timeSinceLastRefresh >= oneDayInMs) {
            localStorage.setItem('usersListLastRefresh', now.toString());
            return true;
        }

        return false;
    }

    // Handle users list display
    handleUsersList() {
        const usersList = document.getElementById('users-list');
        if (!usersList) return;

        // Clear existing content if refresh is needed
        if (this.shouldRefreshUsersList()) {
            usersList.innerHTML = '';
        }

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const successMessage = localStorage.getItem('successMessage');

        if (successMessage) {
            const messageDiv = document.createElement('div');
            messageDiv.textContent = successMessage;
            messageDiv.style.color = 'green';
            messageDiv.style.marginBottom = '20px';
            usersList.appendChild(messageDiv);
            localStorage.removeItem('successMessage');
        }

        if (users.length === 0) {
            usersList.innerHTML += '<p>No students registered.</p>';
        } else {
            const list = document.createElement('ul');
            users.forEach(user => {
                const li = document.createElement('li');
                li.textContent = `${user.name} (${user.role}) - ${user.mac} - ${user.email || 'N/A'}`;
                list.appendChild(li);
            });
            usersList.appendChild(list);
        }
    }

    // Handle admin login form
    handleAdminLogin() {
        const adminLoginForm = document.getElementById('admin-login-form');
        if (!adminLoginForm) return;

        adminLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value.trim();
            const mac = document.getElementById('login-mac').value.trim();
            const remember = document.getElementById('remember')?.checked || false;

            if (!this.validateMacAddress(mac)) {
                alert('Invalid MAC address format. Use XX:XX:XX:XX:XX:XX format.');
                return;
            }

            if (name.toLowerCase() !== '#admin') {
                alert('Admin name must be "#admin".');
                return;
            }

            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(
                u => u.name.toLowerCase() === name.toLowerCase() && u.mac.toLowerCase() === mac.toLowerCase() && u.role === 'admin'
            );

            if (user) {
                if (remember) {
                    localStorage.setItem('currentUser', JSON.stringify({ id: user.id, name: user.name, mac: user.mac, role: user.role }));
                }
                alert('Admin login successful!');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                alert('Invalid admin credentials.');
            }
        });
    }

    // Handle student login form
    handleStudentLogin() {
        const loginForm = document.getElementById('login-form');
        if (!loginForm || document.getElementById('login-email')) return;

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value.trim();
            const mac = document.getElementById('login-mac').value.trim();
            const remember = document.getElementById('remember')?.checked || false;

            if (!this.validateMacAddress(mac)) {
                alert('Invalid MAC address format. Use XX:XX:XX:XX:XX:XX format.');
                return;
            }

            if (name.toLowerCase() === '#admin') {
                alert('Use the Admin Login page for #admin.');
                window.location.href = 'admin.html';
                return;
            }

            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(
                u => u.name.toLowerCase() === name.toLowerCase() && u.mac.toLowerCase() === mac.toLowerCase() && u.role === 'student'
            );

            if (user) {
                if (remember) {
                    localStorage.setItem('currentUser', JSON.stringify({ id: user.id, name: user.name, mac: user.mac, role: user.role }));
                }
                localStorage.setItem('successMessage', `Successfully logged in as ${user.name}!`);
                alert('Login successful! Your information has been verified.');
                setTimeout(() => {
                    window.location.href = 'userdashboard.html';
                }, 1000);
            } else {
                alert('Invalid name or MAC address.');
            }
        });
    }

    // Handle registration form
    handleRegistration() {
        const registerForm = document.getElementById('login-form');
        if (!registerForm || !document.getElementById('login-email')) return;

        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value.trim();
            const mac = document.getElementById('login-mac').value.trim();
            const email = document.getElementById('login-email').value.trim();
            const remember = document.getElementById('remember')?.checked || false;

            if (!this.validateMacAddress(mac)) {
                alert('Invalid MAC address format. Use XX:XX:XX:XX:XX:XX format.');
                return;
            }

            if (!this.validateEmail(email)) {
                alert('Invalid email format. Use name@gmail.com or name123@gmail.com format (e.g., john@gmail.com or john123@gmail.com).');
                return;
            }

            if (name.toLowerCase() === '#admin') {
                alert('The name "#admin" is reserved for admin users.');
                return;
            }

            const users = JSON.parse(localStorage.getItem('users') || '[]');

            if (users.some(u => u.name.toLowerCase() === name.toLowerCase())) {
                alert('Name already registered.');
                return;
            }
            if (users.some(u => u.mac.toLowerCase() === mac.toLowerCase())) {
                alert('MAC address already registered.');
                return;
            }
            if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
                alert('Email already registered.');
                return;
            }

            const maxId = users.length > 0 ? Math.max(...users.map(u => u.id)) : 0;
            const newUser = { id: maxId + 1, name, mac, email, role: 'student' };
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));

            if (remember) {
                localStorage.setItem('currentUser', JSON.stringify({ id: newUser.id, name, mac, role: newUser.role }));
            }

            localStorage.setItem('successMessage', `Successfully registered as ${name}!`);
            alert('Registration successful! Your information has been sent to the database.');
            setTimeout(() => {
                window.location.href = 'userdashboard.html';
            }, 1000);
        });
    }

    // Handle MAC address update form
    handleMacUpdate() {
        const updateForm = document.getElementById('update-form');
        if (!updateForm) return;

        updateForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value.trim();
            const oldMac = document.getElementById('old-mac').value.trim();
            const newMac = document.getElementById('new-mac').value.trim();

            if (!this.validateMacAddress(oldMac) || !this.validateMacAddress(newMac)) {
                alert('Invalid MAC address format. Use XX:XX:XX:XX:XX:XX format.');
                return;
            }

            if (name.toLowerCase() === '#admin') {
                alert('Admin MAC address cannot be updated here.');
                return;
            }

            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

            const userIndex = users.findIndex(
                u => u.name.toLowerCase() === name.toLowerCase() && u.mac.toLowerCase() === oldMac.toLowerCase()
            );

            if (userIndex === -1) {
                alert('Current MAC address or name not found.');
                return;
            }

            if (users.some(u => u.mac.toLowerCase() === newMac.toLowerCase())) {
                alert('New MAC address already registered.');
                return;
            }

            users[userIndex].mac = newMac;
            localStorage.setItem('users', JSON.stringify(users));
            if (currentUser.name.toLowerCase() === users[userIndex].name.toLowerCase()) {
                localStorage.setItem('currentUser', JSON.stringify({
                    id: users[userIndex].id,
                    name: users[userIndex].name,
                    mac: newMac,
                    role: users[userIndex].role,
                }));
            }

            alert('MAC address updated successfully!');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        });
    }

    // Setup all event listeners
    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.restrictDashboardAccess();
            this.handleUsersList();
            this.handleAdminLogin();
            this.handleStudentLogin();
            this.handleRegistration();
            this.handleMacUpdate();
        });
    }
}

export default AttendanceSystem;