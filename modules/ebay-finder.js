// modules/ebay-finder.js
async function startEbayScan() {
    const input = document.getElementById('keyword-input').value;
    const keywords = input.split('\n').map(k => k.trim()).filter(k => k !== "");
    const resultsDiv = document.getElementById('scan-results');
    
    // 1. Zieht sich den Key, den du in "SYSTEM" eingegeben hast
    const token = localStorage.getItem('ebay_dww_token');

    // Idiotensicherung: Kein Token = Kein Hack
    if (!token) {
        resultsDiv.innerHTML = "<div class='text-red-500 text-xs text-center mt-4 border border-red-900 p-2 bg-red-900/20'>[FATAL ERR] KEIN API-TOKEN GEFUNDEN.<br>Bitte im Reiter SYSTEM eintragen.</div>";
        return;
    }
    if (keywords.length === 0) return;

    resultsDiv.innerHTML = `<div class='text-green-400 text-xs text-center mt-4 animate-pulse'>[UPLINK ACTIVE] Fetching Live Data from eBay Servers...</div>`;

    // Verzögerung löschen und direkt anfragen
    setTimeout(async () => {
        resultsDiv.innerHTML = "";
        
        for (let kw of keywords) {
            try {
                // 2. Die echte eBay URL für die Suche
                const targetUrl = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(kw)}&limit=1`;
                // 3. Der Proxy, damit dein Handy nicht blockiert wird
                const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;

                // 4. Der Feuerbefehl an eBay
                const response = await fetch(proxyUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_DE', // Suchen im deutschen Markt
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP Error ${response.status}`);
                }

                const data = await response.json();
                
                // 5. Die echte Zahl aus der eBay Datenbank!
                const activeListings = data.total || 0; 
                const threshold = 30; 
                const isNiche = activeListings < threshold; 
                
                let boxStyle, statusText, actionText;

                if (isNiche) {
                    boxStyle = 'border-l-4 border-l-green-400 bg-green-900/20';
                    statusText = `<span class="text-white font-bold">${activeListings} aktive Angebote</span>`;
                    actionText = '<span class="bg-green-500 text-black px-2 py-0.5 text-[9px] font-bold rounded">NISCHE GEFUNDEN!</span>';
                } else {
                    boxStyle = 'border-l-4 border-l-green-900/50 bg-black/40 opacity-70';
                    statusText = `<span class="text-green-600">${activeListings} aktive Angebote</span>`;
                    actionText = '<span class="text-red-500 text-[9px] border border-red-900/50 px-1">ZU VIEL KONKURRENZ</span>';
                }

                resultsDiv.innerHTML += `
                    <div class="p-2 border border-green-900/30 ${boxStyle} transition-all mb-2">
                        <div class="flex justify-between items-start mb-1">
                            <div class="font-bold text-sm tracking-wide text-green-300 uppercase">${kw}</div>
                            ${actionText}
                        </div>
                        <div class="text-[11px] text-green-500">
                            Live-Scan: ${statusText} in der Datenbank.
                        </div>
                    </div>
                `;
                resultsDiv.scrollTop = resultsDiv.scrollHeight;

            } catch (error) {
                // Wenn der Token falsch oder abgelaufen ist
                resultsDiv.innerHTML += `
                    <div class="p-2 border-l-4 border-l-red-500 bg-red-900/20 text-red-400 text-[11px] mb-2">
                        [ERR] <strong class="text-white">${kw}</strong>: Verbindung abgelehnt. Token abgelaufen oder Proxy-Fehler.
                    </div>
                `;
            }
            
            // Kleine Pause zwischen den Anfragen, damit eBay uns nicht wegen Spam blockt
            await new Promise(r => setTimeout(r, 500));
        }
    }, 500);
}
