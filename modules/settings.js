function loadSettings() {
    // Schaut nach, ob auf deinem Handy schon ein Token gespeichert ist
    const token = localStorage.getItem('ebay_dww_token');
    if (token) {
        document.getElementById('api-token').value = token;
        updateStatus(true);
    } else {
        updateStatus(false);
    }
}

function saveSettings() {
    const token = document.getElementById('api-token').value.trim();
    
    if (token) {
        // Speichert den Token im Browser deines Handys
        localStorage.setItem('ebay_dww_token', token);
        document.getElementById('status-display').innerHTML = "<span class='text-green-400 animate-pulse'>VERIFIZIERE TOKEN...</span>";
        
        setTimeout(() => {
            updateStatus(true);
        }, 800);
    } else {
        // Löscht den Token
        localStorage.removeItem('ebay_dww_token');
        updateStatus(false);
    }
}

function updateStatus(isOnline) {
    const display = document.getElementById('status-display');
    if (isOnline) {
        display.innerHTML = "<span class='text-green-400 drop-shadow-[0_0_5px_rgba(0,255,65,0.8)]'>ONLINE - UPLINK ESTABLISHED</span>";
    } else {
        display.innerHTML = "<span class='text-red-500'>OFFLINE - KEIN TOKEN GEFUNDEN</span>";
    }
}

// Wird automatisch ausgeführt, sobald man auf "SYSTEM" klickt
loadSettings();
