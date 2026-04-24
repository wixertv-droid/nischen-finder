let currentCode = "";
const CORRECT_CODE = "0815";

function addDigit(digit) {
    if (currentCode.length < 4) { currentCode += digit; updateDisplay(); }
}

function clearCode() {
    currentCode = ""; updateDisplay();
}

function updateDisplay() {
    document.getElementById('code-display').innerText = "* ".repeat(currentCode.length) + "_ ".repeat(4 - currentCode.length);
}

function checkCode() {
    if (currentCode === CORRECT_CODE) {
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('app-content').classList.remove('hidden');
        // Lädt das Standard-Modul beim Start
        switchModule('ebay-finder', document.querySelector('.nav-btn')); 
    } else {
        clearCode();
    }
}

// NEU: Steuert das Footer-Menü und den Header
const moduleInfo = {
    'ebay-finder': {
        title: "EBAY // NISCHEN-SCAN",
        desc: "Prüft das Angebot auf eBay. Zeigt dir an, wie viele AKTIVE ANGEBOTE deine Konkurrenten zu einem Keyword geschaltet haben. Wenig Angebote = Deine Marktlücke."
    },
    'sold-gap': {
        title: "EBAY // TREND-ANALYSE",
        desc: "[MODUL IN ENTWICKLUNG] Analysiert verkaufte Artikel der letzten 90 Tage, um echte Nachfrage zu erkennen."
    },
    'settings': {
        title: "SYSTEM // CONFIG",
        desc: "API-Keys und Verbindungsparameter für den Server-Uplink einrichten."
    }
};

async function switchModule(moduleName, btnElement) {
    // Buttons optisch umschalten
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    if(btnElement) btnElement.classList.add('active');

    // Header Texte anpassen
    document.getElementById('module-title').innerText = moduleInfo[moduleName].title;
    document.getElementById('module-desc').innerText = moduleInfo[moduleName].desc;

    // Modul laden
    const container = document.getElementById('tool-container');
    container.innerHTML = `<div class='flex justify-center items-center h-full text-xs opacity-50 animate-pulse'>[SYSTEM]: FETCHING DATA...</div>`;
    
    try {
        const response = await fetch(`./modules/${moduleName}.html`);
        if (!response.ok) throw new Error("Not found");
        container.innerHTML = await response.text();
        
        const script = document.createElement('script');
        script.src = `./modules/${moduleName}.js`;
        document.body.appendChild(script);
    } catch (err) {
        container.innerHTML = `<div class='p-4 text-red-500 text-xs'>[ERR]: MODUL OFFLINE ODER NICHT GEFUNDEN.</div>`;
    }
}
