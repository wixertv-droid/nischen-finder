let currentCode = "";
const CORRECT_CODE = "0815"; 

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

function startBootSequence() {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('main-header').classList.add('opacity-0');
    
    const loadingSection = document.getElementById('loading-section');
    loadingSection.classList.remove('hidden');

    let progress = 0;
    const progressBar = document.getElementById('progress-bar');
    const percentText = document.getElementById('loading-percent');
    const statusText = document.getElementById('loading-text');

    const phrases = [
        "Bypassing eBay Security...",
        "Establishing Satellite Uplink...",
        "Connecting to AI Neural Net...",
        "Ready to scan."
    ];

    const interval = setInterval(() => {
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

        progressBar.style.width = progress + "%";
        percentText.innerText = progress + "%";
        
        if (progress < 30) statusText.innerText = phrases[0];
        else if (progress < 60) statusText.innerText = phrases[1];
        else if (progress < 90) statusText.innerText = phrases[2];
        else statusText.innerText = phrases[3];

    }, 80); 
}

// HIER IST DAS NEUE MODUL REGISTRIERT
const moduleInfo = {
    'ebay-finder': {
        title: "EBAY // NISCHEN-SCAN",
        desc: "Prüft aktive Angebote der Konkurrenz. Findet Lücken mit wenig Wettbewerb."
    },
    'sold-gap': {
        title: "EBAY // TRENDS",
        desc: "Analysiert historische Verkaufszahlen vs. aktuelles Angebot."
    },
    'ai-nexus': {
        title: "NEURAL // AI_CORE",
        desc: "Künstliche Intelligenz bewertet Potenzial, Risiken und generiert Produktideen für deine Ziel-Nische."
    },
    'settings': {
        title: "SYSTEM // CONFIG",
        desc: "Verwalte deine API-Keys (eBay & OpenAI) lokal und sicher."
    }
};

async function switchModule(moduleName, btnElement) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    if(btnElement) btnElement.classList.add('active');

    document.getElementById('module-title').innerText = moduleInfo[moduleName].title;
    document.getElementById('module-desc').innerText = moduleInfo[moduleName].desc;

    const container = document.getElementById('tool-container');
    container.innerHTML = `<div class='h-full flex items-center justify-center animate-pulse text-xs font-mono text-green-500'>[SYSTEM] FETCHING DATA...</div>`;
    
    try {
        const response = await fetch(`./modules/${moduleName}.html`);
        container.innerHTML = await response.text();
        
        const oldScript = document.getElementById(`script-${moduleName}`);
        if (oldScript) oldScript.remove();

        const script = document.createElement('script');
        script.src = `./modules/${moduleName}.js`;
        script.id = `script-${moduleName}`;
        document.body.appendChild(script);
    } catch (err) {
        container.innerHTML = `<div class='p-4 text-red-500 text-xs text-center border border-red-900 bg-red-900/20 mt-10'>[FATAL ERR] Modul offline.</div>`;
    }
}
