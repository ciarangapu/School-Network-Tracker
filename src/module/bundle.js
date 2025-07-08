const MAC_ADDRESS_REGEX = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
const EMAIL_REGEX = /^[a-zA-Z]+[0-9]+@gmail\.com$/; // Regex for name(number)@gmail.com

function validateMacAddress(mac) {
    return MAC_ADDRESS_REGEX.test(mac);
}

function validateEmail(email) {
    return EMAIL_REGEX.test(email);
}

// Initialize local storage if it doesn't exist
if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([
        {
            id: 1,
            name: "Admin",
            mac: "00:00:00:00:00:00",
            email: "admin1@gmail.com", // Updated to match required format
            role: "admin"
        }
    ]));
}

// Users List Handling
if (document.getElementById('users-list')) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const usersList = document.getElementById('users-list');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const successMessage = localStorage.getItem('successMessage');

    if (successMessage) {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = successMessage;
        messageDiv.style.color = 'green';
        messageDiv.style.marginBottom = '20px';
        usersList.appendChild(messageDiv);
        localStorage.removeItem('successMessage'); // Clear message after display
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

// Admin Login Form Handling
if (document.getElementById('admin-login-form')) {
    const adminLoginForm = document.getElementById('admin-login-form');
    adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const mac = document.getElementById('login-mac').value.trim();
        const remember = document.getElementById('remember').checked;

        if (!validateMacAddress(mac)) {
            alert('Invalid MAC address format. Use XX:XX:XX:XX:XX:XX format.');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.name.toLowerCase() === name.toLowerCase() && u.mac.toLowerCase() === mac.toLowerCase() && u.role === 'admin');

        if (user) {
            if (remember) {
                localStorage.setItem('currentUser', JSON.stringify({ id: user.id, name: user.name, mac: user.mac, role: user.role }));
            }
            alert('Admin login successful!');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            alert('Invalid admin credentials or not an admin user.');
        }
    });
}

// Student Login Form Handling
if (document.getElementById('login-form') && !document.getElementById('login-email')) {
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const mac = document.getElementById('login-mac').value.trim();
        const remember = document.getElementById('remember').checked;

        if (!validateMacAddress(mac)) {
            alert('Invalid MAC address format. Use XX:XX:XX:XX:XX:XX format.');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.name.toLowerCase() === name.toLowerCase() && u.mac.toLowerCase() === mac.toLowerCase());

        if (user) {
            if (remember) {
                localStorage.setItem('currentUser', JSON.stringify({ id: user.id, name: user.name, mac: user.mac, role: user.role }));
            }
            localStorage.setItem('successMessage', `Successfully logged in as ${user.name}!`);
            alert('Login successful! Your information has been verified.');
            setTimeout(() => {
                window.location.href = 'users.html';
            }, 1000);
        } else {
            alert('Invalid name or MAC address.');
        }
    });
}

// Registration Form Handling
if (document.getElementById('login-form') && document.getElementById('login-email')) {
    const registerForm = document.getElementById('login-form');
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const mac = document.getElementById('login-mac').value.trim();
        const email = document.getElementById('login-email').value.trim();
        const remember = document.getElementById('remember').checked;

        if (!validateMacAddress(mac)) {
            alert('Invalid MAC address format. Use XX:XX:XX:XX:XX:XX format.');
            return;
        }

        if (!validateEmail(email)) {
            alert('Invalid email format. Use name(number)@gmail.com format (e.g., john123@gmail.com).');
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
            window.location.href = 'users.html';
        }, 1000);
    });
}

// Update Form Handling
if (document.getElementById('update-form')) {
    const updateForm = document.getElementById('update-form');
    updateForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const oldMac = document.getElementById('old-mac').value.trim();
        const newMac = document.getElementById('new-mac').value.trim();

        if (!validateMacAddress(oldMac) || !validateMacAddress(newMac)) {
            alert('Invalid MAC address format. Use XX:XX:XX:XX:XX:XX format.');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        const userIndex = users.findIndex(u => u.name.toLowerCase() === name.toLowerCase() && u.mac.toLowerCase() === oldMac.toLowerCase());
        
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
            localStorage.setItem('currentUser', JSON.stringify({ id: users[userIndex].id, name: users[userIndex].name, mac: newMac, role: users[userIndex].role }));
        }

        alert('MAC address updated successfully!');
        setTimeout(() => {
            window.location.href = 'indext.html';
        }, 1000);
    });
}