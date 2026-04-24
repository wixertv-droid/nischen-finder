// modules/ai-nexus.js
async function startAiScan() {
    const input = document.getElementById('ai-input').value.trim();
    const resultsDiv = document.getElementById('ai-results');
    const token = localStorage.getItem('ai_dww_token');

    if (!token) {
        resultsDiv.innerHTML = "<div class='text-red-500 text-[11px] border border-red-900 p-3 bg-red-900/20 text-center mt-4'>[FATAL ERR] KEIN GEMINI-TOKEN GEFUNDEN.</div>";
        return;
    }
    if (!input) return;

    resultsDiv.innerHTML = `<div class='text-green-400 text-xs text-center mt-4 animate-pulse'>[UPLINK: GOOGLE-NEURAL-NET] Analyzing ${input}...</div>`;

    try {
        // Der System-Prompt für das Hacker-Design
        const promptText = `Analysiere die Verkaufs-Nische: ${input}. 
        Antworte kurz und präzise im Cyberpunk-Terminal-Stil. 
        Nutze HTML für Fettungen. 
        Struktur: 
        1. POTENZIAL (Warum gut?)
        2. RISIKEN (Gefahren?)
        3. IDEEN (Was genau verkaufen?)`;

        // Die URL für Gemini 1.5 Flash
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${token}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: promptText }]
                }]
            })
        });

        const data = await response.json();

        // Fehlerprüfung, falls der Key ungültig ist oder Google meckert
        if (data.error) {
            throw new Error(data.error.message);
        }

        // Gemini Antwort extrahieren
        let aiOutput = data.candidates[0].content.parts[0].text;

        // Formatierung: Wir wandeln Markdown-Sterne in HTML-Fettung um
        aiOutput = aiOutput.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white border-b border-green-500">$1</strong>');
        aiOutput = aiOutput.replace(/\n/g, '<br>');

        resultsDiv.innerHTML = `
            <div class="border-l-2 border-l-green-500 bg-black/60 p-3 leading-relaxed font-mono shadow-[0_0_15px_rgba(0,255,65,0.1)]">
                <div class="font-bold text-sm text-white tracking-widest uppercase mb-3 border-b border-green-900/50 pb-1">TARGET: ${input}</div>
                <div class="text-[11px] text-green-400">${aiOutput}</div>
            </div>
        `;

    } catch (error) {
        console.error("AI Error:", error);
        resultsDiv.innerHTML = `
            <div class='p-3 border-l-4 border-l-red-500 bg-red-900/20 text-red-400 text-[11px] mt-4'>
                [SYSTEM_FAILURE]<br>
                REASON: ${error.message}<br><br>
                TIPP: Prüfe ob dein Key aktiv ist. Manche Keys brauchen 5-10 Min nach Erstellung.
            </div>`;
    }
}
