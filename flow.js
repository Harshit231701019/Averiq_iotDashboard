/**
 * Shared script for onboarding flow
 */

let selectedValue = null;

// Handle card selection
function selectOption(element, key, value) {
    // Reset all cards in the grid
    const gridId = key === 'language' ? 'language-grid' : 'industry-grid';
    const grid = document.getElementById(gridId);
    
    // Remove active styling from all buttons
    const buttons = grid.querySelectorAll('button');
    buttons.forEach(btn => {
        btn.classList.remove('border-primary/50', 'bg-slate-800/80', 'scale-[1.02]', 'ring-1', 'ring-primary/20');
        btn.classList.add('border-slate-700/50', 'bg-card/50');
        
        // Hide checkmark
        const check = btn.querySelector('.check-icon');
        if(check) check.classList.add('opacity-0');
    });

    // Add active styling to clicked button
    element.classList.remove('border-slate-700/50', 'bg-card/50');
    element.classList.add('border-primary/50', 'bg-slate-800/80', 'scale-[1.02]', 'ring-1', 'ring-primary/20');
    
    // Show checkmark
    const actCheck = element.querySelector('.check-icon');
    if(actCheck) actCheck.classList.remove('opacity-0');

    // Save selection temporarily
    selectedValue = value;

    // Enable continue button
    const continueBtn = document.getElementById('continue-btn');
    if(continueBtn) {
        continueBtn.disabled = false;
        continueBtn.className = "px-12 py-4 bg-primary text-white font-black tracking-widest rounded-xl transition-all duration-500 hover:scale-110 hover:shadow-[0_0_40px_rgba(59,130,246,0.4)] border border-blue-400/30 cursor-pointer";
    }

    // Save to localStorage immediately
    localStorage.setItem(`iot_${key}`, value);
}

// Navigate to next page with a luxury push transition
function goToNext(url) {
    if(selectedValue) {
        const body = document.body;
        body.classList.remove('animate-push-in', 'animate-fade-in-up');
        body.classList.add('animate-push-out');
        
        setTimeout(() => {
            window.location.href = url;
        }, 700);
    }
}

// Handle Login Simulation
function handleLogin(e) {
    e.preventDefault();
    
    const btn = document.getElementById('login-btn');
    const text = document.getElementById('btn-text');
    const spinner = document.getElementById('btn-spinner');

    // UI state to loading
    btn.disabled = true;
    btn.classList.add('opacity-80', 'cursor-not-allowed');
    text.classList.add('hidden');
    spinner.classList.remove('hidden');

    // Simulate network delay
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1500); // 1.5 seconds delay
}

// Initialize Dashboard text if accessible
document.addEventListener('DOMContentLoaded', () => {
    // If we are on the dashboard, grab settings from localStorage
    const savedIndustry = localStorage.getItem('iot_industry');
    if(savedIndustry) {
        const indSelect = document.getElementById('industry-select-nav');
        if(indSelect) {
            indSelect.value = savedIndustry;
        }
    }
});
