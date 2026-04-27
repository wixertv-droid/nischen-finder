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
            resultsDiv.innerHTML = "<div class='text-red-500 text-[11px] border border-red-900 p-3 bg-red-900/20 text-center mt-4'>[ERR] KEYS FEHLEN.</div>";
            return;
        }
        if (!text) return;

        const keywords = text.split('\n').map(k => k.trim()).filter(k => k.length > 0);
        resultsDiv.innerHTML = `<div class='flex flex-col items-center justify-center mt-8 gap-2 animate-pulse'><div class='w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin'></div><div class='text-[10px] uppercase'>Uplink to eBay...</div></div>`;

        const token = await generateLiveToken(appId, certId);
        resultsDiv.innerHTML = ''; 

        for (let kw of keywords) {
            const id = `res-${btoa(encodeURIComponent(kw)).replace(/=/g, '')}`;
            resultsDiv.innerHTML += `<div id="${id}" class="border-l-2 border-l-green-800 bg-black/60 p-3 mb-2 min-h-[80px]">Scanning: ${kw}...</div>`;
        }

        for (let kw of keywords) {
            const id = `res-${btoa(encodeURIComponent(kw)).replace(/=/g, '')}`;
            try {
                const targetUrl = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(kw)}&filter=itemLocationCountry:DE&limit=20`;
                const proxySearchUrl = 'https://corsproxy.io/?' + encodeURIComponent(targetUrl);
                
                const res = await fetch(proxySearchUrl, {
                    headers: { 'Authorization': `Bearer ${token}`, 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_DE' }
                });
                const data = await res.json();
                const totalItems = data.total || 0;
                const items = data.itemSummaries || [];

                let minP = 0, maxP = 0, newC = 0, thumb = "";
                if (items.length > 0) {
                    const prices = items.map(i => parseFloat(i.price.value));
                    minP = Math.min(...prices);
                    maxP = Math.max(...prices);
                    newC = items.filter(i => i.conditionId === '1000' || i.condition === 'New' || i.condition === 'Neu').length;
                    // Vorschaubild vom ersten Artikel
                    if(items[0].image && items[0].image.imageUrl) thumb = items[0].image.imageUrl;
                }

                const newPercent = items.length > 0 ? Math.round((newC / items.length) * 100) : 0;
                let colorClass = totalItems < 300 ? 'text-[#00ff41]' : (totalItems < 1000 ? 'text-yellow-400' : 'text-red-500');

                document.getElementById(id).innerHTML = `
                    <div class="flex gap-3">
                        ${thumb ? `<img src="${thumb}" class="w-16 h-16 object-cover border border-green-900/50 bg-black">` : `<div class="w-16 h-16 border border-green-900/50 bg-black flex items-center justify-center text-[8px]">NO_IMG</div>`}
                        <div class="flex-grow">
                            <div class="flex justify-between border-b border-green-900/30 pb-1 mb-1 items-start">
                                <strong class="text-[12px] text-white uppercase">${kw}</strong>
                                <span class="${colorClass} text-[8px] font-black">[${totalItems}]</span>
                            </div>
                            <div class="text-[10px] grid grid-cols-2 gap-x-2">
                                <span class="text-green-500 opacity-60">Price:</span><span class="text-white text-right">${minP.toFixed(2)}€ - ${maxP.toFixed(2)}€</span>
                                <span class="text-green-500 opacity-60">Structure:</span><span class="text-white text-right">${newPercent}% Neu</span>
                            </div>
                        </div>
                    </div>
                `;
            } catch (e) { document.getElementById(id).innerHTML = `<div class="text-red-500 text-[10px]">${kw}: FAILED</div>`; }
        }
    } catch (f) { resultsDiv.innerHTML = `<div class='text-red-500 p-4'>${f.message}</div>`; }
}
