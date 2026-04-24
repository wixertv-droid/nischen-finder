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
                Connecting to Data Nodes...<br>Extracting metrics for '${input}'
            </div>
        </div>`;

    try {
        const promptText = `Du bist ein technischer SEO- und E-Commerce-Datenbank-Scanner.
        Analysiere den genauen Suchbegriff / das Keyword "${input}" für den DACH-Markt.
        
        REGELN:
        - Komplett auf Deutsch. Keine Floskeln, nur harte Datenpunkte.
        - Layout EXAKT beibehalten, keine Sterne oder Markdown verwenden:

        <b class="text-white border-b border-green-500 block mb-2 mt-2">1. [ TRAFFIC & VOLUMEN ]</b>
        • <b>Suchvolumen (Tag):</b> [Zahl, z.B. 350 Anfragen]<br>
        • <b>Suchvolumen (Monat):</b> [Zahl, z.B. 10.500 Anfragen]<br>
        • <b>Trend-Richtung:</b> [Steigend / Fallend / Stabil]<br>
        • <b>Stärkster Monat:</b> [Wann wird am meisten gesucht?]<br><br>

        <b class="text-white border-b border-green-500 block mb-2">2. [ CONVERSION & KAUFINTENTION ]</b>
        • <b>Kaufbereitschaft:</b> [Hoch / Mittel / Niedrig]<br>
        • <b>Conversion-Rate:</b> [Prozentzahl, z.B. 2-4%]<br><br>

        <b class="text-[#00ff41] border-b border-[#00ff41] block mb-2">3. [ TOP 10 VERWANDTE KAUF-KEYWORDS ]</b>
        Nenne genau 10 spezifische Long-Tail-Keywords, die Käufer bei Google/Amazon eingeben:<br>
        1. [Keyword 1]<br>
        2. [Keyword 2]<br>
        3. [Keyword 3]<br>
        4. [Keyword 4]<br>
        5. [Keyword 5]<br>
        6. [Keyword 6]<br>
        7. [Keyword 7]<br>
        8. [Keyword 8]<br>
        9. [Keyword 9]<br>
        10. [Keyword 10]<br><br>

        <b class="text-red-400 border-b border-red-900 block mb-2">4. [ KONKURRENZ-ANALYSE ]</b>
        • <b>Wettbewerbsdichte:</b> [Hoch / Mittel / Niedrig]<br>
        • <b>Erfolgsfaktor:</b> [Was machen die Top-Ergebnisse bei Google/eBay richtig?]`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${token}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
        });

        const data = await response.json();
        if (data.error) throw new Error(`API_RESPONSE: ${data.error.message}`);
        
        let aiOutput = data.candidates[0].content.parts[0].text;
        aiOutput = aiOutput.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>').replace(/\*(.*?)\*/g, '<span>$1</span>').replace(/\n/g, '<br>');

        resultsDiv.innerHTML = `
            <div class="border-l-2 border-l-[#00ff41] bg-black/60 p-4 leading-relaxed font-mono shadow-[inset_0_0_20px_rgba(0,255,65,0.05)]">
                <div class="font-bold text-sm text-white tracking-widest uppercase mb-4 border-b border-green-900/50 pb-2 flex justify-between">
                    <span>KEYWORD: ${input}</span>
                    <span class="text-[#00ff41] text-[10px]">[SCAN_COMPLETE]</span>
                </div>
                <div class="text-[12px] text-green-400 space-y-2">
                    ${aiOutput}
                </div>
            </div>`;
        inputField.value = "";
    } catch (error) {
        resultsDiv.innerHTML = `<div class='p-4 border border-red-900 text-red-500 font-mono text-[10px]'>CAUSE: ${error.message}</div>`;
    }
}
