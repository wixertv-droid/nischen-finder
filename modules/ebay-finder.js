// modules/ebay-finder.js
async function startEbayScan() {
    const input = document.getElementById('keyword-input').value;
    // Trennt Eingaben, entfernt leere Zeilen
    const keywords = input.split('\n').map(k => k.trim()).filter(k => k !== "");
    const resultsDiv = document.getElementById('scan-results');

    if (keywords.length === 0) {
        resultsDiv.innerHTML = "<div class='text-red-500 text-xs text-center mt-4'>[ERR_01] NO TARGETS SPECIFIED.</div>";
        return;
    }

    // Lade-Animation
    resultsDiv.innerHTML = `
        <div class='text-green-400 text-xs flex items-center justify-center h-full gap-2'>
            <div class='w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin'></div>
            <span>INITIALIZING PROXY RELAY...</span>
        </div>`;

    // Verzögerung für den "Hacker"-Effekt
    setTimeout(() => {
        resultsDiv.innerHTML = "";
        
        keywords.forEach((kw, index) => {
            setTimeout(() => {
                // HIER IST UNSER FILTER (Später ersetzen wir Math.random durch eBay Daten)
                const mockTreffer = Math.floor(Math.random() * 120); 
                const threshold = 30; // Ab wann es eine Nische ist
                const isNiche = mockTreffer < threshold; 
                
                // Optische Logik (Idiotensicher)
                // Grün = Geil, Dunkel = Uninteressant
                const rowColor = isNiche ? 'text-green-400 bg-green-900/20 border-l-green-500' : 'text-green-800 bg-black/40 border-l-transparent';
                const icon = isNiche ? '<span class="text-green-400">O</span>' : '<span class="text-green-800 opacity-50">X</span>';
                const statusTag = isNiche ? '<span class="bg-green-500 text-black px-1 rounded text-[10px] font-bold">NICHE</span>' : '<span class="text-[10px] opacity-40">SKIP</span>';

                // Das neue Tabellen-Zeilen-Format
                const rowHtml = `
                    <div class="grid grid-cols-12 gap-2 items-center p-2 border-l-2 ${rowColor} font-mono text-sm border-b border-green-900/30 hover:bg-green-900/40 transition-colors">
                        <div class="col-span-1 text-center font-bold">${icon}</div>
                        <div class="col-span-7 truncate" title="${kw}">${kw}</div>
                        <div class="col-span-2 text-right font-bold tracking-widest ${isNiche ? 'text-white drop-shadow-[0_0_5px_rgba(0,255,65,0.8)]' : ''}">${mockTreffer}</div>
                        <div class="col-span-2 text-right">${statusTag}</div>
                    </div>
                `;
                
                resultsDiv.innerHTML += rowHtml;
                
                // Auto-Scroll nach unten
                resultsDiv.scrollTop = resultsDiv.scrollHeight;
            }, index * 400); // 400ms Abstand pro Zeile für den Daten-Stream-Effekt
        });
    }, 800);
}
