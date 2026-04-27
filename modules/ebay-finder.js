// modules/ebay-finder.js

// Macht die Funktionen global verfügbar
window.startNischenScan = async function() {
    const inputField = document.getElementById('nischen-input');
    const resultsDiv = document.getElementById('nischen-results');
    const text = inputField.value.trim();
    const appId = localStorage.getItem('ai_dww_ebay_app_id');
    const certId = localStorage.getItem('ai_dww_ebay_cert_id');

    if (!appId || !text) return;

    const keywords = text.split('\n').map(k => k.trim()).filter(k => k.length > 0);
    resultsDiv.innerHTML = `<div class='flex flex-col items-center justify-center mt-10 gap-2 animate-pulse'><div class='w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin'></div><div class='text-[10px] uppercase text-green-500'>Uplink to eBay...</div></div>`;

    try {
        const token = await generateEbayToken(appId, certId);
        resultsDiv.innerHTML = ''; 

        for (let kw of keywords) {
            const id = `res-${btoa(encodeURIComponent(kw)).replace(/=/g, '')}`;
            resultsDiv.innerHTML += `<div id="${id}" class="border-l-2 border-green-800 bg-black/40 p-4 mb-4 text-xs text-green-700">Analysiere: ${kw}...</div>`;
            
            // Einzel-Scan pro Keyword
            scanSingleKeyword(kw, token, id);
        }
    } catch (e) {
        resultsDiv.innerHTML = `<div class="text-red-500 p-4 text-xs border border-red-900 bg-red-900/20">TOKEN_ERROR: ${e.message}</div>`;
    }
}

async function generateEbayToken(appId, certId) {
    const credentials = btoa(`${appId}:${certId}`);
    const res = await fetch('https://corsproxy.io/?' + encodeURIComponent('https://api.ebay.com/identity/v1/oauth2/token'), {
        method: 'POST',
        headers: { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope'
    });
    const data = await res.json();
    return data.access_token;
}

async function scanSingleKeyword(kw, token, targetId) {
    try {
        const url = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(kw)}&filter=itemLocationCountry:DE&limit=50`;
        const res = await fetch('https://corsproxy.io/?' + encodeURIComponent(url), {
            headers: { 'Authorization': `Bearer ${token}`, 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_DE' }
        });
        const data = await res.json();
        const items = data.itemSummaries || [];
        const total = data.total || 0;

        // Metriken berechnen
        const prices = items.map(i => parseFloat(i.price?.value || 0)).filter(p => p > 0);
        const minP = Math.min(...prices) || 0;
        const maxP = Math.max(...prices) || 0;
        const newCount = items.filter(i => i.conditionId === '1000' || i.condition === 'Neu').length;
        const newPercent = items.length > 0 ? Math.round((newCount / items.length) * 100) : 0;
        const thumb = items[0]?.image?.imageUrl || "";

        // Design Rendern
        let colorClass = total < 300 ? 'text-[#00ff41]' : (total < 1000 ? 'text-yellow-400' : 'text-red-500');
        let statusText = total < 300 ? 'TOP NISCHE' : (total < 1000 ? 'MITTEL' : 'ÜBERLAUFEN');

        document.getElementById(targetId).innerHTML = `
            <div class="bg-black/60 border border-green-900/50 p-3 shadow-[0_0_15px_rgba(0,255,65,0.05)]">
                <div class="flex justify-between items-center border-b border-green-900/50 pb-2 mb-3">
                    <strong class="text-sm text-white uppercase">${kw}</strong>
                    <span class="${colorClass} text-[9px] font-bold border border-current px-2 py-0.5 tracking-widest">${statusText}</span>
                </div>
                <div class="flex gap-4">
                    ${thumb ? `<img src="${thumb}" class="w-20 h-20 object-cover border border-green-700 bg-black">` : `<div class="w-20 h-20 border border-green-700 bg-black flex items-center justify-center text-[10px]">NO IMG</div>`}
                    <div class="flex-grow grid grid-cols-2 gap-2 text-[10px]">
                        <div><div class="opacity-50">KONKURRENZ</div><div class="text-white font-bold">${total.toLocaleString()}</div></div>
                        <div><div class="opacity-50">PREIS</div><div class="text-white font-bold">${minP.toFixed(2)}€ - ${maxP.toFixed(2)}€</div></div>
                        <div><div class="opacity-50">NEUWARE</div><div class="text-white font-bold">${newPercent}%</div></div>
                        <div class="text-[#00ff41] font-bold mt-1">>> SCAN OK</div>
                    </div>
                </div>
            </div>`;
    } catch (e) {
        document.getElementById(targetId).innerHTML = `<div class="text-red-500 text-[10px] p-2">FAILED: ${kw}</div>`;
    }
}
