let currentCode = "";
const CORRECT_CODE = "0815"; // Dein Code

function addDigit(digit) {
    if (currentCode.length < 4) {
        currentCode += digit;
        updateDisplay();
    }
}

function clearCode() {
    currentCode = "";
    updateDisplay();
}

function updateDisplay() {
    const display = document.getElementById('code-display');
    display.innerText = "█ ".repeat(currentCode.length) + "_ ".repeat(4 - currentCode.length);
}

function checkCode() {
    if (currentCode === CORRECT_CODE) {
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('app-content').classList.remove('hidden');
        loadModule('ebay-finder'); 
    } else {
        alert("ACCESS DENIED - TERMINAL LOCKED");
        clearCode();
    }
}

async function loadModule(moduleName) {
    const container = document.getElementById('tool-container');
    container.innerHTML = `<div class='animate-pulse text-xs'>[SYSTEM]: Initializing ${moduleName}...</div>`;
    
    // Simulierter Delay für den Jarvis-Effekt
    setTimeout(async () => {
        try {
            const response = await fetch(`./modules/${moduleName}.html`);
            const html = await response.text();
            container.innerHTML = html;
            
            const script = document.createElement('script');
            script.src = `./modules/${moduleName}.js`;
            document.body.appendChild(script);
        } catch (err) {
            container.innerHTML = "<div class='text-red-600'>[ERROR]: Module not found.</div>";
        }
    }, 800);
}
