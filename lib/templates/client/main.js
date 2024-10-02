// You can add your JavaScript code here
console.log('Dywo app is running!');

// Example: Dynamically update content
document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    const paragraph = document.createElement('p');
    paragraph.textContent = 'This paragraph was added dynamically with JavaScript.';
    app.appendChild(paragraph);
});