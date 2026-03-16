document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements for Sensors
    const tempEl = document.getElementById('val-temp');
    const humEl = document.getElementById('val-hum');
    const co2El = document.getElementById('val-co2');
    const presEl = document.getElementById('val-pres');
    const motionEl = document.getElementById('val-motion');
    const alertContainer = document.getElementById('alert-container');

    // Get current industry from local storage
    const currentIndustry = localStorage.getItem('iot_industry') || 'Manufacturing';

    // Thresholds
    let THRESHOLDS = {
        tempHigh: 35,
        co2High: 1000
    };

    // State
    let state = {
        temp: 27,
        hum: 65,
        co2: 420,
        pres: 1012,
        motion: false,
        devices: [true, true, false, true, true] // Status of sensors 1-5
    };

    // Dynamic configuration based on industry
    if (currentIndustry === 'Food Industry') {
        state.temp = 4; // Refrigeration temps
        THRESHOLDS.tempHigh = 8;
        state.hum = 85; // High humidity
        state.co2 = 380;
    } else if (currentIndustry === 'Agriculture') {
        state.temp = 22;
        THRESHOLDS.tempHigh = 30;
        state.hum = 75;
        state.co2 = 600; // Greenhouse CO2
        THRESHOLDS.co2High = 1200;
    } else if (currentIndustry === 'Construction') {
        state.temp = 32; // Outdoor
        THRESHOLDS.tempHigh = 40;
        state.hum = 50;
        state.pres = 990;
    } else if (currentIndustry === 'Smart Home') {
        state.temp = 24;
        THRESHOLDS.tempHigh = 28;
    }

    // ── Read simulator payload if coming back from simulator.html ──
    const simActive = localStorage.getItem('iot_sim_active');
    if (simActive === 'true') {
        try {
            const simPayload = JSON.parse(localStorage.getItem('iot_sim_payload') || '{}');
            if (simPayload.temperature !== undefined) state.temp   = simPayload.temperature;
            if (simPayload.humidity    !== undefined) state.hum    = simPayload.humidity;
            if (simPayload.co2         !== undefined) state.co2    = simPayload.co2;
            if (simPayload.pressure    !== undefined) state.pres   = simPayload.pressure;
            if (simPayload.motion      !== undefined) state.motion = simPayload.motion;
        } catch(e) {}
        localStorage.removeItem('iot_sim_active');
        // Show a toast after a short delay (so the UI is ready)
        setTimeout(() => showAlert('SIMULATOR INJECTED', `Live sensors updated from simulator`, 'warning'), 500);
    }

    /**
     * Helper to show a toast notification alert and log to history
     */
    function showAlert(title, message, type = 'danger') {
        // Log to history
        addAlertToHistory(title, message, type);

        // Prevent duplicate alerts of the same type filling the screen
        const existingAlerts = document.querySelectorAll('.alert-toast');
        if(existingAlerts.length > 3) {
            existingAlerts[0].remove();
        }

        const alertEl = document.createElement('div');
        alertEl.className = `alert-toast alert-enter bg-card border-l-4 p-4 rounded-r-lg shadow-xl shadow-black/50 flex items-start gap-3 min-w-[300px] pointer-events-auto z-[100]`;
        
        let iconHtml = '';
        let borderColor = '';
        let titleColor = '';

        if(type === 'danger') {
            borderColor = 'border-danger';
            titleColor = 'text-danger';
            iconHtml = '<i class="fa-solid fa-triangle-exclamation text-danger mt-0.5"></i>';
        } else if (type === 'warning') {
            borderColor = 'border-warning';
            titleColor = 'text-warning';
            iconHtml = '<i class="fa-solid fa-circle-exclamation text-warning mt-0.5"></i>';
        } else if (type === 'success') {
            borderColor = 'border-success';
            titleColor = 'text-success';
            iconHtml = '<i class="fa-solid fa-circle-check text-success mt-0.5"></i>';
        }

        alertEl.classList.add(borderColor);

        alertEl.innerHTML = `
            ${iconHtml}
            <div class="flex-grow">
                <h4 class="font-bold text-sm ${titleColor}">${title}</h4>
                <p class="text-xs text-slate-300 mt-1">${message}</p>
            </div>
            <button class="text-slate-500 hover:text-white transition-colors ml-2" onclick="this.parentElement.remove()">
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;

        alertContainer.appendChild(alertEl);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if(document.body.contains(alertEl)) {
                alertEl.classList.remove('alert-enter');
                alertEl.classList.add('alert-exit');
                setTimeout(() => alertEl.remove(), 300); // Wait for exit animation
            }
        }, 5000);
    }

    const historyContainer = document.getElementById('alert-history');
    function addAlertToHistory(title, message, type) {
        if(!historyContainer) return;

        // Remove empty state if present
        const emptyState = historyContainer.querySelector('.opacity-50');
        if(emptyState) emptyState.remove();

        const item = document.createElement('div');
        const color = type === 'danger' ? 'danger' : type === 'warning' ? 'warning' : 'success';
        const icon = type === 'danger' ? 'fa-triangle-exclamation' : type === 'warning' ? 'fa-circle-exclamation' : 'fa-circle-check';
        
        const now = new Date();
        const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

        item.className = `history-item p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 flex gap-3 items-start`;
        item.innerHTML = `
            <div class="w-2 h-2 rounded-full bg-${color} mt-1.5 shrink-0"></div>
            <div class="flex-grow min-w-0">
                <div class="flex justify-between items-center mb-1">
                    <span class="text-xs font-bold text-${color} uppercase tracking-tighter">${title}</span>
                    <span class="text-[9px] text-slate-500 font-mono">${timeStr}</span>
                </div>
                <p class="text-[11px] text-slate-400 truncate">${message}</p>
            </div>
        `;

        historyContainer.prepend(item);

        // Keep only last 20 history items
        if(historyContainer.children.length > 20) {
            historyContainer.lastElementChild.remove();
        }
    }

    /**
     * Simulates changing sensor data and device status
     */
    function simulateData() {
        // Temperature fluctuates slightly, occasional spikes
        state.temp += (Math.random() * 2 - 1);
        if(Math.random() > 0.95) state.temp += 5; // Occasional spike
        if(state.temp < 15) state.temp = 15;
        if(state.temp > 45) state.temp = 45;

        // Humidity
        state.hum += (Math.random() * 4 - 2);
        if(state.hum < 30) state.hum = 30;
        if(state.hum > 100) state.hum = 100;

        // CO2
        state.co2 += (Math.random() * 20 - 10);
        if(Math.random() > 0.95) state.co2 += 200; // Occasional spike
        if(state.co2 < 350) state.co2 = 350;
        if(state.co2 > 1500) state.co2 = 1500;

        // Pressure
        state.pres += (Math.random() * 2 - 1);
        if(state.pres < 980) state.pres = 980;
        if(state.pres > 1050) state.pres = 1050;

        // Motion (randomly triggers)
        state.motion = Math.random() > 0.8;

        // Randomly toggle device status (simulation of connectivity)
        if(Math.random() > 0.98) {
            const idx = Math.floor(Math.random() * 5);
            const oldStatus = state.devices[idx];
            state.devices[idx] = !state.devices[idx];
            
            const deviceNames = ["Temperature", "Gas", "Humidity", "Motion", "Pressure"];
            if(!state.devices[idx]) {
                showAlert('DEVICE DISCONNECT', `${deviceNames[idx]} Sensor lost connection`, 'warning');
            } else {
                showAlert('DEVICE CONNECTED', `${deviceNames[idx]} Sensor is back online`, 'success');
            }
        }
    }

    const timestampEl = document.getElementById('last-updated');
    const deviceCards = document.querySelectorAll('main > section:first-of-type > div > div');

    /**
     * Updates the DOM elements with current state
     */
    function updateUI() {
        // Update text values
        tempEl.textContent = `${state.temp.toFixed(1)}°C`;
        humEl.textContent = `${Math.round(state.hum)}%`;
        co2El.textContent = `${Math.round(state.co2)} ppm`;
        presEl.textContent = `${Math.round(state.pres)} hPa`;

        // Update Motion indicator
        if(state.motion) {
            motionEl.textContent = 'Detected';
            motionEl.className = 'text-danger text-sm font-bold uppercase tracking-wider bg-danger/10 px-3 py-1 rounded-full border border-danger/20 motion-alert';
        } else {
            motionEl.textContent = 'Clear';
            motionEl.className = 'text-success text-sm font-bold uppercase tracking-wider bg-success/10 px-3 py-1 rounded-full border border-success/20';
        }

        // Color coding text based on thresholds
        if(state.temp > THRESHOLDS.tempHigh) {
            tempEl.classList.add('text-danger');
            tempEl.classList.remove('text-white');
        } else {
            tempEl.classList.remove('text-danger');
            tempEl.classList.add('text-white');
        }

        if(state.co2 > THRESHOLDS.co2High) {
            co2El.classList.add('text-warning');
            co2El.classList.remove('text-white');
        } else {
            co2El.classList.remove('text-warning');
            co2El.classList.add('text-white');
        }

        // Update Device Cards
        state.devices.forEach((status, i) => {
            const card = deviceCards[i];
            if(!card) return;
            
            const dot = card.querySelector('.rounded-full');
            const statusText = card.querySelector('p');
            
            if(status) {
                dot.className = 'flex h-2.5 w-2.5 rounded-full bg-success shadow-[0_0_8px_#10b981]';
                statusText.className = 'text-xs text-success mt-1 font-semibold';
                statusText.innerText = 'Online';
                card.classList.remove('border-danger/30', 'bg-danger/5');
                card.classList.add('border-slate-700');
            } else {
                dot.className = 'flex h-2.5 w-2.5 rounded-full bg-danger shadow-[0_0_8px_#ef4444] animate-pulse';
                statusText.className = 'text-xs text-danger mt-1 font-semibold';
                statusText.innerText = 'Offline';
                card.classList.add('border-danger/30', 'bg-danger/5');
                card.classList.remove('border-slate-700');
            }
        });

        // Update Timestamp
        if(timestampEl) {
            const now = new Date();
            timestampEl.textContent = `LAST SYNC: ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        }
    }

    /**
     * Checks thresholds and triggers alerts
     */
    function checkAlerts() {
        if(state.temp > THRESHOLDS.tempHigh && Math.random() > 0.5) {
            // Random check so it doesn't fire constantly during a high temp period
            showAlert('TEMPERATURE WARNING', `Temperature critically high: ${state.temp.toFixed(1)}°C`, 'danger');
        }

        if(state.co2 > THRESHOLDS.co2High && Math.random() > 0.5) {
            showAlert('CO2 WARNING', `CO2 levels above safe limit: ${Math.round(state.co2)} ppm`, 'warning');
        }
    }

    // =====================================================
    // IoT Sensor Data Simulator — Modal Controller
    // =====================================================

    let simMotionState = false;

    /** Opens the simulator modal and syncs sliders to current live state */
    window.stimulateIoT = function() {
        const modal = document.getElementById('simulator-modal');
        if (!modal) return;

        // Sync sliders with current live state
        setSlider('sim-temp', 'sim-temp-val', state.temp.toFixed(1), '°C');
        setSlider('sim-hum',  'sim-hum-val',  Math.round(state.hum), '%');
        setSlider('sim-co2',  'sim-co2-val',  Math.round(state.co2), ' ppm');
        setSlider('sim-pres', 'sim-pres-val', Math.round(state.pres), ' hPa');

        simMotionState = state.motion;
        updateMotionToggleUI();

        resetSimStatus();
        modal.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');

        // Re-apply translations inside modal
        if (typeof applyTranslations === 'function') applyTranslations();
    };

    window.closeSimulatorModal = function() {
        const modal = document.getElementById('simulator-modal');
        if (modal) modal.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    };

    /** Sets a range slider value and its display label */
    function setSlider(sliderId, labelId, value, suffix) {
        const slider = document.getElementById(sliderId);
        const label  = document.getElementById(labelId);
        if (slider) slider.value = value;
        if (label)  label.textContent = value + suffix;
    }

    /** Applies a preset scenario to the simulator sliders */
    window.applyScenario = function(scenario) {
        const presets = {
            normal:   { temp: 24,   hum: 60,  co2: 420,  pres: 1013, motion: false },
            heatwave: { temp: 42,   hum: 80,  co2: 650,  pres: 1005, motion: false },
            danger:   { temp: 55,   hum: 95,  co2: 1600, pres: 960,  motion: true  }
        };
        const p = presets[scenario];
        if (!p) return;

        setSlider('sim-temp', 'sim-temp-val', p.temp, '°C');
        setSlider('sim-hum',  'sim-hum-val',  p.hum,  '%');
        setSlider('sim-co2',  'sim-co2-val',  p.co2,  ' ppm');
        setSlider('sim-pres', 'sim-pres-val', p.pres, ' hPa');

        simMotionState = p.motion;
        updateMotionToggleUI();
        resetSimStatus();

        // Highlight the active preset button briefly
        document.querySelectorAll('.sim-preset-btn').forEach(btn => {
            btn.classList.remove('ring-2', 'ring-primary', 'ring-warning', 'ring-danger');
        });
        const clickedBtn = event && event.target;
        if (clickedBtn) {
            const ring = scenario === 'danger' ? 'ring-danger' : scenario === 'heatwave' ? 'ring-warning' : 'ring-primary';
            clickedBtn.classList.add('ring-2', ring);
        }
    };

    /** Toggles the motion detection switch in the simulator */
    window.toggleSimMotion = function() {
        simMotionState = !simMotionState;
        updateMotionToggleUI();
    };

    function updateMotionToggleUI() {
        const toggle = document.getElementById('sim-motion-toggle');
        const knob   = document.getElementById('sim-motion-knob');
        if (!toggle || !knob) return;

        if (simMotionState) {
            toggle.style.backgroundColor = '#3b82f6';
            knob.style.left = '28px';
            knob.style.backgroundColor = '#fff';
        } else {
            toggle.style.backgroundColor = '';
            knob.style.left = '4px';
            knob.style.backgroundColor = '';
        }
        toggle.setAttribute('aria-pressed', String(simMotionState));
    }

    function resetSimStatus() {
        const bar = document.getElementById('sim-status-bar');
        if (!bar) return;
        bar.innerHTML = `
            <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse inline-block"></span>
            <span class="text-slate-300" data-i18n="sim.status.idle">Simulator ready — values not yet pushed</span>`;
        if (typeof applyTranslations === 'function') applyTranslations();
    }

    /**
     * Reads simulator slider values and injects them into the live dashboard state.
     * ── BACKEND HOOK ──
     * This is where you will add your fetch/POST to the backend API.
     * The `payload` object contains all sensor readings to send.
     */
    window.pushSimulatorData = function() {
        const payload = {
            temperature: parseFloat(document.getElementById('sim-temp').value),
            humidity:    parseFloat(document.getElementById('sim-hum').value),
            co2:         parseFloat(document.getElementById('sim-co2').value),
            pressure:    parseFloat(document.getElementById('sim-pres').value),
            motion:      simMotionState,
            industry:    localStorage.getItem('iot_industry') || 'Manufacturing',
            timestamp:   new Date().toISOString()
        };

        // ── Inject into live dashboard state immediately ──
        state.temp   = payload.temperature;
        state.hum    = payload.humidity;
        state.co2    = payload.co2;
        state.pres   = payload.pressure;
        state.motion = payload.motion;
        updateUI();
        if (typeof updateCharts === 'function') updateCharts(state.temp, state.hum, state.co2);
        checkAlerts();

        // ── Update simulator status bar ──
        const bar = document.getElementById('sim-status-bar');
        if (bar) {
            bar.innerHTML = `
                <span class="w-2 h-2 rounded-full bg-success inline-block shadow-[0_0_6px_#10b981]"></span>
                <span class="text-success font-semibold text-xs">Injected → T:${payload.temperature}°C  H:${payload.humidity}%  CO₂:${payload.co2}ppm  P:${payload.pressure}hPa  Motion:${payload.motion ? 'ON' : 'OFF'}</span>`;
        }

        // ── BACKEND: replace the comment below with your API call ──
        // Example:
        // fetch('https://your-backend/api/simulate', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(payload)
        // }).then(r => r.json()).then(data => console.log('Backend response:', data));

        showAlert('SIMULATOR', `Data pushed — ${payload.temperature}°C · ${payload.co2} ppm`, 'warning');

        // Close modal after short delay
        setTimeout(() => closeSimulatorModal(), 1200);
    };

    /**
     * Populate the Risk Monitoring Table based on industry
     */
    function initRiskTable() {
        const tbody = document.getElementById('risk-table-body');
        if(!tbody) return;

        let rows = [
            { icon: 'fa-skull-crossbones', color: 'danger', key: 'risk.1', sensor: 'risk.1.s', action: 'risk.1.a' },
            { icon: 'fa-snowflake', color: 'primary', key: 'risk.2', sensor: 'risk.2.s', action: 'risk.2.a' },
            { icon: 'fa-flask-vial', color: 'warning', key: 'risk.3', sensor: 'risk.3.s', action: 'risk.3.a' }
        ];

        // Add industry specific row
        if (currentIndustry === 'Food Industry') {
            rows.push({ icon: 'fa-thermometer-comb', color: 'danger', key: 'risk.food.1', sensor: 'risk.food.1.s', action: 'risk.food.1.a' });
        } else if (currentIndustry === 'Agriculture') {
            rows.push({ icon: 'fa-seedling', color: 'success', key: 'risk.agri.1', sensor: 'risk.agri.1.s', action: 'risk.agri.1.a' });
        } else if (currentIndustry === 'Smart Home') {
            rows.push({ icon: 'fa-door-open', color: 'primary', key: 'risk.home.1', sensor: 'risk.home.1.s', action: 'risk.home.1.a' });
        } else if (currentIndustry === 'Construction') {
            rows.push({ icon: 'fa-wind', color: 'warning', key: 'risk.const.1', sensor: 'risk.const.1.s', action: 'risk.const.1.a' });
        }

        tbody.innerHTML = rows.map(row => `
            <tr class="hover:bg-slate-800/30 transition-colors">
                <td class="p-4 flex items-center gap-3">
                    <div class="w-8 h-8 rounded bg-${row.color}/10 text-${row.color} flex items-center justify-center shrink-0"><i class="fa-solid ${row.icon}"></i></div>
                    <span class="font-medium text-slate-200" data-i18n="${row.key}"></span>
                </td>
                <td class="p-4 text-slate-400" data-i18n="${row.sensor}"></td>
                <td class="p-4"><span class="bg-${row.color}/10 text-${row.color} border border-${row.color}/20 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap" data-i18n="${row.action}"></span></td>
            </tr>
        `).join('');

        // Re-apply translations after injecting new elements
        if(typeof applyTranslations === 'function') applyTranslations();
    }

    // Initialize UI with staggered entry
    const sections = document.querySelectorAll('main > section, main > div > section');
    sections.forEach((sec, i) => {
        sec.classList.add('reveal-card');
        sec.style.animationDelay = `${i * 0.15}s`;
    });

    initRiskTable();

    // Main Update Loop (Every 3 seconds)
    setInterval(() => {
        simulateData();
        updateUI();
        checkAlerts();
        
        if(typeof updateCharts === 'function') {
            updateCharts(state.temp, state.hum, state.co2);
        }
    }, 3000);
});
