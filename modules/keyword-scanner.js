// modules/keyword-scanner.js
async function startKeywordScan() {
    const inputField = document.getElementById('kw-input');
    const input = inputField.value.trim();
    const resultsDiv = document.getElementById('kw-results');
    const token = localStorage.getItem('ai_dww_token');

    if (!token) {
        resultsDiv.innerHTML = "<div class='text-red-500 text-[11px] border border-red-900 p-3 bg-red-900/20 text-center mt-4 font-mono'>[FATAL_ERR] NO_TOKEN_FOUND.</div>";
        return;
    }
    if (!input) return;

    resultsDiv.innerHTML = `
        <div class='flex flex-col items-center justify-center h-full mt-10 gap-3'>
            <div class='w-8 h-8 border-2 border-[#00ff41] border-t-transparent rounded-full animate-spin'></div>
            <div class='text-[#00ff41] text-[10px] animate-pulse tracking-[0.2em] font-mono uppercase text-center'>
                Connecting to Data Nodes...<br>Extrahiere SEO & Traffic Metriken für '${input}'
            </div>
        </div>`;

    try {
        const promptText = `Du bist MARKET_CORE, ein hochpräzises SEO- und Keyword-Datenbank-Terminal.
        Analysiere das Keyword "${input}" für den deutschen Markt (DACH).
        Liefere harte, präzise Datenschätzungen basierend auf historischen Suchmaschinen-Daten.
        
        REGELN: 
        - Keine Floskeln, keine Begrüßung.
        - Gib AUSSCHLIESSLICH den HTML-Code aus. Keine Markdown-Blockquotes (\`\`\`html).
        - Nutze EXAKT dieses Layout und ersetze die Platzhalter in den eckigen Klammern durch deine Daten:

        <div class="space-y-4">
            <div class="grid grid-cols-2 gap-2 text-[10px]">
                <div class="bg-green-900/20 border border-green-900/50 p-2">
                    <div class="text-green-500 opacity-70 mb-1">SUCHVOLUMEN / MONAT</div>
                    <div class="text-lg text-white font-bold">[Zahl, z.B. 12.500]</div>
                </div>
                <div class="bg-green-900/20 border border-green-900/50 p-2">
                    <div class="text-green-500 opacity-70 mb-1">SEO SCHWIERIGKEIT</div>
                    <div class="text-lg text-white font-bold">[Zahl 1-100]/100</div>
                </div>
                <div class="bg-green-900/20 border border-green-900/50 p-2">
                    <div class="text-green-500 opacity-70 mb-1">Ø KLICKPREIS (CPC)</div>
                    <div class="text-lg text-white font-bold">[Betrag in €, z.B. 0,45 €]</div>
                </div>
                <div class="bg-green-900/20 border border-green-900/50 p-2">
                    <div class="text-green-500 opacity-70 mb-1">KAUFBEREITSCHAFT</div>
                    <div class="text-lg text-white font-bold">[HOCH, MITTEL oder NIEDRIG]</div>
                </div>
            </div>

            <div class="bg-black/40 border border-green-900/30 p-3 text-[11px]">
                <b class="text-green-400 block border-b border-green-900/50 pb-1 mb-2 tracking-widest uppercase">Zielgruppen-Radar</b>
                <div class="flex justify-between mb-1"><span class="opacity-70">Haupt-Altersgruppe:</span> <span class="text-white font-bold">[Alter, z.B. 18-24]</span></div>
                <div class="flex justify-between mb-1"><span class="opacity-70">Geschlecht:</span> <span class="text-white font-bold">[Verteilung, z.B. 60% W / 40% M]</span></div>
                <div class="flex justify-between"><span class="opacity-70">Top Traffic-Quelle:</span> <span class="text-white font-bold">[Google, Amazon, TikTok oder Instagram]</span></div>
            </div>

            <div class="bg-black/40 border border-green-900/30 p-3 text-[11px]">
                <b class="text-green-400 block border-b border-green-900/50 pb-1 mb-2 tracking-widest uppercase">Top 10 Long-Tail Keywords</b>
                <ul class="list-none space-y-1.5 text-white font-mono">
                    <li><span class="text-green-600 mr-2">></span>[Spezifisches Keyword 1]</li>
                    <li><span class="text-green-600 mr-2">></span>[Spezifisches Keyword 2]</li>
                    <li><span class="text-green-600 mr-2">></span>[Spezifisches Keyword 3]</li>
                    <li><span class="text-green-600 mr-2">></span>[Spezifisches Keyword 4]</li>
                    <li><span class="text-green-600 mr-2">></span>[Spezifisches Keyword 5]</li>
                    <li><span class="text-green-600 mr-2">></span>[Spezifisches Keyword 6]</li>
                    <li><span class="text-green-600 mr-2">></span>[Spezifisches Keyword 7]</li>
                    <li><span class="text-green-600 mr-2">></span>[Spezifisches Keyword 8]</li>
                    <li><span class="text-green-600 mr-2">></span>[Spezifisches Keyword 9]</li>
                    <li><span class="text-green-600 mr-2">></span>[Spezifisches Keyword 10]</li>
                </ul>
            </div>

            <div class="bg-green-900/10 border-l-2 border-[#00ff41] p-3 text-[11px] leading-relaxed">
                <b class="text-[#00ff41] block mb-1 tracking-widest uppercase">>> Monetarisierungs-Strategie:</b>
                <span class="text-green-300">[Schreibe hier 2 knallharte, taktische Sätze, wie man dieses Keyword am besten nutzt. Z.B. "Schalte TikTok Ads, um Impulskäufe auszulösen" oder "Baue SEO-Ratgeber, um den Traffic kostenlos abzugreifen".]</span>
            </div>
        </div>`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${token}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
        });

        const data = await response.json();
        if (data.error) throw new Error(`API_RESPONSE: ${data.error.message}`);
        
        let aiOutput = data.candidates[0].content.parts[0].text;
        
        // Entfernt Markdown HTML-Tags, falls die KI sie versehentlich mitschickt
        aiOutput = aiOutput.replace(/```html/g, '').replace(/```/g, '');

        resultsDiv.innerHTML = `
            <div class="border-l-2 border-l-[#00ff41] bg-black/60 p-4 leading-relaxed font-mono shadow-[inset_0_0_20px_rgba(0,255,65,0.05)] mb-6">
                <div class="font-bold text-sm text-white tracking-widest uppercase mb-4 border-b border-green-900/50 pb-2 flex justify-between">
                    <span>KW: ${input}</span>
                    <span class="text-[#00ff41] text-[10px]">[SCAN_COMPLETE]</span>
                </div>
                ${aiOutput}
            </div>`;
        inputField.value = "";
    } catch (error) {
        resultsDiv.innerHTML = `<div class='p-4 border border-red-900 text-red-500 font-mono text-[10px] bg-red-900/20'>CAUSE: ${error.message}</div>`;
    }
}
