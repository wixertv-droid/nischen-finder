// modules/ebay-finder.js

window.startNischenScan = async function() {
    const inputField = document.getElementById('nischen-input');
    const resultsDiv = document.getElementById('nischen-results');
    const text = inputField.value.trim();
    const appId = localStorage.getItem('ai_dww_ebay_app_id');
    const certId = localStorage.getItem('ai_dww_ebay_cert_id');

    if (!appId || !text) return;

    // Wenn der Platzhalter-Text noch da ist, entfernen wir ihn
    if (resultsDiv.innerHTML.includes("System ready")) {
        resultsDiv.innerHTML = '';
    }

    const keywords = text.split('\n').map(k => k.trim()).filter(k => k.length > 0);
    
    // Temporärer Lade-Indikator
    const loadId = 'load-' + Date.now();
    resultsDiv.insertAdjacentHTML('afterbegin', `<div id="${loadId}" class='flex flex-col items-center justify-center my-4 gap-2 animate-pulse'><div class='w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin'></div><div class='text-[10px] uppercase text-green-500'>eBay Live Uplink...</div></div>`);

    try {
        const credentials = btoa(`${appId}:${certId}`);
        const tokenRes = await fetch('https://corsproxy.io/?' + encodeURIComponent('https://api.ebay.com/identity/v1/oauth2/token'), {
            method: 'POST', headers: { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope'
        });
        const tokenData = await tokenRes.json();
        const token = tokenData.access_token;

        document.getElementById(loadId).remove(); // Lade-Indikator entfernen

        for (let kw of keywords) {
            const id = `res-${Date.now()}-${Math.floor(Math.random()*1000)}`;
            // NEUE ERGEBNISSE OBEN ANFÜGEN
            resultsDiv.insertAdjacentHTML('afterbegin', `<div id="${id}" class="border-l-2 border-green-800 bg-black/40 p-4 mb-4 text-xs text-green-700 animate-pulse">Scanne Datenbank: ${kw}...</div>`);
            scanSingleKeyword(kw, token, id);
        }
    } catch (e) { document.getElementById(loadId).innerHTML = `<div class="text-red-500 p-2 text-xs">TOKEN_ERROR: ${e.message}</div>`; }
}

async function scanSingleKeyword(kw, token, targetId) {
    try {
        const url = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(kw)}&filter=itemLocationCountry:DE&limit=50`;
        const res = await fetch('https://corsproxy.io/?' + encodeURIComponent(url), { headers: { 'Authorization': `Bearer ${token}`, 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_DE' } });
        const data = await res.json();
        const items = data.itemSummaries || [];
        const total = data.total || 0;

        const prices = items.map(i => parseFloat(i.price?.value || 0)).filter(p => p > 0);
        const minP = prices.length ? Math.min(...prices) : 0;
        const maxP = prices.length ? Math.max(...prices) : 0;
        
        const newCount = items.filter(i => i.conditionId === '1000' || i.condition === 'New' || i.condition === 'Neu').length;
        const newPercent = items.length > 0 ? Math.round((newCount / items.length) * 100) : 0;
        const usedPercent = 100 - newPercent;
        
        const freeShipCount = items.filter(i => i.shippingOptions && i.shippingOptions.some(opt => opt.shippingCost?.value === '0.00')).length;
        const shipPercent = items.length > 0 ? Math.round((freeShipCount / items.length) * 100) : 0;

        // NEUE METRIKEN
        const buyItNowCount = items.filter(i => i.buyingOptions && i.buyingOptions.includes('FIXED_PRICE')).length;
        const buyItNowPercent = items.length > 0 ? Math.round((buyItNowCount / items.length) * 100) : 0;
        const topRatedCount = items.filter(i => parseFloat(i.seller?.feedbackPercentage || 0) >= 99.0).length;
        const topRatedPercent = items.length > 0 ? Math.round((topRatedCount / items.length) * 100) : 0;

        const thumb = items[0]?.image?.imageUrl || "";
        let colorClass = total < 300 ? 'text-[#00ff41]' : (total < 1000 ? 'text-yellow-400' : 'text-red-500');
        
        let textVerdict = total > 1000 ? "Sehr überlaufen." : (newPercent < 50 ? "Marktlücke für Neuware!" : "Solides Potenzial.");

        document.getElementById(targetId).innerHTML = `
            <div class="bg-black/60 border border-green-900/50 p-3 shadow-[0_0_15px_rgba(0,255,65,0.05)]">
                <div class="flex justify-between items-start border-b border-green-900/50 pb-2 mb-3">
                    <strong class="text-sm text-white uppercase">${kw}</strong>
                    <span class="${colorClass} text-[10px] font-bold tracking-widest bg-black px-2 py-0.5 border border-current">${total.toLocaleString()} AKTIV</span>
                </div>
                
                <div class="flex gap-4 mb-3">
                    ${thumb ? `<img src="${thumb}" class="w-20 h-20 object-cover border border-green-700 bg-black flex-shrink-0">` : `<div class="w-20 h-20 border border-green-700 bg-black flex items-center justify-center text-[10px] flex-shrink-0">NO IMG</div>`}
                    <div class="flex-grow grid grid-cols-2 gap-x-2 gap-y-2 text-[10px]">
                        <div><div class="opacity-50 text-green-500">MIN PREIS</div><div class="text-white font-bold">${minP.toFixed(2)}€</div></div>
                        <div><div class="opacity-50 text-green-500">MAX PREIS</div><div class="text-white font-bold">${maxP.toFixed(2)}€</div></div>
                        <div><div class="opacity-50 text-green-500">GRATIS VERSAND</div><div class="text-white font-bold">${shipPercent}%</div></div>
                        <div><div class="opacity-50 text-green-500">FESTPREIS (KAUFEN)</div><div class="text-white font-bold">${buyItNowPercent}%</div></div>
                    </div>
                </div>

                <div class="border-t border-green-900/30 pt-3 space-y-2">
                    <div>
                        <div class="text-[9px] text-green-500 mb-0.5 flex justify-between"><span>STRUKTUR: NEUWARE</span><span>${newPercent}%</span></div>
                        <div class="flex w-full h-1.5 bg-gray-800 rounded-full overflow-hidden border border-green-900">
                            <div class="bg-[#00ff41]" style="width: ${newPercent}%"></div>
                            <div class="bg-yellow-600" style="width: ${usedPercent}%"></div>
                        </div>
                    </div>
                    <div>
                        <div class="text-[9px] text-green-500 mb-0.5 flex justify-between"><span>GEGNER: TOP-BEWERTET (>99%)</span><span>${topRatedPercent}%</span></div>
                        <div class="flex w-full h-1.5 bg-gray-800 rounded-full overflow-hidden border border-green-900">
                            <div class="bg-red-500" style="width: ${topRatedPercent}%"></div>
                        </div>
                    </div>
                </div>
                <div class="mt-3 text-[10px] text-green-400 italic">>> ${textVerdict}</div>
            </div>`;
    } catch (e) { document.getElementById(targetId).innerHTML = `<div class="text-red-500 text-[10px] p-2">FEHLER: ${kw} konnte nicht geladen werden.</div>`; }
}
