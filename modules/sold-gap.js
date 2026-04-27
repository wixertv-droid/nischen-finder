// modules/sold-gap.js

async function generateLiveToken(appId, certId) {
    const credentials = btoa(`${appId}:${certId}`);
    const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent('https://api.ebay.com/identity/v1/oauth2/token');
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('scope', 'https://api.ebay.com/oauth/api_scope');
    const response = await fetch(proxyUrl, { method: 'POST', headers: { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: params.toString() });
    const data = await response.json();
    return data.access_token;
}

async function startTrendScan() {
    const resultsDiv = document.getElementById('trend-results');
    const kw = document.getElementById('trend-input').value.trim();
    const appId = localStorage.getItem('ai_dww_ebay_app_id');
    const certId = localStorage.getItem('ai_dww_ebay_cert_id');

    if (!kw || !appId) return;

    resultsDiv.innerHTML = `<div class='flex justify-center mt-10 animate-spin'><div class='w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full'></div></div>`;

    try {
        const token = await generateLiveToken(appId, certId);
        const searchUrl = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(kw)}&filter=itemLocationCountry:DE&limit=50`;
        const res = await fetch('https://corsproxy.io/?' + encodeURIComponent(searchUrl), { headers: { 'Authorization': `Bearer ${token}`, 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_DE' } });
        const data = await res.json();
        
        const items = data.itemSummaries || [];
        if (items.length === 0) { resultsDiv.innerHTML = "Keine Daten."; return; }

        const prices = items.map(i => parseFloat(i.price.value));
        const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
        const totalItems = data.total || 0;

        // --- DIE NEUE KLARHEITS-BEWERTUNG ---
        let score = 0;
        if (avg > 25) score += 40; // Gute Marge
        if (totalItems < 500) score += 40; // Wenig Konkurrenz
        if (avg > 10 && avg < 25) score += 20;

        let rating = score > 60 ? "HIGH PROFIT" : (score > 30 ? "MEDIUM" : "LOW MARGIN");
        let ratingColor = score > 60 ? "text-[#00ff41]" : (score > 30 ? "text-yellow-400" : "text-red-500");

        resultsDiv.innerHTML = `
            <div class="bg-black/60 border border-green-900/50 p-4 relative overflow-hidden">
                <div class="absolute top-0 left-0 h-1 bg-green-500" style="width: ${score}%"></div>
                
                <div class="flex justify-between items-end mb-4">
                    <div>
                        <div class="text-[10px] opacity-50 uppercase">Markt-Urteil</div>
                        <div class="${ratingColor} text-xl font-black tracking-tighter">${rating}</div>
                    </div>
                    <div class="text-right">
                        <div class="text-[10px] opacity-50 uppercase">Score</div>
                        <div class="text-white font-bold">${score}/100</div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4 border-t border-green-900/30 pt-4">
                    <div>
                        <div class="text-[9px] text-green-500 opacity-60 uppercase">Ø Verkaufspreis</div>
                        <div class="text-lg text-white font-mono">${avg.toFixed(2)}€</div>
                    </div>
                    <div>
                        <div class="text-[9px] text-green-500 opacity-60 uppercase">Konkurrenz</div>
                        <div class="text-lg text-white font-mono">${totalItems}</div>
                    </div>
                </div>

                <div class="mt-4 p-2 bg-green-900/10 border border-green-900/30 text-[10px] text-green-400 italic">
                    ${score > 60 ? ">> Analyse: Dieser Markt ist unterbesetzt. Hohe Wahrscheinlichkeit für schnellen Abverkauf bei gutem Listing." : ">> Analyse: Hoher Preiskampf oder zu geringe Marge. Prüfe Beschaffungskosten genau."}
                </div>
            </div>
        `;
    } catch (e) { resultsDiv.innerHTML = "Fehler."; }
}
