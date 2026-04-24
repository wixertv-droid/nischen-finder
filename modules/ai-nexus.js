// modules/ai-nexus.js
async function startAiScan() {
    const inputField = document.getElementById('ai-input');
    const input = inputField.value.trim();
    const resultsDiv = document.getElementById('ai-results');
    const token = localStorage.getItem('ai_dww_token');

    if (!token) {
        resultsDiv.innerHTML = "<div class='text-red-500 text-[11px] border border-red-900 p-3 bg-red-900/20 text-center mt-4 font-mono'>[FATAL_ERR] NO_TOKEN_FOUND.</div>";
        return;
    }
    if (!input) return;

    resultsDiv.innerHTML = `
        <div class='flex flex-col items-center justify-center h-full mt-10 gap-3'>
            <div class='w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin'></div>
            <div class='text-green-500 text-[10px] animate-pulse tracking-[0.2em] font-mono uppercase'>Neural Uplink: Deep Scan ${input}...</div>
        </div>`;

    try {
        // DER NEUE MASTER-PROMPT: Hier zwingen wir die KI zu harten Fakten und Zahlen
        const promptText = `DU BIST MARKET_CORE, ein gnadenloser, extrem präziser E-Commerce-Analyst.
        Deine Aufgabe: Analysiere die Nische "${input}" für den Markt DACH (DE/AT/CH).
        KEINE Begrüßung. KEIN Fazit. KEIN Gelaber. Nur harte, strukturierte Daten. Nutze HTML für das Layout.
        Schätze realistische Zahlen auf Basis historischer E-Commerce-Daten (Suchvolumen, Margen, CPC).

        Antworte EXAKT in diesem Format und nutze diese HTML-Tags:

        <b class="text-white border-b border-green-500 block mb-1">1. [ METRICS_ESTIMATE ]</b>
        • Such-Trend: [Steigend/Fallend/Stagniert] (Social Media vs. Marktplätze)<br>
        • Est. CPC (Ads): [Konkreter geschätzter Betrag in €]<br>
        • Avg. Profit-Marge: [Konkrete geschätzte Prozentzahl]<br><br>

        <b class="text-white border-b border-green-500 block mb-1">2. [ TARGET_VECTOR ]</b>
        [Maximal 2 knackige Sätze: Wer ist die exakte Zielgruppe? Welches Problem löst das Produkt wirklich?]<br><br>

        <b class="text-red-400 border-b border-red-900 block mb-1">3. [ THREAT_LEVEL ]</b>
        [Nenne die 2 größten, extrem spezifischen Risiken dieser Nische. Z.B. rechtliche Hürden, Retouren-Gründe, Materialkosten, dominierende Konkurrenz. Keine allgemeinen Phrasen!]<br><br>

        <b class="text-green-300 border-b border-green-800 block mb-1">4. [ ACTION_PLAN ]</b>
        [Nenne 2 hochprofitable Produkt-Iterationen oder Bundles, die sofort einen USP schaffen und sich von Billig-Konkurrenz abheben.]`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${token}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }]
            })
        });

        const data = await response.json();

        if (data.error) {
            let errorMsg = data.error.message;
            if (data.error.code === 503) {
                errorMsg = "Google Server sind gerade überlastet. Warte 10 Sekunden und klicke nochmal.";
            }
            throw new Error(`API_RESPONSE: ${errorMsg} (Code: ${data.error.code})`);
        }

        if (!data.candidates || data.candidates.length === 0) {
            throw new Error("EMPTY_RESPONSE: Keine Daten erhalten.");
        }

        let aiOutput = data.candidates[0].content.parts[0].text;

        // Wir entfernen eventuelle Markdown-Sterne, falls die KI sie trotz HTML-Befehl nutzt
        aiOutput = aiOutput.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>');
        aiOutput = aiOutput.replace(/\*(.*?)\*/g, '<span class="italic text-green-300">$1</span>');

        resultsDiv.innerHTML = `
            <div class="border-l-2 border-l-green-500 bg-black/60 p-4 leading-relaxed font-mono shadow-[0_0_20px_rgba(0,255,65,0.1)]">
                <div class="font-bold text-sm text-white tracking-widest uppercase mb-4 border-b border-green-900/50 pb-2 flex justify-between">
                    <span>TARGET: ${input}</span>
                    <span class="text-green-500 text-[10px]">[DEEP_SCAN_COMPLETE]</span>
                </div>
                <div class="text-[11px] text-green-400">
                    ${aiOutput}
                </div>
                <div class="mt-6 pt-2 border-t border-green-900/30 text-[9px] text-green-700 italic">
                    Daten basieren auf KI-Schätzungen (historische Marktmodelle). Keine Live-API.
                </div>
            </div>
        `;

        inputField.value = "";

    } catch (error) {
        console.error("AI_CORE_CRASH:", error);
        resultsDiv.innerHTML = `
            <div class='p-4 border border-red-900 bg-red-900/10 text-red-500 font-mono text-[10px]'>
                <div class='font-bold mb-2 border-b border-red-900 pb-1 uppercase'>[SYSTEM_FAILURE]</div>
                <div class='mb-2'>CAUSE: ${error.message}</div>
            </div>`;
    }
}
