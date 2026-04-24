// modules/ebay-finder.js
async function startEbayScan() {
    const input = document.getElementById('keyword-input').value;
    const keywords = input.split('\n').filter(k => k.trim() !== "" && k.trim() !== ">");
    const resultsDiv = document.getElementById('scan-results');

    if (keywords.length === 0) {
        resultsDiv.innerHTML = "<div class='text-red-500 text-xs'>[ERR] NO KEYWORDS DETECTED.</div>";
        return;
    }

    resultsDiv.innerHTML = "<div class='text-green-400 text-xs animate-pulse'>[SYSTEM] Establishing connection to eBay relay...</div>";

    // Simulierter Hack-Vorgang (Später kommt hier die echte eBay API rein)
    setTimeout(() => {
        resultsDiv.innerHTML = "";
        
        keywords.forEach((kw, index) => {
            // Verzögerte Ausgabe für den Matrix-Effekt
            setTimeout(() => {
                // Wir simulieren vorerst die Trefferanzahl
                const mockTreffer = Math.floor(Math.random() * 100); 
                const isNiche = mockTreffer < 30; // Unser Schwellenwert
                
                const statusColor = isNiche ? 'text-green-400 border-green-500' : 'text-green-900 border-green-900 opacity-50';
                const statusText = isNiche ? '[NICHE DETECTED]' : '[HIGH COMPETITION]';
                const icon = isNiche ? 'O' : 'X';

                resultsDiv.innerHTML += `
                    <div class="border-l-2 ${statusColor} bg-black/60 p-2 font-mono text-sm flex justify-between items-center mb-1">
                        <span><span class="opacity-50">${icon}</span> ${kw.replace('> ', '')}</span>
                        <span class="text-xs">${mockTreffer} matches ${statusText}</span>
                    </div>
                `;
                
                // Scrollt automatisch nach unten, wenn neue Ergebnisse reinkommen
                resultsDiv.scrollTop = resultsDiv.scrollHeight;
            }, index * 600); // Jedes Keyword braucht 0.6 Sekunden zum "Scannen"
        });
    }, 1500);
}
