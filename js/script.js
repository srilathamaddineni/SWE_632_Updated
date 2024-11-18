// Array of financial tips
const financialTips = [
    "Track your spending and stick to your budget!",
    "Save at least 20% of your income each month.",
    "Avoid impulse purchases to stay on track with your savings goals.",
    "Invest early and regularly for long-term financial security.",
    "Create an emergency fund for unexpected expenses."
];

// Function to handle name submission
function submitName() {
    const name = document.getElementById('userName').value;

    if (name) {
        // Save name in localStorage
        localStorage.setItem('userName', name);

        // Hide form and show greeting
        document.getElementById('user-form').style.display = 'none';
        document.getElementById('greeting-section').style.display = 'block';

        // Display greeting and random financial tip
        document.getElementById('greeting-message').textContent = `Hello, ${name}!`;
        const randomTip = financialTips[Math.floor(Math.random() * financialTips.length)];
        document.getElementById('financial-tip').textContent = `Tip: ${randomTip}`;

        // Redirect to home page after 4 seconds
        setTimeout(() => {
            window.location.href = 'home.html'; 
        }, 4000);
    }
}

// Highlight the active navigation link
document.addEventListener('DOMContentLoaded', function () {
    const currentPath = window.location.pathname; // Get the current page path
    const navLinks = document.querySelectorAll('nav ul li a');

    navLinks.forEach(link => {
        const tooltipText = link.getAttribute('title'); // Get the tooltip text
        if (tooltipText) {
            link.setAttribute('data-tooltip', tooltipText); // Set a custom tooltip
            link.removeAttribute('title'); // Remove the browser default tooltip
        }

        // Add active class if the href matches the current path
        if (currentPath.includes(link.getAttribute('href'))) {
            link.classList.add('active'); // Highlight the current page link
        }
    });
});
