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

    resultsDiv.innerHTML = `<div class='flex justify-center mt-10'><div class='w-8 h-8 border-2 border-[#00ff41] border-t-transparent rounded-full animate-spin'></div></div>`;

    try {
        const token = await generateLiveToken(appId, certId);
        // Wir ziehen 50 Ergebnisse für maximale Datenqualität
        const searchUrl = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(kw)}&filter=itemLocationCountry:DE&limit=50`;
        const res = await fetch('https://corsproxy.io/?' + encodeURIComponent(searchUrl), { headers: { 'Authorization': `Bearer ${token}`, 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_DE' } });
        const data = await res.json();
        
        const items = data.itemSummaries || [];
        if (items.length === 0) { resultsDiv.innerHTML = "<div class='text-yellow-500 text-xs p-3'>Keine Ergebnisse gefunden.</div>"; return; }

        const totalItems = data.total || 0;
        
        // Arrays für Berechnungen
        let prices = [];
        let feedbackScores = [];
        let freeShipping = 0;
        let isBuyItNow = 0;
        let domesticLocation = 0;
        let newCondition = 0;

        items.forEach(i => {
            // Preise
            if (i.price && i.price.value) prices.push(parseFloat(i.price.value));
            // Verkäufer Feedback (Stärke)
            if (i.seller && i.seller.feedbackScore) feedbackScores.push(parseInt(i.seller.feedbackScore));
            // Gratis Versand
            if (i.shippingOptions && i.shippingOptions.some(opt => opt.shippingCost?.value === '0.00' || opt.shippingCost?.value === '0.0')) freeShipping++;
            // Verkaufsformat (Sofort-Kaufen vs Auktion)
            if (i.buyingOptions && i.buyingOptions.includes('FIXED_PRICE')) isBuyItNow++;
            // Standort (Echt DE oder ausländischer Account)
            if (i.itemLocation && i.itemLocation.country === 'DE') domesticLocation++;
            // Zustand
            if (i.conditionId === '1000' || i.condition === 'New' || i.condition === 'Neu') newCondition++;
        });

        // Mathe-Berechnungen
        prices.sort((a, b) => a - b);
        const minP = prices[0] || 0;
        const maxP = prices[prices.length - 1] || 0;
        const avgP = prices.reduce((a, b) => a + b, 0) / (prices.length || 1);
        const medianP = prices[Math.floor(prices.length / 2)] || 0; // Median filtert extreme Ausreißer besser als Durchschnitt
        
        const avgFeedback = feedbackScores.length > 0 ? Math.round(feedbackScores.reduce((a, b) => a + b, 0) / feedbackScores.length) : 0;
        
        // Prozentwerte
        const pctFreeShip = Math.round((freeShipping / items.length) * 100);
        const pctBuyNow = Math.round((isBuyItNow / items.length) * 100);
        const pctDomestic = Math.round((domesticLocation / items.length) * 100);
        const pctNew = Math.round((newCondition / items.length) * 100);

        // --- PROFIT-SCORE BERECHNUNG (Verbessert) ---
        let score = 0;
        if (medianP > 20) score += 30; // Gute Marge
        if (totalItems < 500) score += 30; // Geringe Konkurrenz
        if (pctNew < 70) score += 20; // Viele private/gebrauchte Konkurrenten = leicht zu schlagen
        if (avgFeedback < 10000) score += 20; // Keine übermächtigen Mega-Shops

        let rating = score >= 70 ? "HIGH PROFIT" : (score >= 40 ? "MEDIUM" : "LOW MARGIN");
        let ratingColor = score >= 70 ? "text-[#00ff41]" : (score >= 40 ? "text-yellow-400" : "text-red-500");

        resultsDiv.innerHTML = `
            <div class="bg-black/60 border border-green-900/50 relative overflow-hidden flex flex-col shadow-[0_0_20px_rgba(0,255,65,0.05)]">
                <div class="absolute top-0 left-0 h-1 bg-[#00ff41]" style="width: ${score}%"></div>
                
                <div class="p-4 border-b border-green-900/50 bg-green-900/10 flex justify-between items-end">
                    <div>
                        <div class="text-[9px] text-green-500 tracking-widest uppercase">Target: ${kw}</div>
                        <div class="${ratingColor} text-xl font-black tracking-tighter">${rating}</div>
                    </div>
                    <div class="text-right">
                        <div class="text-[9px] text-green-500 uppercase">Score</div>
                        <div class="text-white font-bold text-lg">${score}/100</div>
                    </div>
                </div>

                <div class="p-4 space-y-4">
                    <div>
                        <div class="text-[10px] text-green-500/80 border-b border-green-900/30 pb-1 mb-2 uppercase tracking-wider">1. Preis Analyse</div>
                        <div class="grid grid-cols-2 gap-2 text-[11px]">
                            <div class="flex justify-between"><span class="opacity-70">Durchschnitt:</span><span class="text-white">${avgP.toFixed(2)}€</span></div>
                            <div class="flex justify-between"><span class="opacity-70">Median (Mitte):</span><strong class="text-white">${medianP.toFixed(2)}€</strong></div>
                            <div class="flex justify-between"><span class="opacity-70">Günstigstes:</span><span class="text-white">${minP.toFixed(2)}€</span></div>
                            <div class="flex justify-between"><span class="opacity-70">Teuerstes:</span><span class="text-white">${maxP.toFixed(2)}€</span></div>
                        </div>
                    </div>

                    <div>
                        <div class="text-[10px] text-green-500/80 border-b border-green-900/30 pb-1 mb-2 uppercase tracking-wider">2. Markt-Struktur (Top 50)</div>
                        <div class="grid grid-cols-2 gap-2 text-[11px]">
                            <div class="flex justify-between"><span class="opacity-70">Konkurrenz total:</span><strong class="text-white">${totalItems.toLocaleString('de-DE')}</strong></div>
                            <div class="flex justify-between"><span class="opacity-70">Zustand Neu:</span><span class="text-white">${pctNew}%</span></div>
                            <div class="flex justify-between"><span class="opacity-70">Gratis Versand:</span><span class="text-white">${pctFreeShip}%</span></div>
                            <div class="flex justify-between"><span class="opacity-70">Standort DE:</span><span class="text-white">${pctDomestic}%</span></div>
                        </div>
                    </div>

                    <div>
                        <div class="text-[10px] text-green-500/80 border-b border-green-900/30 pb-1 mb-2 uppercase tracking-wider">3. Gegner-Profil</div>
                        <div class="text-[11px] flex justify-between items-center mb-1">
                            <span class="opacity-70">Ø Verkäufer-Bewertungen:</span>
                            <span class="text-white">${avgFeedback.toLocaleString('de-DE')}</span>
                        </div>
                        <div class="text-[9px] text-green-500/60 leading-tight">
                            ${avgFeedback > 50000 ? "WARNUNG: Nische wird von riesigen Mega-Shops dominiert." : (avgFeedback > 5000 ? "Mittleres Level. Etablierte Händler vorhanden." : "CHANCE: Viele kleine Händler. Leicht mit gutem SEO zu überbieten.")}
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (e) { resultsDiv.innerHTML = `<div class='text-red-500 p-4 text-xs font-mono border border-red-900 bg-red-900/20'>FEHLER: ${e.message}</div>`; }
}
