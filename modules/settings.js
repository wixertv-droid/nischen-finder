function loadSettings() {
    const token = localStorage.getItem('ebay_dww_token');
    const aiToken = localStorage.getItem('ai_dww_token');
    
    if (token) document.getElementById('api-token').value = token;
    if (aiToken) document.getElementById('ai-token').value = aiToken;
    
    updateStatus('status-ebay', token, 'EBAY');
    updateStatus('status-ai', aiToken, 'AI_CORE');
}

function saveSettings() {
    const token = document.getElementById('api-token').value.trim();
    const aiToken = document.getElementById('ai-token').value.trim();
    
    // eBay Speichern
    if (token) localStorage.setItem('ebay_dww_token', token);
    else localStorage.removeItem('ebay_dww_token');

    // AI Speichern
    if (aiToken) localStorage.setItem('ai_dww_token', aiToken);
    else localStorage.removeItem('ai_dww_token');

    document.getElementById('status-ebay').innerHTML = "<span class='text-green-400 animate-pulse'>VERIFYING...</span>";
    document.getElementById('status-ai').innerHTML = "<span class='text-green-400 animate-pulse'>VERIFYING...</span>";
        
    setTimeout(() => {
        updateStatus('status-ebay', token, 'EBAY');
        updateStatus('status-ai', aiToken, 'AI_CORE');
    }, 800);
}

function updateStatus(elementId, hasToken, name) {
    const display = document.getElementById(elementId);
    if (hasToken) {
        display.innerHTML = `<span class='text-green-400 drop-shadow-[0_0_5px_rgba(0,255,65,0.8)]'>[ ${name}: ONLINE ]</span>`;
    } else {
        display.innerHTML = `<span class='text-red-500'>[ ${name}: OFFLINE ]</span>`;
    }
}

loadSettings();
