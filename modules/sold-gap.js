// modules/sold-gap.js

window.startTrendScan = async function() {
    const input = document.getElementById("trend-input").value.trim();
    const out = document.getElementById("trend-results");
    const appId = localStorage.getItem("ai_dww_ebay_app_id");
    const certId = localStorage.getItem("ai_dww_ebay_cert_id");

    if (!input || !appId) return;
    out.innerHTML = `<div class='flex justify-center mt-10 animate-spin'><div class='w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full'></div></div>`;

    try {
        // Token generieren (Funktion muss in ebay-finder.js global sein oder hier kopiert)
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

        // Analyse
        const prices = items.map(i => parseFloat(i.price?.value || 0));
        const sorted = [...prices].sort((a,b) => a-b);
        const median = sorted[Math.floor(sorted.length/2)] || 0;
        const newP = (items.filter(i => i.conditionId === '1000').length / items.length) * 100;

        // Score Berechnung
        let score = Math.round((total < 500 ? 50 : 20) + (median > 20 ? 30 : 10) + (newP < 70 ? 20 : 0));
        let status = score > 70 ? "HIGH PROFIT" : (score > 40 ? "MEDIUM" : "LOW MARGIN");
        let color = score > 70 ? "text-[#00ff41]" : (score > 40 ? "text-yellow-400" : "text-red-500");

        out.innerHTML = `
            <div class="bg-black/60 border border-green-900/50 p-4 relative overflow-hidden">
                <div class="absolute top-0 left-0 h-1 bg-green-500" style="width: ${score}%"></div>
                <div class="flex justify-between items-end mb-4 pt-2">
                    <div><div class="text-[9px] opacity-50 uppercase">URTEIL</div><div class="${color} text-xl font-black">${status}</div></div>
                    <div class="text-right"><div class="text-[9px] opacity-50 uppercase">SCORE</div><div class="text-white font-bold text-lg">${score}/100</div></div>
                </div>
                <div class="grid grid-cols-2 gap-4 border-t border-green-900/30 pt-4 text-[11px]">
                    <div><div class="text-green-500/60 uppercase">Median-Preis</div><div class="text-white font-mono">${median.toFixed(2)}€</div></div>
                    <div><div class="text-green-500/60 uppercase">Angebote</div><div class="text-white font-mono">${total}</div></div>
                </div>
            </div>`;
    } catch (e) { out.innerHTML = "SYSTEM ERROR"; }
}
