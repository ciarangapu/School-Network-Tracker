
class QuestionManager {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
            this.resetDisplay(); // Hide all sections initially
        });
    }

    setupEventListeners() {
        document.getElementById('toggleQuestion').addEventListener('click', () => {
            const questionsContainer = document.getElementById('sama');
            if (questionsContainer.style.display === "none" || questionsContainer.style.display === "") {
                questionsContainer.style.display = "block"; // Show questions
            } else {
                questionsContainer.style.display = "none"; // Hide questions
            }
        });
    }

    // resetDisplay() {
    //     const question = document.getElementById('sama');
    //     if (question) {
    //         question.style.display = 'none'; // Hide all containers initially
    //     }
    // }

    // toggleQuestion() {
    //     const question = document.getElementById('sama');
    //     if (question) {
    //         // Toggle the display property
    //         if (question.style.display === 'block') {
    //             question.style.display = 'none'; // Hide the cards
    //         } else {
    //             question.style.display = 'block'; // Show the cards
    //         }
    //     }
    // }
}

// Export the class
export default QuestionManager;