async function startTrendScan() {
    const input = document.getElementById('trend-input').value.trim();
    const resultsDiv = document.getElementById('trend-results');
    
    if (!input) return;

    resultsDiv.innerHTML = `<div class='text-green-400 text-xs text-center mt-4 animate-pulse'>Analysiere historische Verkaufsdaten...</div>`;

    setTimeout(() => {
        // Simulation: Wir tun so, als würden wir Verkäufe abrufen
        const sold = Math.floor(Math.random() * 500) + 50; 
        const active = Math.floor(Math.random() * 200) + 10; 
        const ratio = (sold / active).toFixed(1); // Wie viele Verkäufe pro aktivem Angebot?
        const isTrend = ratio > 2.0; // Wenn mehr als doppelt so viel verkauft wird, ist es ein Trend

        let boxStyle, statusText, actionText;

        if (isTrend) {
            boxStyle = 'border-l-4 border-l-green-400 bg-green-900/20';
            statusText = `<span class="text-white font-bold">${sold} verkauft vs. ${active} aktiv</span>`;
            actionText = '<span class="bg-green-500 text-black px-2 py-0.5 text-[9px] font-bold rounded">HIGH DEMAND!</span>';
        } else {
            boxStyle = 'border-l-4 border-l-green-900/50 bg-black/40 opacity-70';
            statusText = `<span class="text-green-600">${sold} verkauft vs. ${active} aktiv</span>`;
            actionText = '<span class="text-red-500 text-[9px] border border-red-900/50 px-1">LOW DEMAND</span>';
        }

        resultsDiv.innerHTML = `
            <div class="p-2 border border-green-900/30 ${boxStyle} transition-all">
                <div class="flex justify-between items-start mb-1">
                    <div class="font-bold text-sm tracking-wide text-green-300 uppercase">${input}</div>
                    ${actionText}
                </div>
                <div class="text-[11px] text-green-500">
                    Bilanz: ${statusText}. Auf 1 Angebot kommen aktuell ${ratio} Verkäufe.
                </div>
            </div>
        `;
    }, 800);
}
