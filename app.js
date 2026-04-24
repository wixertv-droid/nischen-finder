let currentCode = "";
const CORRECT_CODE = "0815"; // Dein Code zum Einloggen

function addDigit(digit) {
    if (currentCode.length < 4) {
        currentCode += digit;
        updateDisplay();
    }
}

function clearCode() {
    currentCode = "";
    updateDisplay();
    document.getElementById('login-section').classList.remove('error-state');
}

function updateDisplay() {
    const display = document.getElementById('code-display');
    display.innerText = "* ".repeat(currentCode.length) + "_ ".repeat(4 - currentCode.length);
}

function checkCode() {
    if (currentCode === CORRECT_CODE) {
        startBootSequence();
    } else {
        document.getElementById('login-section').classList.add('error-state');
        document.getElementById('code-display').innerText = "ERR!";
        setTimeout(clearCode, 1000);
    }
}

// DAS LADE-SYSTEM (0% bis 100%)
function startBootSequence() {
    // Verstecke Login und Header-Logo
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('main-header').classList.add('opacity-0');
    
    // Zeige Lade-Bereich
    const loadingSection = document.getElementById('loading-section');
    loadingSection.classList.remove('hidden');

    let progress = 0;
    const progressBar = document.getElementById('progress-bar');
    const percentText = document.getElementById('loading-percent');
    const statusText = document.getElementById('loading-text');

    const phrases = [
        "Bypassing eBay Security...",
        "Establishing Satellite Uplink...",
        "Syncing Market Modules...",
        "Ready to scan."
    ];

    const interval = setInterval(() => {
        // Zufälliger Fortschritt für Hacker-Gefühl
        progress += Math.floor(Math.random() * 7) + 1;
        
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            setTimeout(() => {
                loadingSection.classList.add('hidden');
                document.getElementById('app-content').classList.remove('hidden');
                switchModule('ebay-finder', document.querySelector('.nav-btn'));
            }, 500);
        }

        // UI Aktualisierung
        progressBar.style.width = progress + "%";
        percentText.innerText = progress + "%";
        
        // Texte passend zum Prozentwert
        if (progress < 30) statusText.innerText = phrases[0];
        else if (progress < 60) statusText.innerText = phrases[1];
        else if (progress < 90) statusText.innerText = phrases[2];
        else statusText.innerText = phrases[3];

    }, 80; // Geschwindigkeit des Ladens
}

const moduleInfo = {
    'ebay-finder': {
        title: "EBAY // NISCHEN-SCAN",
        desc: "Prüft aktive Angebote der Konkurrenz. Findet Lücken mit wenig Wettbewerb."
    },
    'sold-gap': {
        title: "EBAY // TRENDS",
        desc: "Analysiert historische Verkaufszahlen vs. aktuelles Angebot."
    },
    'settings': {
        title: "SYSTEM // CONFIG",
        desc: "Verwalte deine API-Keys und Verbindungsdaten lokal."
    }
};

async function switchModule(moduleName, btnElement) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    if(btnElement) btnElement.classList.add('active');

    document.getElementById('module-title').innerText = moduleInfo[moduleName].title;
    document.getElementById('module-desc').innerText = moduleInfo[moduleName].desc;

    const container = document.getElementById('tool-container');
    container.innerHTML = `<div class='h-full flex items-center justify-center animate-pulse text-xs'>[SYSTEM] FETCHING...</div>`;
    
    try {
        const response = await fetch(`./modules/${moduleName}.html`);
        container.innerHTML = await response.text();
        
        const script = document.createElement('script');
        script.src = `./modules/${moduleName}.js`;
        document.body.appendChild(script);
    } catch (err) {
        container.innerHTML = `<div class='p-4 text-red-500'>Error loading module.</div>`;
    }
}
