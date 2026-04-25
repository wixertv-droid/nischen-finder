// modules/ebay-finder.js

// 1. Funktion: Holt sich einen frischen Token direkt von eBay
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

    if (!response.ok) throw new Error(`eBay verweigert Token Zugriff (Code: ${response.status})`);
    const data = await response.json();
    return data.access_token;
}

// 2. Hauptfunktion: Führt den Such-Scan aus
async function startNischenScan() {
    const resultsDiv = document.getElementById('nischen-results');
    
    try {
        const inputField = document.getElementById('nischen-input');
        const text = inputField.value.trim();

        const appId = localStorage.getItem('ai_dww_ebay_app_id');
        const certId = localStorage.getItem('ai_dww_ebay_cert_id');

        if (!appId || !certId) {
            resultsDiv.innerHTML = "<div class='text-red-500 text-[11px] border border-red-900 p-3 bg-red-900/20 text-center mt-4'>[FATAL ERR] KEINE EBAY KEYS GEFUNDEN.</div>";
            return;
        }
        if (!text) return;

        const keywords = text.split('\n').map(k => k.trim()).filter(k => k.length > 0);
        if (keywords.length === 0) return;

        resultsDiv.innerHTML = `
            <div class='flex flex-col items-center justify-center mt-8 gap-3'>
                <div class='w-8 h-8 border-2 border-[#00ff41] border-t-transparent rounded-full animate-spin'></div>
                <div class='text-[#00ff41] text-[10px] animate-pulse tracking-[0.2em] font-mono text-center uppercase'>
                    Handshake mit eBay Server...<br>Generiere Live-Token...
                </div>
            </div>`;

        const token = await generateLiveToken(appId, certId);
        resultsDiv.innerHTML = ''; 

        for (let kw of keywords) {
            const id = `res-${btoa(encodeURIComponent(kw)).replace(/=/g, '')}`;
            resultsDiv.innerHTML += `
                <div id="${id}" class="border-l-2 border-l-green-800 bg-black/60 p-3 mb-2 shadow-[inset_0_0_10px_rgba(0,255,65,0.02)]">
                    <div class="text-[10px] text-green-600 animate-pulse">Scanne Datenbank für: <span class="text-white">${kw}</span> ...</div>
                </div>`;
        }

        for (let kw of keywords) {
            const id = `res-${btoa(encodeURIComponent(kw)).replace(/=/g, '')}`;
            try {
                // HIER IST DER FIX: Die Suchanfrage geht jetzt auch durch den sicheren Proxy-Tunnel!
                const targetUrl = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(kw)}&filter=itemLocationCountry:DE`;
                const proxySearchUrl = 'https://corsproxy.io/?' + encodeURIComponent(targetUrl);
                
                const res = await fetch(proxySearchUrl, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_DE'
                    }
                });

                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.errors ? errData.errors[0].message : `HTTP ${res.status}`);
                }
                
                const data = await res.json();
                const totalItems = data.total || 0;

                let colorClass = 'text-[#00ff41]';
                let statusText = '[ PERFEKT - KAUM KONKURRENZ ]';
                
                if (totalItems > 1000) {
                    colorClass = 'text-red-500';
                    statusText = '[ EXTREM ÜBERLAUFEN ]';
                } else if (totalItems > 300) {
                    colorClass = 'text-yellow-400';
                    statusText = '[ MODERATE KONKURRENZ ]';
                }

                document.getElementById(id).innerHTML = `
                    <div class="flex justify-between border-b border-green-900/50 pb-2 mb-2 items-center">
                        <strong class="text-sm text-white tracking-wider">${kw.toUpperCase()}</strong>
                        <span class="${colorClass} text-[9px] font-bold tracking-widest">${statusText}</span>
                    </div>
                    <div class="flex justify-between text-[11px] font-mono">
                        <span class="text-green-500 opacity-70">Aktive Angebote in DE:</span>
                        <span class="font-bold text-white text-sm">${totalItems.toLocaleString('de-DE')}</span>
                    </div>
                `;

            } catch (e) {
                // Gibt jetzt den exakten Fehlergrund aus, falls etwas schiefgeht!
                document.getElementById(id).innerHTML = `
                    <div class="flex justify-between border-b border-red-900/50 pb-2 mb-2">
                        <strong class="text-sm text-white">${kw.toUpperCase()}</strong>
                        <span class="text-red-500 text-[9px] font-bold">FEHLER: ${e.message}</span>
                    </div>`;
            }
        }

    } catch (fatalError) {
        resultsDiv.innerHTML = `
            <div class='p-4 border border-red-900 bg-red-900/10 text-red-500 font-mono text-[10px]'>
                <div class='font-bold mb-2 border-b border-red-900 pb-1 uppercase'>[SYSTEM_CRASH]</div>
                <div>CAUSE: ${fatalError.message}</div>
            </div>`;
    }
}
