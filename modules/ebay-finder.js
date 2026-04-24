async function startEbayScan() {
    const input = document.getElementById('keyword-input').value;
    const keywords = input.split('\n').map(k => k.trim()).filter(k => k !== "");
    const resultsDiv = document.getElementById('scan-results');

    if (keywords.length === 0) return;

    resultsDiv.innerHTML = `<div class='text-green-400 text-xs text-center mt-4 animate-pulse'>Verbinde mit eBay Datenbank...</div>`;

    setTimeout(() => {
        resultsDiv.innerHTML = "";
        
        keywords.forEach((kw, index) => {
            setTimeout(() => {
                // Simulation (wird später durch eBay API ersetzt)
                const activeListings = Math.floor(Math.random() * 150); 
                const threshold = 30; 
                const isNiche = activeListings < threshold; 
                
                let boxStyle, statusText, actionText;

                if (isNiche) {
                    // Positives Ergebnis (Grün leuchtend)
                    boxStyle = 'border-l-4 border-l-green-400 bg-green-900/20';
                    statusText = `<span class="text-white font-bold">${activeListings} aktive Angebote</span>`;
                    actionText = '<span class="bg-green-500 text-black px-2 py-0.5 text-[9px] font-bold rounded">NISCHE GEFUNDEN! ZUSCHLAGEN!</span>';
                } else {
                    // Negatives Ergebnis (Dunkel, unauffällig)
                    boxStyle = 'border-l-4 border-l-green-900/50 bg-black/40 opacity-70';
                    statusText = `<span class="text-green-600">${activeListings} aktive Angebote</span>`;
                    actionText = '<span class="text-red-500 text-[9px] border border-red-900/50 px-1">ZU VIEL KONKURRENZ (SKIP)</span>';
                }

                // Detaillierter Block für jedes Keyword
                const rowHtml = `
                    <div class="p-2 border border-green-900/30 ${boxStyle} transition-all">
                        <div class="flex justify-between items-start mb-1">
                            <div class="font-bold text-sm tracking-wide text-green-300 uppercase">${kw}</div>
                            ${actionText}
                        </div>
                        <div class="text-[11px] text-green-500">
                            Konkurrenz-Check: Es gibt aktuell ${statusText} für diesen Suchbegriff auf eBay.
                        </div>
                    </div>
                `;
                
                resultsDiv.innerHTML += rowHtml;
                resultsDiv.scrollTop = resultsDiv.scrollHeight;
            }, index * 400); 
        });
    }, 600);
}
