// modules/sold-gap.js

window.startTrendScan = async function() {
    const input = document.getElementById("trend-input").value.trim();
    const out = document.getElementById("trend-results");
    const appId = localStorage.getItem("ai_dww_ebay_app_id");
    const certId = localStorage.getItem("ai_dww_ebay_cert_id");

    if (!input || !appId) return;
    out.innerHTML = `<div class='flex flex-col items-center justify-center mt-10 gap-2 animate-pulse'><div class='w-8 h-8 border-2 border-[#00ff41] border-t-transparent rounded-full animate-spin'></div><div class='text-[10px] uppercase'>Analysiere Profitabilität...</div></div>`;

    try {
        const credentials = btoa(`${appId}:${certId}`);
        const tokenRes = await fetch('https://corsproxy.io/?' + encodeURIComponent('https://api.ebay.com/identity/v1/oauth2/token'), {
            method: 'POST', headers: { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope'
        });
        const tokenData = await tokenRes.json();
        const token = tokenData.access_token;

        const url = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(input)}&filter=itemLocationCountry:DE&limit=50`;
        const res = await fetch('https://corsproxy.io/?' + encodeURIComponent(url), { headers: { 'Authorization': `Bearer ${token}`, 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_DE' } });
        const data = await res.json();
        const items = data.itemSummaries || [];
        const total = data.total || 0;

        if (items.length === 0) { out.innerHTML = "<div class='text-yellow-500 text-xs p-3'>Keine Ergebnisse gefunden.</div>"; return; }

        // Umfangreiche Analyse
        const prices = items.map(i => parseFloat(i.price?.value || 0)).filter(p => p > 0);
        const sorted = [...prices].sort((a,b) => a-b);
        const minP = sorted[0] || 0;
        const maxP = sorted[sorted.length-1] || 0;
        const median = sorted[Math.floor(sorted.length/2)] || 0;
        const avgP = prices.reduce((a,b) => a+b,0) / (prices.length || 1);

        const newP = Math.round((items.filter(i => i.conditionId === '1000').length / items.length) * 100);
        const shipP = Math.round((items.filter(i => i.shippingOptions?.some(o => o.shippingCost?.value === '0.00')).length / items.length) * 100);
        const domP = Math.round((items.filter(i => i.itemLocation?.country === 'DE').length / items.length) * 100);
        
        const feedbacks = items.map(i => i.seller?.feedbackScore || 0);
        const avgFeedback = feedbacks.length ? Math.round(feedbacks.reduce((a,b)=>a+b,0)/feedbacks.length) : 0;

        // Score
        let score = Math.round((total < 500 ? 40 : 10) + (median > 25 ? 30 : 10) + (newP < 70 ? 20 : 0) + (avgFeedback < 10000 ? 10 : 0));
        if (score > 100) score = 100;
        let status = score >= 70 ? "HIGH PROFIT" : (score >= 45 ? "MEDIUM MARGIN" : "LOW PROFIT / RED OCEAN");
        let color = score >= 70 ? "text-[#00ff41]" : (score >= 45 ? "text-yellow-400" : "text-red-500");
        let barColor = score >= 70 ? "bg-[#00ff41]" : (score >= 45 ? "bg-yellow-400" : "bg-red-500");

        out.innerHTML = `
            <div class="bg-black/60 border border-green-900/50 p-4 font-mono">
                <div class="border-b border-green-900/50 pb-2 mb-4 flex justify-between items-end">
                    <div>
                        <div class="text-[9px] text-green-500 uppercase tracking-widest">TARGET</div>
                        <div class="text-white font-bold uppercase">${input}</div>
                    </div>
                    <div class="text-right">
                        <div class="${color} text-[11px] font-black tracking-widest">${status}</div>
                    </div>
                </div>

                <div class="mb-5 bg-green-900/10 p-3 border border-green-900/30">
                    <div class="flex justify-between text-[10px] text-white mb-1">
                        <span>PROFIT SCORE</span><span class="font-bold">${score}/100</span>
                    </div>
                    <div class="w-full bg-black h-2 border border-green-900 overflow-hidden">
                        <div class="${barColor} h-full" style="width: ${score}%"></div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4 text-[11px] mb-4 border-b border-green-900/30 pb-4">
                    <div><div class="text-green-500/60 uppercase mb-0.5">MEDIAN PREIS</div><div class="text-lg text-white font-bold">${median.toFixed(2)}€</div></div>
                    <div><div class="text-green-500/60 uppercase mb-0.5">DURCHSCHNITT</div><div class="text-lg text-white">${avgP.toFixed(2)}€</div></div>
                    <div><div class="text-green-500/60 uppercase mb-0.5">MIN / MAX</div><div class="text-white">${minP.toFixed(2)}€ - ${maxP.toFixed(2)}€</div></div>
                    <div><div class="text-green-500/60 uppercase mb-0.5">WETTBEWERBER</div><div class="text-white">${total.toLocaleString()} aktiv</div></div>
                </div>

                <div class="space-y-3">
                    <div>
                        <div class="flex justify-between text-[9px] text-green-500 mb-0.5"><span>GRATIS VERSAND</span><span>${shipP}%</span></div>
                        <div class="w-full bg-green-900/30 h-1"><div class="bg-blue-400 h-full" style="width: ${shipP}%"></div></div>
                    </div>
                    <div>
                        <div class="flex justify-between text-[9px] text-green-500 mb-0.5"><span>DEUTSCHER STANDORT</span><span>${domP}%</span></div>
                        <div class="w-full bg-green-900/30 h-1"><div class="bg-yellow-400 h-full" style="width: ${domP}%"></div></div>
                    </div>
                    <div class="mt-2 text-[10px] flex justify-between items-center bg-black p-2 border border-green-900/50">
                        <span class="text-green-500/70">Ø Verkäufer Feedback:</span>
                        <span class="text-white font-bold">${avgFeedback.toLocaleString()}</span>
                    </div>
                </div>
            </div>`;
    } catch (e) { out.innerHTML = `<div class="text-red-500 p-4 text-xs">SYSTEM_ERROR</div>`; }
}
