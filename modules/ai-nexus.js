// modules/ai-nexus.js
async function startAiScan() {
    const inputField = document.getElementById('ai-input');
    const input = inputField.value.trim();
    const resultsDiv = document.getElementById('ai-results');
    const token = localStorage.getItem('ai_dww_token');

    if (!token) return;
    if (!input) return;

    resultsDiv.innerHTML = `
        <div class='flex flex-col items-center justify-center h-full mt-10 gap-3'>
            <div class='w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin'></div>
            <div class='text-green-500 text-[10px] animate-pulse tracking-[0.2em] font-mono uppercase'>Deep Scan: ${input}...</div>
        </div>`;

    try {
        const promptText = `DU BIST MARKET_CORE. Analysiere die Nische "${input}" für den deutschen Markt (DACH).
        REGELN: Komplett auf Deutsch. Keine Begrüßung. Layout EXAKT einhalten:

        <b class="text-white border-b border-green-500 block mb-2 mt-2">1. [ MARKT & PROGNOSE ]</b>
        • <b>Markt-Lage:</b> [1 Satz Prognose]<br>
        • <b>Werbekosten (Klickpreis):</b> [Betrag]<br>
        • <b>Gewinnmarge:</b> [Prozentzahl]<br><br>

        <b class="text-white border-b border-green-500 block mb-2">2. [ KÄUFER-PSYCHOLOGIE ]</b>
        • <b>Wer kauft das?:</b> [Exakte Zielgruppe]<br>
        • <b>Warum?:</b> [Gelöster Schmerz oder Wunsch]<br><br>

        <b class="text-[#00ff41] border-b border-[#00ff41] block mb-2">3. [ SOCIAL MEDIA & MARKETING ]</b>
        • <b>Plattform:</b> [Beste Plattform]<br>
        • <b>Video Hook:</b> [Idee für die ersten 3 Sekunden]<br><br>

        <b class="text-yellow-400 border-b border-yellow-700 block mb-2">4. [ TOP 20 SEO KEYWORDS ]</b>
        Nenne exakt die 20 wichtigsten Suchbegriffe, die zwingend in den eBay/Amazon Titel oder die Tags müssen (als kompakte Liste mit Kommas getrennt, keine Stichpunkte):<br>
        [Hier die 20 Keywords, z.B. Keyword 1, Keyword 2, Keyword 3...]<br><br>

        <b class="text-red-400 border-b border-red-900 block mb-2">5. [ DIE GRÖSSTEN GEFAHREN ]</b>
        • <b>Risiko:</b> [Konkretes Risiko der Nische]`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${token}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        let aiOutput = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '<span>$1</span>').replace(/\*(.*?)\*/g, '<span>$1</span>').replace(/\n/g, '<br>');

        resultsDiv.innerHTML = `
            <div class="border-l-2 border-l-green-500 bg-black/60 p-4 leading-relaxed font-mono shadow-[0_0_20px_rgba(0,255,65,0.1)]">
                <div class="font-bold text-sm text-white tracking-widest uppercase mb-4 border-b border-green-900/50 pb-2 flex justify-between">
                    <span>TARGET: ${input}</span><span class="text-green-500 text-[10px]">[OK]</span>
                </div>
                <div class="text-[12px] text-green-400 space-y-2">${aiOutput}</div>
            </div>`;
        inputField.value = "";
    } catch (error) {
        resultsDiv.innerHTML = `<div class='p-4 border border-red-900 text-red-500 text-[10px]'>CAUSE: ${error.message}</div>`;
    }
}
