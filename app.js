let currentCode = "";
const CORRECT_CODE = "0815"; // Hier deinen Master-Code festlegen

// Tasten-Eingabe
function addDigit(digit) {
    if (currentCode.length < 4) {
        currentCode += digit;
        updateDisplay();
    }
}

// Eingabe löschen
function clearCode() {
    currentCode = "";
    updateDisplay();
    
    // Falls Fehler-Status noch aktiv ist, bereinigen
    const loginPanel = document.getElementById('login-section');
    loginPanel.classList.remove('error-state');
}

// Display aktualisieren
function updateDisplay() {
    const display = document.getElementById('code-display');
    // Zeigt Sternchen für eingegebene Zahlen und Unterstriche für leere Stellen
    display.innerText = "* ".repeat(currentCode.length) + "_ ".repeat(4 - currentCode.length);
}

// Code prüfen
function checkCode() {
    const loginPanel = document.getElementById('login-section');

    if (currentCode === CORRECT_CODE) {
        // CODE RICHTIG!
        startBootSequence();
    } else {
        // CODE FALSCH! Fehler-Animation auslösen
        loginPanel.classList.add('error-state');
        document.getElementById('code-display').innerText = "ERR!";
        
        // Nach 1 Sekunde wieder normaler Zustand
        setTimeout(() => {
            clearCode();
        }, 1000);
    }
}

// Boot-Sequenz (Ladebalken)
function startBootSequence() {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('loading-section').classList.remove('hidden');

    let progress = 0;
    const progressBar = document.getElementById('progress-bar');
    const percentText = document.getElementById('loading-percent');
    const statusText = document.getElementById('loading-text');

    // Hacker-ähnliche Lade-Phrasen
    const loadingPhrases = [
        "Bypassing mainframe...",
        "Connecting to eBay API...",
        "Decrypting market data...",
        "Loading GUI modules..."
    ];

    // Simulierter, leicht unregelmäßiger Ladevorgang
    const loadingInterval = setInterval(() => {
        // Zufälliger Fortschritt zwischen 1 und 5 Prozent
        progress += Math.floor(Math.random() * 5) + 1;
        
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadingInterval);
            
            // Ladevorgang beendet
            setTimeout(() => {
                document.getElementById('loading-section').classList.add('hidden');
                document.getElementById('app-content').classList.remove('hidden');
                loadModule('ebay-finder'); // Lädt dein Analyse-Tool
            }, 500);
        }

        // UI Updaten
        progressBar.style.width = progress + "%";
        percentText.innerText = progress + "%";

        // Text passend zum Fortschritt ändern
        if (progress === 25) statusText.innerText = loadingPhrases[1];
        if (progress === 50) statusText.innerText = loadingPhrases[2];
        if (progress === 75) statusText.innerText = loadingPhrases[3];

    }, 100); // Alle 100ms aktualisieren
}

// Modul-Loader (lädt später deine Such-Dateien)
async function loadModule(moduleName) {
    const container = document.getElementById('tool-container');
    container.innerHTML = `<div class='animate-pulse text-xs opacity-50'>[SYSTEM]: Fetching ${moduleName}...</div>`;
    
    setTimeout(async () => {
        try {
            const response = await fetch(`./modules/${moduleName}.html`);
            if (!response.ok) throw new Error("File not found");
            const html = await response.text();
            container.innerHTML = html;
            
            const script = document.createElement('script');
            script.src = `./modules/${moduleName}.js`;
            document.body.appendChild(script);
        } catch (err) {
            container.innerHTML = `
                <div class='border border-red-600 bg-red-900/30 p-4 text-red-500'>
                    [FATAL ERROR]: Modul '${moduleName}' nicht gefunden.<br>
                    Bitte stelle sicher, dass der Ordner /modules existiert.
                </div>`;
        }
    }, 600);
}
