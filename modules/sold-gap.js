// modules/sold-gap.js

window.startTrendScan = async function() {
    const input = document.getElementById("trend-input").value.trim();
    const resultsDiv = document.getElementById("trend-results");
    const appId = localStorage.getItem("ai_dww_ebay_app_id");
    const certId = localStorage.getItem("ai_dww_ebay_cert_id");

    if (!input || !appId) return;
    if (resultsDiv.innerHTML.includes("System ready")) resultsDiv.innerHTML = '';

    const loadId = 'load-' + Date.now();
    resultsDiv.insertAdjacentHTML('afterbegin', `<div id="${loadId}" class='flex flex-col items-center justify-center my-6 gap-3'><div class='w-8 h-8 border-2 border-[#00ff41] border-t-transparent rounded-full animate-spin'></div><div class='text-[10px] uppercase text-[#00ff41] tracking-widest'>Analysiere Profitabilität...</div></div>`);
    sessionStorage.setItem('dww_trend_html', resultsDiv.innerHTML);

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
        document.getElementById(loadId).remove();
        
        const items = data.itemSummaries || [];
        const total = data.total || 0;

        if (items.length === 0) { 
            resultsDiv.insertAdjacentHTML('afterbegin', `<div class='text-yellow-500 text-xs p-3 border border-yellow-900/50 mb-4 bg-black/60'>Keine Ergebnisse für: ${input}</div>`); 
            sessionStorage.setItem('dww_trend_html', resultsDiv.innerHTML);
            return; 
        }

        const prices = items.map(i => parseFloat(i.price?.value || 0)).filter(p => p > 0);
        const sorted = [...prices].sort((a,b) => a-b);
        const minP = sorted[0] || 0; const maxP = sorted[sorted.length-1] || 0; const median = sorted[Math.floor(sorted.length/2)] || 0;
        const newP = Math.round((items.filter(i => i.conditionId === '1000').length / items.length) * 100);
        const shipP = Math.round((items.filter(i => i.shippingOptions?.some(o => o.shippingCost?.value === '0.00')).length / items.length) * 100);
        const domP = Math.round((items.filter(i => i.itemLocation?.country === 'DE').length / items.length) * 100);
        const buyItNowP = Math.round((items.filter(i => i.buyingOptions && i.buyingOptions.includes('FIXED_PRICE')).length / items.length) * 100);
        const feedbacks = items.map(i => i.seller?.feedbackScore || 0);
        const avgFeedback = feedbacks.length ? Math.round(feedbacks.reduce((a,b)=>a+b,0)/feedbacks.length) : 0;
        const fbPercents = items.map(i => parseFloat(i.seller?.feedbackPercentage || 0)).filter(p => p > 0);
        const avgFBPerc = fbPercents.length ? (fbPercents.reduce((a,b)=>a+b,0)/fbPercents.length).toFixed(1) : 0;

        let score = Math.round((total < 500 ? 40 : 10) + (median > 25 ? 30 : 10) + (newP < 70 ? 20 : 0) + (avgFeedback < 10000 ? 10 : 0));
        if (score > 100) score = 100;
        let status = score >= 70 ? "HIGH PROFIT" : (score >= 45 ? "MEDIUM MARGIN" : "LOW PROFIT");
        let color = score >= 70 ? "text-[#00ff41]" : (score >= 45 ? "text-yellow-400" : "text-red-500");
        let barColor = score >= 70 ? "bg-[#00ff41]" : (score >= 45 ? "bg-yellow-400" : "bg-red-500");

        const resultHTML = `
            <div class="bg-black/60 border border-green-900/50 p-4 font-mono mb-6 shadow-[0_0_15px_rgba(0,255,65,0.05)]">
                <div class="border-b-2 border-green-900/50 pb-3 mb-4 flex justify-between items-end">
                    <div><div class="text-[9px] text-green-500 uppercase tracking-widest">TARGET</div><div class="text-white font-bold text-base uppercase">${input}</div></div>
                    <div class="text-right"><div class="${color} text-xs font-black tracking-widest">${status}</div></div>
                </div>
                <div class="mb-5 bg-green-900/10 p-3 border border-green-900/30">
                    <div class="flex justify-between text-[10px] text-white mb-1"><span>PROFIT SCORE</span><span class="font-bold">${score}/100</span></div>
                    <div class="w-full bg-black h-2.5 border border-green-900 overflow-hidden"><div class="${barColor} h-full" style="width: ${score}%"></div></div>
                </div>
                <div class="grid grid-cols-2 gap-4 text-xs mb-4 border-b border-green-900/30 pb-4">
                    <div class="bg-black p-2 border border-green-900/40"><div class="text-green-500/60 uppercase text-[9px] mb-0.5">MEDIAN PREIS</div><div class="text-sm text-[#00ff41] font-bold">${median.toFixed(2)}€</div></div>
                    <div class="bg-black p-2 border border-green-900/40"><div class="text-green-500/60 uppercase text-[9px] mb-0.5">MIN / MAX</div><div class="text-white font-bold">${minP.toFixed(2)}€ - ${maxP.toFixed(2)}€</div></div>
                    <div class="bg-black p-2 border border-green-900/40"><div class="text-green-500/60 uppercase text-[9px] mb-0.5">WETTBEWERBER</div><div class="text-white font-bold">${total.toLocaleString()}</div></div>
                    <div class="bg-black p-2 border border-green-900/40"><div class="text-green-500/60 uppercase text-[9px] mb-0.5">FESTPREIS-RATE</div><div class="text-white font-bold">${buyItNowP}%</div></div>
                </div>
                <div class="space-y-3">
                    <div><div class="flex justify-between text-[9px] text-green-500 mb-0.5"><span>GRATIS VERSAND</span><span>${shipP}%</span></div><div class="w-full bg-green-900/30 h-1.5"><div class="bg-blue-400 h-full" style="width: ${shipP}%"></div></div></div>
                    <div><div class="flex justify-between text-[9px] text-green-500 mb-0.5"><span>DEUTSCHER STANDORT</span><span>${domP}%</span></div><div class="w-full bg-green-900/30 h-1.5"><div class="bg-yellow-400 h-full" style="width: ${domP}%"></div></div></div>
                    <div class="mt-3 text-[10px] grid grid-cols-2 gap-2 bg-black p-2 border border-green-900/50">
                        <div><span class="text-green-500/70 block">Ø Feedback Menge:</span><span class="text-white font-bold">${avgFeedback.toLocaleString()}</span></div>
                        <div><span class="text-green-500/70 block">Ø Positiv-Rate:</span><span class="text-white font-bold">${avgFBPerc}%</span></div>
                    </div>
                </div>
            </div>`;
        resultsDiv.insertAdjacentHTML('afterbegin', resultHTML);
        sessionStorage.setItem('dww_trend_html', resultsDiv.innerHTML);
    } catch (e) { 
        document.getElementById(loadId).innerHTML = `<div class="text-red-500 p-4 text-xs">SYSTEM_ERROR</div>`; 
        sessionStorage.setItem('dww_trend_html', resultsDiv.innerHTML);
    }
}

// MEMORY SYSTEM
if (!window.trendObserver) {
    window.trendObserver = new MutationObserver(() => {
        const resDiv = document.getElementById('trend-results');
        const inDiv = document.getElementById('trend-input');
        if (resDiv && !resDiv.dataset.restored) {
            const saved = sessionStorage.getItem('dww_trend_html');
            if (saved) resDiv.innerHTML = saved;
            resDiv.dataset.restored = "true";
        }
        if (inDiv && !inDiv.dataset.restored) {
            const savedInput = sessionStorage.getItem('dww_trend_input');
            if (savedInput) inDiv.value = savedInput;
            inDiv.dataset.restored = "true";
            inDiv.addEventListener('input', e => sessionStorage.setItem('dww_trend_input', e.target.value));
        }
    });
    window.trendObserver.observe(document.body, { childList: true, subtree: true });
}
