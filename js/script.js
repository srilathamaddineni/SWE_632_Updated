const financialTips = [
    "Track your spending and stick to your budget!",
    "Save at least 20% of your income each month.",
    "Avoid impulse purchases to stay on track with your savings goals.",
    "Invest early and regularly for long-term financial security.",
    "Create an emergency fund for unexpected expenses."
];

function submitName() {
    const name = document.getElementById('userName').value;

    if (name) {
       
        localStorage.setItem('userName', name);

        
        document.getElementById('user-form').style.display = 'none';
        document.getElementById('greeting-section').style.display = 'block';

       
        document.getElementById('greeting-message').textContent = `Hello, ${name}!`;

       
        const randomTip = financialTips[Math.floor(Math.random() * financialTips.length)];
        document.getElementById('financial-tip').textContent = `Tip: ${randomTip}`;

        
        setTimeout(() => {
            window.location.href = 'home.html'; 
        }, 4000); 
    }
}
