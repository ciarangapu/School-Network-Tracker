export function setupToggles() {
    const toggleElements = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = element.style.display === "block" ? "none" : "block";
        }
    };

    const ids = [
        { btn: 'toggleAttendance', target: 'attendance' },
        { btn: 'toggleDaily', target: 'daily' },
        { btn: 'toggleWeekly', target: 'weekly' },
        { btn: 'toggleMonthly', target: 'monthly' }
    ];

    ids.forEach(({ btn, target }) => {
        const el = document.getElementById(btn);
        if (el) {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                toggleElements(target);
            });
        }
    });
}

export function setupMondayNames() {
    const monday = document.getElementById('monday');
    if (monday) {
        monday.addEventListener('click', () => {
            const namesContainer = document.getElementById('mondayNames');
            if (namesContainer) {
                namesContainer.innerHTML = `
                    <p>Welcome back, User!</p>
                    <p>Your friends present on Monday:</p>
                    <p>Annabel</p>
                    <p>John</p>
                    <p>Emily</p>
                    <p>Michael</p>
                    <p>Sarah</p>
                `;
                namesContainer.style.display = namesContainer.style.display === "block" ? "none" : "block";
            }
        });
    }
}