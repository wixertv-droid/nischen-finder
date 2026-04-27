// modules/ebay-finder.js

async function generateLiveToken(appId, certId) {
    const credentials = btoa(`${appId}:${certId}`);
    const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent('https://api.ebay.com/identity/v1/oauth2/token');
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('scope', 'https://api.ebay.com/oauth/api_scope');

    const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
    });
    if (!response.ok) throw new Error(`Token Error: ${response.status}`);
    const data = await response.json();
    return data.access_token;
}

async function startNischenScan() {
    const resultsDiv = document.getElementById('nischen-results');
    try {
        const inputField = document.getElementById('nischen-input');
        const text = inputField.value.trim();
        const appId = localStorage.getItem('ai_dww_ebay_app_id');
        const certId = localStorage.getItem('ai_dww_ebay_cert_id');

        if (!appId || !certId) {
            resultsDiv.innerHTML = "<div class='text-red-500 text-xs border border-red-900 p-3 bg-red-900/20 text-center mt-4'>[ERR] KEYS FEHLEN.</div>";
            return;
        }
        if (!text) return;

        const keywords = text.split('\n').map(k => k.trim()).filter(k => k.length > 0);
        
        // Ruhigere Ladeanimation (ohne starkes Blinken)
        resultsDiv.innerHTML = `<div class='flex flex-col items-center justify-center mt-8 gap-3'><div class='w-8 h-8 border-2 border-[#00ff41] border-t-transparent rounded-full animate-spin'></div><div class='text-xs uppercase text-[#00ff41] tracking-widest'>Verbindung steht. Lade Daten...</div></div>`;

        const token = await generateLiveToken(appId, certId);
        resultsDiv.innerHTML = ''; 

        // Platzhalter ohne Blinken, etwas größer
        for (let kw of keywords) {
            const id = `res-${btoa(encodeURIComponent(kw)).replace(/=/g, '')}`;
            resultsDiv.innerHTML += `<div id="${id}" class="border-l-2 border-green-800 bg-black/60 p-4 mb-4 text-xs text-green-600 flex justify-center items-center">Analysiere Nische: ${kw}...</div>`;
        }

        for (let kw of keywords) {
            const id = `res-${btoa(encodeURIComponent(kw)).replace(/=/g, '')}`;
            try {
                const targetUrl = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(kw)}&filter=itemLocationCountry:DE&limit=50`;
                const proxySearchUrl = 'https://corsproxy.io/?' + encodeURIComponent(targetUrl);
                
                const res = await fetch(proxySearchUrl, {
                    headers: { 'Authorization': `Bearer ${token}`, 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_DE' }
                });
                const data = await res.json();
                const totalItems = data.total || 0;
                const items = data.itemSummaries || [];

                let minP = 0, maxP = 0, newC = 0, freeShipC = 0, thumb = "";
                
                if (items.length > 0) {
                    const prices = items.map(i => parseFloat(i.price?.value || 0)).filter(p => p > 0);
                    if(prices.length > 0) {
                        minP = Math.min(...prices);
                        maxP = Math.max(...prices);
                    }
                    
                    items.forEach(i => {
                        if (i.conditionId === '1000' || i.condition === 'New' || i.condition === 'Neu') newC++;
                        if (i.shippingOptions && i.shippingOptions.some(opt => opt.shippingCost?.value === '0.00' || opt.shippingCost?.value === '0.0')) freeShipC++;
                    });
                    
                    if(items[0].image && items[0].image.imageUrl) thumb = items[0].image.imageUrl;
                }

                const newPercent = items.length > 0 ? Math.round((newC / items.length) * 100) : 0;
                const shipPercent = items.length > 0 ? Math.round((freeShipC / items.length) * 100) : 0;
                
                // Farbcodes für Konkurrenz
                let colorClass = totalItems < 300 ? 'text-[#00ff41]' : (totalItems < 1000 ? 'text-yellow-400' : 'text-red-500');
                let tagText = totalItems < 300 ? 'TOP NISCHE' : (totalItems < 1000 ? 'MODERAT' : 'ÜBERLAUFEN');

                // Ausformuliertes KI-Urteil
                let analyseText = "";
                if (totalItems > 1000) {
                    analyseText = "Vorsicht: Dieser Markt ist extrem dicht besiedelt. Du brauchst ein herausragendes Listing oder einen sehr guten Preis, um hier noch aufzufallen.";
                } else if (newPercent < 50 && totalItems > 0) {
                    analyseText = "Starkes Potenzial! Viele private Verkäufer (Gebrauchtware). Mit einem professionellen Shop und Neuware kannst du diese Nische leicht dominieren.";
                } else if (totalItems < 300 && totalItems > 0) {
                    analyseText = "Sehr geringe Konkurrenz! Wenn ausreichend Suchvolumen vorhanden ist, solltest du diese Nische sofort besetzen.";
                } else {
                    analyseText = "Solider, umkämpfter Markt. Ein Großteil sind gewerbliche Händler. Achte auf gute Produktbilder, um dich abzuheben.";
                }

                document.getElementById(id).innerHTML = `
                    <div class="bg-black/60 border border-green-900/50 p-3 mb-4 shadow-[0_0_15px_rgba(0,255,65,0.05)] relative">
                        
                        <div class="flex justify-between items-start border-b border-green-900/50 pb-2 mb-3">
                            <strong class="text-sm md:text-base text-white tracking-wide uppercase pr-2">${kw}</strong>
                            <span class="${colorClass} text-[10px] font-bold border border-current px-2 py-1 rounded-sm tracking-widest whitespace-nowrap">${tagText}</span>
                        </div>
                        
                        <div class="flex gap-4">
                            ${thumb ? `<img src="${thumb}" class="w-20 h-20 object-cover border border-green-700 bg-black flex-shrink-0">` : `<div class="w-20 h-20 border border-green-700 bg-black flex items-center justify-center text-[10px] text-green-800 flex-shrink-0">NO IMG</div>`}
                            
                            <div class="flex-grow grid grid-cols-2 gap-x-2 gap-y-3">
                                <div>
                                    <div class="text-[10px] text-green-500 uppercase opacity-80 mb-0.5">Konkurrenz</div>
                                    <div class="text-sm font-bold text-white">${totalItems.toLocaleString('de-DE')} <span class="text-[10px] font-normal text-green-600">aktiv</span></div>
                                </div>
                                <div>
                                    <div class="text-[10px] text-green-500 uppercase opacity-80 mb-0.5">Preis-Range</div>
                                    <div class="text-sm font-bold text-white">${minP.toFixed(2)} - ${maxP.toFixed(2)}€</div>
                                </div>
                                <div>
                                    <div class="text-[10px] text-green-500 uppercase opacity-80 mb-0.5">Neuware</div>
                                    <div class="text-sm font-bold text-white">${newPercent}%</div>
                                </div>
                                <div>
                                    <div class="text-[10px] text-green-500 uppercase opacity-80 mb-0.5">Gratis Versand</div>
                                    <div class="text-sm font-bold text-white">${shipPercent}%</div>
                                </div>
                            </div>
                        </div>

                        <div class="mt-4 bg-green-900/10 border-l-2 border-[#00ff41] p-3 text-xs text-green-400 leading-relaxed">
                            <span class="font-bold text-white block mb-1">>> SYSTEM-ANALYSE:</span>
                            ${analyseText}
                        </div>
                    </div>
                `;
            } catch (e) { 
                document.getElementById(id).innerHTML = `
                    <div class="bg-black/60 border border-red-900/50 p-3 mb-4 text-xs">
                        <strong class="text-white uppercase">${kw}</strong>
                        <div class="text-red-500 mt-2">ABFRAGE FEHLGESCHLAGEN: ${e.message}</div>
                    </div>
                `; 
            }
        }
    } catch (f) { 
        resultsDiv.innerHTML = `<div class='text-red-500 p-4 text-xs font-mono border border-red-900 bg-red-900/20'>${f.message}</div>`; 
    }
}
