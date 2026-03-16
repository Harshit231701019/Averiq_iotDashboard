// Setup Chart.js defaults for dark theme
Chart.defaults.color = '#94a3b8'; // text-slate-400
Chart.defaults.font.family = 'inherit';
Chart.defaults.scale.grid.color = 'rgba(51, 65, 85, 0.3)'; // border-slate-700 slightly transparent
Chart.defaults.scale.grid.borderColor = 'rgba(51, 65, 85, 0.5)';

// Determine base starting state for charts based on selected industry
const currentIndustry = localStorage.getItem('iot_industry') || 'Manufacturing';
let baseTemp = 27, baseHum = 65, baseCo2 = 420;

if (currentIndustry === 'Food Industry') {
    baseTemp = 4;
    baseHum = 85;
    baseCo2 = 380;
} else if (currentIndustry === 'Agriculture') {
    baseTemp = 22;
    baseHum = 75;
    baseCo2 = 600;
} else if (currentIndustry === 'Construction') {
    baseTemp = 32;
    baseHum = 50;
    // defaults for co2
} else if (currentIndustry === 'Smart Home') {
    baseTemp = 24;
}

// Initialize data arrays with dummy initial data for smooth starting visuals
const maxDataPoints = 15;
const timeLabels = Array.from({length: maxDataPoints}, (_, i) => '');
const tempData = Array.from({length: maxDataPoints}, () => baseTemp + (Math.random()*2 - 1));
const humData = Array.from({length: maxDataPoints}, () => baseHum + (Math.random()*5 - 2.5));
const co2Data = Array.from({length: maxDataPoints}, () => baseCo2 + (Math.random()*20 - 10));

// Global Chart Instances
let tempChartInstance;
let humChartInstance;
let co2ChartInstance;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Temperature Line Chart (Smooth)
    const ctxTemp = document.getElementById('tempChart').getContext('2d');
    
    // Temperature Line Chart setup
    tempChartInstance = new Chart(ctxTemp, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [{
                label: 'Temperature (°C)',
                data: tempData,
                borderColor: '#ef4444', 
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                borderWidth: 2,
                tension: 0.4, 
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#cbd5e1',
                    borderColor: '#334155',
                    borderWidth: 1
                }
            },
            scales: {
                y: { beginAtZero: false }, // Dynamic scaling
                x: { display: false }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });

    // 2. Humidity Bar Chart
    const ctxHum = document.getElementById('humChart').getContext('2d');
    humChartInstance = new Chart(ctxHum, {
        type: 'bar',
        data: {
            labels: timeLabels,
            datasets: [{
                label: 'Humidity (%)',
                data: humData,
                backgroundColor: '#3b82f6', 
                borderRadius: 4,
                hoverBackgroundColor: '#60a5fa'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#cbd5e1',
                    borderColor: '#334155',
                    borderWidth: 1
                }
            },
            scales: {
                y: { beginAtZero: false }, // Dynamic scaling
                x: { display: false }
            }
        }
    });

    // 3. CO2 Line Chart (Sharp)
    const ctxCo2 = document.getElementById('co2Chart').getContext('2d');
    
    co2ChartInstance = new Chart(ctxCo2, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [{
                label: 'CO2 Level (ppm)',
                data: co2Data,
                borderColor: '#10b981', 
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                borderWidth: 2,
                tension: 0.2, // slight curve
                fill: true,
                pointBackgroundColor: '#10b981',
                pointRadius: 2,
                pointHoverRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#cbd5e1',
                    borderColor: '#334155',
                    borderWidth: 1
                }
            },
            scales: {
                y: { beginAtZero: false }, // Dynamic scaling
                x: { display: false }
            }
        }
    });
});

/**
 * Update charts with new values. Shifts array to keep length consistent.
 */
function updateCharts(temp, hum, co2) {
    if(!tempChartInstance || !humChartInstance || !co2ChartInstance) return;

    // Update Temp
    tempChartInstance.data.datasets[0].data.push(temp);
    tempChartInstance.data.datasets[0].data.shift();
    tempChartInstance.update();

    // Update Humidity
    humChartInstance.data.datasets[0].data.push(hum);
    humChartInstance.data.datasets[0].data.shift();
    humChartInstance.update();

    // Update CO2
    co2ChartInstance.data.datasets[0].data.push(co2);
    co2ChartInstance.data.datasets[0].data.shift();
    co2ChartInstance.update();
}
