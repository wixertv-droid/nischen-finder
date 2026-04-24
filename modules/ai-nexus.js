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
            <div class='text-green-500 text-[10px] animate-pulse tracking-[0.2em] font-mono uppercase'>Neural Uplink: Gen 2.0 Analyzing ${input}...</div>
        </div>`;

    try {
        const promptText = `Du bist ein strategischer E-Commerce Analyst. Analysiere die Nische: ${input}. 
        Antworte extrem präzise im Cyberpunk-Stil. Nutze HTML-Tags (<b>, <br>).
        Struktur:
        1. STATUS (Potenzial?)
        2. RISIKEN (Gefahren?)
        3. IDEEN (Produktvorschläge?)`;

        // Der Sweetspot: Gemini 2.0 Flash (Stabil, verfügbar, schnell)
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${token}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }]
            })
        });

        const data = await response.json();

        // Fehler abfangen
        if (data.error) {
            let errorMsg = data.error.message;
            if (data.error.code === 503) {
                errorMsg = "Google Server sind aktuell überlastet. Warte ein paar Sekunden und klicke nochmal.";
            }
            throw new Error(`API_RESPONSE: ${errorMsg} (Code: ${data.error.code})`);
        }

        if (!data.candidates || data.candidates.length === 0) {
            throw new Error("EMPTY_RESPONSE: Keine Daten erhalten.");
        }

        let aiOutput = data.candidates[0].content.parts[0].text;

        // Jarvis Formatierung
        aiOutput = aiOutput.replace(/\*\*(.*?)\*\*/g, '<b class="text-white">$1</b>');
        aiOutput = aiOutput.replace(/\*(.*?)\*/g, '<b class="text-white">$1</b>');
        aiOutput = aiOutput.replace(/\n/g, '<br>');

        resultsDiv.innerHTML = `
            <div class="border-l-2 border-l-green-500 bg-black/60 p-4 leading-relaxed font-mono shadow-[0_0_20px_rgba(0,255,65,0.1)]">
                <div class="font-bold text-sm text-white tracking-widest uppercase mb-4 border-b border-green-900/50 pb-2 flex justify-between">
                    <span>TARGET: ${input}</span>
                    <span class="text-green-500 text-[10px]">[UPLINK_GEMINI_2.0]</span>
                </div>
                <div class="text-[11px] text-green-400">
                    ${aiOutput}
                </div>
                <div class="mt-6 pt-2 border-t border-green-900/30 text-[9px] text-green-700 italic">
                    Analysis complete. Data stream verified.
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
                <div class='p-2 bg-black/40 border border-red-500/30 text-white'>
                    Wenn hier immer noch 503 steht, zwingt Google Gratis-Nutzer gerade in die Warteschlange. Klicke einfach 2-3 mal im Abstand von 10 Sekunden auf den Button, dann rutschst du meistens durch!
                </div>
            </div>`;
    }
}
