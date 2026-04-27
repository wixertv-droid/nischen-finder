// modules/ebay-finder.js

window.startNischenScan = async function() {
    const inputField = document.getElementById('nischen-input');
    const resultsDiv = document.getElementById('nischen-results');
    const text = inputField.value.trim();
    const appId = localStorage.getItem('ai_dww_ebay_app_id');
    const certId = localStorage.getItem('ai_dww_ebay_cert_id');

    if (!appId || !text) return;

    // Platzhalter entfernen
    if (resultsDiv.innerHTML.includes("System ready")) {
        resultsDiv.innerHTML = '';
    }

    const keywords = text.split('\n').map(k => k.trim()).filter(k => k.length > 0);
    
    // RUHIGER Lade-Indikator (KEIN Blinken mehr!)
    const loadId = 'load-' + Date.now();
    resultsDiv.insertAdjacentHTML('afterbegin', `
        <div id="${loadId}" class='flex flex-col items-center justify-center my-6 gap-3'>
            <div class='w-8 h-8 border-2 border-[#00ff41] border-t-transparent rounded-full animate-spin'></div>
            <div class='text-xs uppercase tracking-widest text-[#00ff41]'>Stelle Uplink her...</div>
        </div>
    `);

    try {
        const credentials = btoa(`${appId}:${certId}`);
        const tokenRes = await fetch('https://corsproxy.io/?' + encodeURIComponent('https://api.ebay.com/identity/v1/oauth2/token'), {
            method: 'POST', headers: { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope'
        });
        const tokenData = await tokenRes.json();
        const token = tokenData.access_token;

        document.getElementById(loadId).remove(); 

        for (let kw of keywords) {
            const id = `res-${Date.now()}-${Math.floor(Math.random()*1000)}`;
            // Platzhalter ohne Blinken
            resultsDiv.insertAdjacentHTML('afterbegin', `<div id="${id}" class="border-l-2 border-green-800 bg-black/40 p-4 mb-6 text-xs text-green-700">Lade und berechne Daten für: ${kw}...</div>`);
            scanSingleKeyword(kw, token, id);
        }
    } catch (e) { 
        document.getElementById(loadId).innerHTML = `<div class="text-red-500 p-2 text-xs">TOKEN_ERROR: ${e.message}</div>`; 
    }
}

async function scanSingleKeyword(kw, token, targetId) {
    try {
        const url = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(kw)}&filter=itemLocationCountry:DE&limit=50`;
        const res = await fetch('https://corsproxy.io/?' + encodeURIComponent(url), { headers: { 'Authorization': `Bearer ${token}`, 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_DE' } });
        const data = await res.json();
        const items = data.itemSummaries || [];
        const total = data.total || 0;

        // PREIS ANALYSE
        const prices = items.map(i => parseFloat(i.price?.value || 0)).filter(p => p > 0);
        const minP = prices.length ? Math.min(...prices) : 0;
        const maxP = prices.length ? Math.max(...prices) : 0;
        const sorted = [...prices].sort((a,b) => a-b);
        const medianP = sorted.length ? sorted[Math.floor(sorted.length/2)] : 0;
        
        // MARKT STRUKTUR
        const newCount = items.filter(i => i.conditionId === '1000' || i.condition === 'New' || i.condition === 'Neu').length;
        const newPercent = items.length > 0 ? Math.round((newCount / items.length) * 100) : 0;
        
        const freeShipCount = items.filter(i => i.shippingOptions && i.shippingOptions.some(opt => opt.shippingCost?.value === '0.00')).length;
        const shipPercent = items.length > 0 ? Math.round((freeShipCount / items.length) * 100) : 0;

        const buyItNowCount = items.filter(i => i.buyingOptions && i.buyingOptions.includes('FIXED_PRICE')).length;
        const buyItNowPercent = items.length > 0 ? Math.round((buyItNowCount / items.length) * 100) : 0;

        // GEGNER ANALYSE (Neu hinzugefügt)
        const topRatedCount = items.filter(i => parseFloat(i.seller?.feedbackPercentage || 0) >= 99.0).length;
        const topRatedPercent = items.length > 0 ? Math.round((topRatedCount / items.length) * 100) : 0;
        
        const domesticCount = items.filter(i => i.itemLocation?.country === 'DE').length;
        const domesticPercent = items.length > 0 ? Math.round((domesticCount / items.length) * 100) : 0;

        const returnsCount = items.filter(i => i.returnTerms?.returnsAccepted === true || String(i.returnTerms?.returnsAccepted).toLowerCase() === 'true').length;
        const returnsPercent = items.length > 0 ? Math.round((returnsCount / items.length) * 100) : 0;

        const avgFeedback = items.length ? Math.round(items.reduce((acc, i) => acc + (parseInt(i.seller?.feedbackScore) || 0), 0) / items.length) : 0;

        const thumb = items[0]?.image?.imageUrl || "";
        let colorClass = total < 300 ? 'text-[#00ff41]' : (total < 1000 ? 'text-yellow-400' : 'text-red-500');
        
        // KI Urteil
        let textVerdict = "";
        if (total > 1000) textVerdict = "Roter Ozean. Hohe Sättigung, starker Wettbewerb.";
        else if (newPercent < 50) textVerdict = "Hoher Gebrauchtwaren-Anteil. Chance für professionelles Neuwaren-Listing!";
        else if (domesticPercent < 50) textVerdict = "Viele ausländische Händler. Mit schnellem DE-Versand gewinnst du hier.";
        else textVerdict = "Solider Markt. Nutze SEO und gute Bilder zur Differenzierung.";

        document.getElementById(targetId).innerHTML = `
            <div class="bg-black/80 border border-green-900/50 p-4 shadow-[0_0_20px_rgba(0,255,65,0.05)] mb-6 font-mono">
                <div class="flex justify-between items-start border-b-2 border-green-800 pb-3 mb-4">
                    <strong class="text-base text-white uppercase tracking-widest">${kw}</strong>
                    <span class="${colorClass} text-[10px] font-bold tracking-widest bg-black px-2 py-1 border border-current">${total.toLocaleString()} AKTIVE LISTINGS</span>
                </div>
                
                <div class="flex gap-4 mb-5">
                    ${thumb ? `<img src="${thumb}" class="w-24 h-24 object-cover border border-green-700 bg-black flex-shrink-0">` : `<div class="w-24 h-24 border border-green-700 bg-black flex items-center justify-center text-[10px] flex-shrink-0">NO IMG</div>`}
                    
                    <div class="flex-grow grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                        <div class="bg-green-900/10 p-2 border border-green-900/30">
                            <div class="opacity-60 text-green-500 text-[9px] mb-1">PREISSPANNE (MIN - MAX)</div>
                            <div class="text-white font-bold">${minP.toFixed(2)}€ - ${maxP.toFixed(2)}€</div>
                        </div>
                        <div class="bg-green-900/10 p-2 border border-[#00ff41]/30">
                            <div class="opacity-80 text-[#00ff41] text-[9px] mb-1">MEDIAN-PREIS (MITTE)</div>
                            <div class="text-white font-bold text-sm">${medianP.toFixed(2)}€</div>
                        </div>
                        <div class="bg-green-900/10 p-2 border border-green-900/30">
                            <div class="opacity-60 text-green-500 text-[9px] mb-1">FESTPREIS-RATE</div>
                            <div class="text-white font-bold">${buyItNowPercent}% <span class="text-[9px] font-normal opacity-70">Sofort-Kauf</span></div>
                        </div>
                        <div class="bg-green-900/10 p-2 border border-green-900/30">
                            <div class="opacity-60 text-green-500 text-[9px] mb-1">ZUSTAND</div>
                            <div class="text-white font-bold">${newPercent}% <span class="text-[9px] font-normal opacity-70">Neuware</span></div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4 border-t border-green-900/40 pt-4 mb-4">
                    <div>
                        <div class="text-[10px] text-green-400 tracking-widest uppercase border-b border-green-900/50 pb-1 mb-2">Logistik & Angebot</div>
                        <div class="space-y-2 text-[11px]">
                            <div class="flex justify-between">
                                <span class="text-green-500/70">Standort DE:</span>
                                <span class="text-white font-bold">${domesticPercent}%</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-green-500/70">Gratis Versand:</span>
                                <span class="text-white font-bold">${shipPercent}%</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-green-500/70">Retouren akz.:</span>
                                <span class="text-white font-bold">${returnsPercent}%</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div class="text-[10px] text-yellow-500 tracking-widest uppercase border-b border-yellow-900/50 pb-1 mb-2">Gegner-Radar</div>
                        <div class="space-y-2 text-[11px]">
                            <div class="flex justify-between items-center">
                                <span class="text-yellow-500/70">Top-Rated Seller:</span>
                                <span class="text-white font-bold">${topRatedPercent}%</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-yellow-500/70">Ø Bewertungen:</span>
                                <span class="text-white font-bold">${avgFeedback.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-green-900/20 border-l-2 border-[#00ff41] p-3 text-[11px] text-green-300 leading-relaxed">
                    <strong class="text-white">>> KI-Systemanalyse:</strong> ${textVerdict}
                </div>
            </div>`;
    } catch (e) { 
        document.getElementById(targetId).innerHTML = `
            <div class="text-red-500 text-xs p-3 bg-red-900/20 border border-red-900 mb-6">
                FEHLER: Daten für '${kw}' konnten nicht abgerufen werden.
            </div>`; 
    }
}
