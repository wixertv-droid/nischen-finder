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
            <div class='text-green-500 text-[10px] animate-pulse tracking-[0.2em] font-mono uppercase'>Neural Uplink: Deep Marketing Scan für '${input}'...</div>
        </div>`;

    try {
        // DER NEUE MASTER-PROMPT: Idiotensicher, 100% Deutsch, Fokus auf Marketing & Social Media
        const promptText = `DU BIST MARKET_CORE, ein extrem profitabler, genialer E-Commerce-Stratege.
        Analysiere die Nische "${input}" für den deutschen Markt.
        
        REGELN:
        - Antworte ZWINGEND komplett auf Deutsch. Vermeide Fachchinesisch. Schreibe idiotensicher.
        - Nutze realistische Einschätzungen aus deiner Marktdaten-Erfahrung.
        - KEIN Gelaber, keine Begrüßung. Direkt die Fakten.
        - Halte dich EXAKT an folgendes HTML-Layout:

        <b class="text-white border-b border-green-500 block mb-2 mt-2">1. [ MARKT & PROGNOSE ]</b>
        • <b>Markt-Lage:</b> [1-2 Sätze: Wächst die Nische? Wo wird danach gesucht?]<br>
        • <b>Werbekosten (Klickpreis):</b> [Realistische Schätzung, z.B. 0,40 € bis 0,70 €]<br>
        • <b>Gewinnmarge:</b> [Realistische Schätzung in %, z.B. 40-60%]<br>
        • <b>Zukunft:</b> [Prognose für die nächsten 12 Monate]<br><br>

        <b class="text-white border-b border-green-500 block mb-2">2. [ KÄUFER-PSYCHOLOGIE ]</b>
        • <b>Wer kauft das?:</b> [Genaue Zielgruppe, Alter, Typ]<br>
        • <b>Warum kaufen sie es?:</b> [Welcher Schmerz wird gelindert oder welcher Wunsch erfüllt?]<br><br>

        <b class="text-[#00ff41] border-b border-[#00ff41] block mb-2">3. [ SOCIAL MEDIA STRATEGIE ]</b>
        • <b>Beste Plattform:</b> [TikTok, Insta, Pinterest etc. - und kurz warum]<br>
        • <b>Video-Idee 1 (Hook):</b> [Eine richtig gute Idee für die ersten 3 Sekunden eines Videos]<br>
        • <b>Video-Idee 2 (Inhalt):</b> [Was genau soll im Video gezeigt werden, damit es viral geht?]<br><br>

        <b class="text-red-400 border-b border-red-900 block mb-2">4. [ DIE GRÖSSTEN GEFAHREN ]</b>
        • <b>Risiko 1:</b> [Extrem konkretes Risiko, z.B. "Hohe Retourenquote, weil die Größen oft klein ausfallen"]<br>
        • <b>Risiko 2:</b> [Noch ein konkretes Problem, z.B. Markenrechte oder billige Konkurrenz aus Asien]<br><br>

        <b class="text-green-300 border-b border-green-800 block mb-2">5. [ SO SCHLÄGST DU DIE KONKURRENZ ]</b>
        • <b>Bundle-Idee:</b> [Was kann man dem Produkt beilegen, um den Preis zu verdoppeln?]<br>
        • <b>Marketing-Winkel:</b> [Wie musst du das Produkt nennen/verkaufen, damit es sich von billigen Angeboten abhebt?]`;

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

        // Cleanup: Manchmal baut die KI trotzdem noch Markdown-Sterne ein. Die löschen wir für eine saubere Optik.
        aiOutput = aiOutput.replace(/\*\*(.*?)\*\*/g, '<span>$1</span>');
        aiOutput = aiOutput.replace(/\*(.*?)\*/g, '<span>$1</span>');
        aiOutput = aiOutput.replace(/\n/g, '<br>');

        resultsDiv.innerHTML = `
            <div class="border-l-2 border-l-green-500 bg-black/60 p-4 leading-relaxed font-mono shadow-[0_0_20px_rgba(0,255,65,0.1)]">
                <div class="font-bold text-sm text-white tracking-widest uppercase mb-4 border-b border-green-900/50 pb-2 flex justify-between">
                    <span>TARGET: ${input}</span>
                    <span class="text-green-500 text-[10px]">[DEEP_SCAN_COMPLETE]</span>
                </div>
                <div class="text-[12px] text-green-400 space-y-2">
                    ${aiOutput}
                </div>
                <div class="mt-6 pt-2 border-t border-green-900/30 text-[9px] text-green-700 italic">
                    Daten basieren auf KI-Marktmodellen und Social-Media-Mustererkennung.
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
