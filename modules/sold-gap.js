// modules/sold-gap.js

// 1. eBay Live-Token generieren (exakt wie im Nischen-Modul)
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

    if (!response.ok) throw new Error(`eBay Token verweigert (Code: ${response.status})`);
    const data = await response.json();
    return data.access_token;
}

// 2. Hauptfunktion für die Preisanalyse
async function startTrendScan() {
    const inputField = document.getElementById('trend-input');
    const resultsDiv = document.getElementById('trend-results');
    const kw = inputField.value.trim();

    const appId = localStorage.getItem('ai_dww_ebay_app_id');
    const certId = localStorage.getItem('ai_dww_ebay_cert_id');

    if (!appId || !certId) {
        resultsDiv.innerHTML = "<div class='text-red-500 text-[11px] border border-red-900 p-3 bg-red-900/20 text-center mt-4'>[FATAL ERR] KEINE EBAY KEYS GEFUNDEN.</div>";
        return;
    }
    if (!kw) return;

    resultsDiv.innerHTML = `
        <div class='flex flex-col items-center justify-center mt-10 gap-3'>
            <div class='w-8 h-8 border-2 border-[#00ff41] border-t-transparent rounded-full animate-spin'></div>
            <div class='text-[#00ff41] text-[10px] animate-pulse tracking-[0.2em] font-mono text-center uppercase'>
                Analysiere Marktwerte für '${kw}'...<br>Extrahiere Preisdaten...
            </div>
        </div>`;

    try {
        const token = await generateLiveToken(appId, certId);

        // Wir rufen die Top 50 Ergebnisse ab, um einen guten Durchschnitt zu berechnen
        const targetUrl = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(kw)}&filter=itemLocationCountry:DE&limit=50`;
        const proxySearchUrl = 'https://corsproxy.io/?' + encodeURIComponent(targetUrl);
        
        const res = await fetch(proxySearchUrl, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-EBAY-C-MARKETPLACE-ID': 'EBAY_DE'
            }
        });

        if (!res.ok) throw new Error(`API Fehler: HTTP ${res.status}`);
        const data = await res.json();
        
        const totalItems = data.total || 0;
        const items = data.itemSummaries || [];

        if (items.length === 0) {
            resultsDiv.innerHTML = `
                <div class='p-4 border border-yellow-600 bg-yellow-900/20 text-yellow-500 font-mono text-[11px]'>
                    Keine Angebote für "${kw}" auf eBay DE gefunden. Eine absolute Marktlücke oder Tippfehler?
                </div>`;
            return;
        }

        // Preise analysieren
        let prices = [];
        items.forEach(item => {
            if (item.price && item.price.value) {
                prices.push(parseFloat(item.price.value));
            }
        });

        if (prices.length === 0) throw new Error("Keine Preisdaten in den Ergebnissen gefunden.");

        // Berechnungen
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

        // Bewertung des Marktes
        let trendVerdict = "";
        let verdictColor = "";

        if (avgPrice < 15 && totalItems > 500) {
            trendVerdict = "[ PREISKAMPF / GERINGE MARGE ]";
            verdictColor = "text-red-500";
        } else if (avgPrice >= 15 && avgPrice <= 50 && totalItems < 1000) {
            trendVerdict = "[ GUTE MARGE / SWEET SPOT ]";
            verdictColor = "text-[#00ff41]";
        } else if (avgPrice > 50) {
            trendVerdict = "[ HIGH TICKET ITEM / LOHNT SICH ]";
            verdictColor = "text-yellow-400";
        } else {
            trendVerdict = "[ DURCHSCHNITTLICH ]";
            verdictColor = "text-green-500";
        }

        resultsDiv.innerHTML = `
            <div class="border-l-2 border-l-[#00ff41] bg-black/60 p-4 shadow-[inset_0_0_20px_rgba(0,255,65,0.05)]">
                <div class="font-bold text-sm text-white tracking-widest uppercase mb-4 border-b border-green-900/50 pb-2 flex justify-between">
                    <span>TARGET: ${kw}</span>
                    <span class="text-[#00ff41] text-[10px]">[ANALYSIS_COMPLETE]</span>
                </div>
                
                <div class="mb-4">
                    <span class="${verdictColor} text-[11px] font-bold tracking-widest uppercase block mb-1">${trendVerdict}</span>
                    <span class="text-[10px] text-green-600">Basierend auf den Top-Ergebnissen in DE.</span>
                </div>

                <div class="space-y-3 text-[12px]">
                    <div class="flex justify-between border-b border-green-900/30 pb-1">
                        <span class="text-green-400 opacity-80">Durchschnittspreis:</span>
                        <b class="text-white text-sm">${avgPrice.toFixed(2)} €</b>
                    </div>
                    <div class="flex justify-between border-b border-green-900/30 pb-1">
                        <span class="text-green-400 opacity-80">Günstigster Preis:</span>
                        <b class="text-white">${minPrice.toFixed(2)} €</b>
                    </div>
                    <div class="flex justify-between border-b border-green-900/30 pb-1">
                        <span class="text-green-400 opacity-80">Höchster Preis:</span>
                        <b class="text-white">${maxPrice.toFixed(2)} €</b>
                    </div>
                    <div class="flex justify-between mt-4 pt-2">
                        <span class="text-green-500 opacity-60 text-[10px]">Aktive Konkurrenten gesamt:</span>
                        <span class="text-green-500 text-[10px]">${totalItems.toLocaleString('de-DE')}</span>
                    </div>
                </div>
            </div>
        `;
        
        inputField.value = "";

    } catch (error) {
        resultsDiv.innerHTML = `
            <div class='p-4 border border-red-900 bg-red-900/10 text-red-500 font-mono text-[10px]'>
                <div class='font-bold mb-2 border-b border-red-900 pb-1 uppercase'>[SYSTEM_CRASH]</div>
                <div>CAUSE: ${error.message}</div>
            </div>`;
    }
}
