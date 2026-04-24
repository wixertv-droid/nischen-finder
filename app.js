let currentCode = "";
const CORRECT_CODE = "0815"; // Dein Master-Code (kannst du hier ändern)

// Tasten-Eingabe auf dem Nummernblock
function addDigit(digit) {
    if (currentCode.length < 4) {
        currentCode += digit;
        updateDisplay();
    }
}

// Eingabe löschen (DEL-Taste)
function clearCode() {
    currentCode = "";
    updateDisplay();
    
    // Falls das Panel noch rot blinkt (Fehler), setzen wir es zurück
    const loginPanel = document.getElementById('login-section');
    if (loginPanel) loginPanel.classList.remove('error-state');
}

// Display im Login aktualisieren
function updateDisplay() {
    const display = document.getElementById('code-display');
    if (display) {
        display.innerText = "* ".repeat(currentCode.length) + "_ ".repeat(4 - currentCode.length);
    }
}

// Code prüfen (AUTH-Taste)
function checkCode() {
    const loginPanel = document.getElementById('login-section');

    if (currentCode === CORRECT_CODE) {
        // CODE RICHTIG -> Ladebildschirm starten
        startBootSequence();
    } else {
        // CODE FALSCH -> Hacker-Abwehr (rot wackeln)
        if (loginPanel) loginPanel.classList.add('error-state');
        const display = document.getElementById('code-display');
        if (display) display.innerText = "ERR!";
        
        // Setzt das Pad nach 1 Sekunde zurück
        setTimeout(() => {
            clearCode();
        }, 1000);
    }
}

// Boot-Sequenz (Animierter Ladebalken wie bei Jarvis)
function startBootSequence() {
    document.getElementById('login-section').classList.add('hidden');
    
    const loadingSection = document.getElementById('loading-section');
    if (loadingSection) {
        loadingSection.classList.remove('hidden');

        let progress = 0;
        const progressBar = document.getElementById('progress-bar');
        const percentText = document.getElementById('loading-percent');
        const statusText = document.getElementById('loading-text');

        // Hacker-Lade-Texte
        const loadingPhrases = [
            "Bypassing mainframe...",
            "Connecting to eBay API...",
            "Decrypting market data...",
            "Loading GUI modules..."
        ];

        // Zählt den Balken ungleichmäßig hoch
        const loadingInterval = setInterval(() => {
            progress += Math.floor(Math.random() * 5) + 1;
            
            if (progress >= 100) {
                progress = 100;
                clearInterval(loadingInterval);
                
                // Wenn 100% erreicht sind -> App öffnen
                setTimeout(() => {
                    loadingSection.classList.add('hidden');
                    document.getElementById('app-content').classList.remove('hidden');
                    
                    // Lädt direkt das Nischen-Tool und markiert den ersten Button unten
                    const firstBtn = document.querySelector('.nav-btn');
                    switchModule('ebay-finder', firstBtn); 
                }, 500);
            }

            if (progressBar) progressBar.style.width = progress + "%";
            if (percentText) percentText.innerText = progress + "%";

            // Passt den Text je nach Fortschritt an
            if (statusText) {
                if (progress === 25) statusText.innerText = loadingPhrases[1];
                if (progress === 50) statusText.innerText = loadingPhrases[2];
                if (progress === 75) statusText.innerText = loadingPhrases[3];
            }
        }, 100);
    } else {
        // Fallback, falls das Loading-Panel in der index.html mal fehlen sollte
        document.getElementById('app-content').classList.remove('hidden');
        switchModule('ebay-finder', document.querySelector('.nav-btn'));
    }
}

// TEXTE FÜR DEN HEADER (Platzhalter sind jetzt entfernt!)
const moduleInfo = {
    'ebay-finder': {
        title: "EBAY // NISCHEN-SCAN",
        desc: "Prüft das Angebot auf eBay. Zeigt dir an, wie viele AKTIVE ANGEBOTE deine Konkurrenten zu einem Keyword geschaltet haben. Wenig Angebote = Deine Marktlücke."
    },
    'sold-gap': {
        title: "EBAY // TREND-ANALYSE",
        desc: "Analysiert die Verkaufs-Ratio (Angebot vs. Nachfrage). Vergleicht aktive Konkurrenten mit den geschätzten Verkaufszahlen, um stark nachgefragte Nischen zu identifizieren."
    },
    'settings': {
        title: "SYSTEM // CONFIG",
        desc: "API-Keys und Verbindungsparameter für den Server-Uplink einrichten. Daten werden lokal und verschlüsselt gespeichert."
    }
};

// Steuert das Footer-Menü und lädt die jeweiligen HTML/JS Dateien
async function switchModule(moduleName, btnElement) {
    // 1. Alle Buttons unten grau machen, nur den angeklickten grün leuchten lassen
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    if(btnElement) btnElement.classList.add('active');

    // 2. Den Text oben im Header anpassen (greift auf moduleInfo zu)
    const titleEl = document.getElementById('module-title');
    const descEl = document.getElementById('module-desc');
    if (titleEl) titleEl.innerText = moduleInfo[moduleName].title;
    if (descEl) descEl.innerText = moduleInfo[moduleName].desc;

    // 3. Modul laden
    const container = document.getElementById('tool-container');
    container.innerHTML = `<div class='flex justify-center items-center h-full text-xs opacity-50 animate-pulse text-green-500 font-mono'>[SYSTEM]: FETCHING MODULE DATA...</div>`;
    
    try {
        // HTML-Datei aus dem Ordner holen
        const response = await fetch(`./modules/${moduleName}.html`);
        if (!response.ok) throw new Error("Not found");
        container.innerHTML = await response.text();
        
        // JS-Datei aus dem Ordner holen und ausführen
        const script = document.createElement('script');
        script.src = `./modules/${moduleName}.js`;
        
        // Alte Scripte aufräumen, damit sich nichts überschneidet
        const oldScript = document.getElementById(`script-${moduleName}`);
        if (oldScript) oldScript.remove();
        
        script.id = `script-${moduleName}`;
        document.body.appendChild(script);
        
    } catch (err) {
        // Fehler-Screen, falls eine Datei fehlt
        container.innerHTML = `
            <div class='p-4 text-red-500 text-xs text-center mt-10 border border-red-900 bg-red-900/20 font-mono'>
                [FATAL ERR]: MODUL '${moduleName}' OFFLINE.<br><br>
                Uplink failed. File not found in /modules directory.
            </div>`;
    }
}
