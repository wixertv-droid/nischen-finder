// modules/settings.js

function loadSettings() {
    const ebayAppId = localStorage.getItem('ai_dww_ebay_app_id');
    const ebayCertId = localStorage.getItem('ai_dww_ebay_cert_id');
    const aiKey = localStorage.getItem('ai_dww_token');

    if (ebayAppId) document.getElementById('ebay-app-id').value = ebayAppId;
    if (ebayCertId) document.getElementById('ebay-cert-id').value = ebayCertId;
    if (aiKey) document.getElementById('ai-key').value = aiKey;

    updateStatusDisplay(ebayAppId && ebayCertId, aiKey);
}

function saveSettings() {
    const ebayAppId = document.getElementById('ebay-app-id').value.trim();
    const ebayCertId = document.getElementById('ebay-cert-id').value.trim();
    const aiKey = document.getElementById('ai-key').value.trim();

    if (ebayAppId) localStorage.setItem('ai_dww_ebay_app_id', ebayAppId);
    if (ebayCertId) localStorage.setItem('ai_dww_ebay_cert_id', ebayCertId);
    if (aiKey) localStorage.setItem('ai_dww_token', aiKey);

    const btn = document.querySelector('button[onclick="saveSettings()"]');
    const originalText = btn.innerText;
    
    btn.innerText = "SAVED!";
    btn.classList.add('bg-[#00ff41]', 'text-black');
    
    updateStatusDisplay(ebayAppId && ebayCertId, aiKey);

    setTimeout(() => {
        btn.innerText = originalText;
        btn.classList.remove('bg-[#00ff41]', 'text-black');
    }, 1500);
}

function updateStatusDisplay(hasEbay, hasAi) {
    const statusEbay = document.getElementById('status-ebay');
    const statusAi = document.getElementById('status-ai');

    if (hasEbay) {
        statusEbay.innerText = "[ EBAY: ONLINE ]";
        statusEbay.className = "text-[11px] font-bold tracking-widest text-[#00ff41]";
    } else {
        statusEbay.innerText = "[ EBAY: OFFLINE ]";
        statusEbay.className = "text-[11px] font-bold tracking-widest text-red-500";
    }

    if (hasAi) {
        statusAi.innerText = "[ AI_CORE: ONLINE ]";
        statusAi.className = "text-[11px] font-bold tracking-widest text-[#00ff41]";
    } else {
        statusAi.innerText = "[ AI_CORE: OFFLINE ]";
        statusAi.className = "text-[11px] font-bold tracking-widest text-red-500";
    }
}

// Lade-Funktion ausführen
loadSettings();
