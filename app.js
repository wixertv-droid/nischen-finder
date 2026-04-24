// app.js

// --- 1. KONFIGURATION ALLER 5 MODULE ---
const MODULES = {
    'ebay-finder': { title: 'NISCHEN // RADAR', desc: 'Finde hochprofitable, versteckte Nischen.' },
    'sold-gap': { title: 'TREND // SCANNER', desc: 'Analysiere Angebot vs. Nachfrage.' },
    'ai-nexus': { title: 'NEURAL // AI_CORE', desc: 'Künstliche Intelligenz bewertet Potenzial und SEO.' },
    'keyword-scanner': { title: 'KEYWORD // METRICS', desc: 'Analysiere Suchvolumen, Traffic und Kaufintention.' },
    'settings': { title: 'SYSTEM // CONFIG', desc: 'Verwalte deine API-Keys lokal und sicher.' }
};

// --- 2. LOGIN LOGIK ---
let code = '';
// WICHTIG: Trage hier deinen eigenen PIN ein, sonst kommst du nicht rein!
const CORRECT_CODE = '1337'; 

function addDigit(digit) {
    if (code.length < 4) {
        code += digit;
        updateDisplay();
    }
}

function clearCode() {
    code = '';
    updateDisplay();
}

function updateDisplay() {
    const display = document.getElementById('code-display');
    // Versteckt die echten Zahlen hinter Sternchen (*)
    const maskedCode = "*".repeat(code.length).padEnd(4, '_').split('').join(' ');
    display.innerText = maskedCode;
    display.classList.remove('error-state');
}

function checkCode() {
    const display = document.getElementById('code-display');
    
    if (code === CORRECT_CODE) {
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('loading-section').classList.remove('hidden');
        simulateLoading();
    } else {
        // Reflow-Trick: Zwingt den Browser, das rote Schütteln JEDES MAL abzuspielen
        display.classList.remove('error-state');
        void display.offsetWidth; 
        display.classList.add('error-state');
        
        // Wartet bis die Schüttel-Animation (0.4s) vorbei ist, bevor das Feld geleert wird
        setTimeout(() => {
            clearCode();
        }, 600);
    }
}

function simulateLoading() {
    let percent = 0;
    const percentDiv = document.getElementById('loading-percent');
    const bar = document.getElementById('progress-bar');
    
    const interval = setInterval(() => {
        percent += Math.floor(Math.random() * 15) + 5;
        if (percent > 100) percent = 100;
        
        percentDiv.innerText = percent + '%';
        bar.style.width = percent + '%';
        
        if (percent === 100) {
            clearInterval(interval);
            setTimeout(() => {
                document.getElementById('loading-section').classList.add('hidden');
                document.getElementById('main-header').classList.add('hidden');
                document.getElementById('app-content').classList.remove('hidden');
                document.getElementById('app-content').classList.add('flex');
                
                // Startet mit dem ersten Reiter
                switchModule('ebay-finder', document.querySelector('.nav-btn'));
            }, 500);
        }
    }, 200);
}

// --- 3. MODUL MANAGER ---
let currentScript = null;

async function switchModule(moduleId, btnElement) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');

    if (MODULES[moduleId]) {
        document.getElementById('module-title').innerText = MODULES[moduleId].title;
        document.getElementById('module-desc').innerText = MODULES[moduleId].desc;
    }

    try {
        const cacheBuster = new Date().getTime();
        const response = await fetch(`modules/${moduleId}.html?v=${cacheBuster}`);
        
        if (!response.ok) throw new Error(`Server antwortet mit Status: ${response.status}`);
        
        const html = await response.text();
        document.getElementById('tool-container').innerHTML = html;

        if (currentScript) {
            currentScript.remove();
        }
        
        const script = document.createElement('script');
        script.src = `modules/${moduleId}.js?v=${cacheBuster}`;
        document.body.appendChild(script);
        currentScript = script;

    } catch (error) {
        console.error("CRITICAL ERROR beim Modul-Wechsel:", error);
        document.getElementById('tool-container').innerHTML = `
            <div class="p-6 text-red-500 font-mono text-xs border border-red-900 bg-red-900/20 m-4 shadow-[0_0_15px_rgba(255,0,51,0.2)]">
                <b class="text-sm border-b border-red-900 block mb-2 pb-1">[ SYSTEM_ERROR ]</b>
                Modul <i>${moduleId}.html</i> konnte nicht geladen werden.<br><br>
                <b>Ursache:</b> ${error.message}<br><br>
                <i>Warte 1-2 Minuten. GitHub Pages braucht oft kurz, bis neue Dateien online sind.</i>
            </div>
        `;
    }
}
