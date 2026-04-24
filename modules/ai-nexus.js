// modules/ai-nexus.js
async function startAiScan() {
    const input = document.getElementById('ai-input').value.trim();
    const resultsDiv = document.getElementById('ai-results');
    
    // Wir nutzen jetzt den Gemini-Key aus den Settings
    const token = localStorage.getItem('ai_dww_token');

    if (!token) {
        resultsDiv.innerHTML = "<div class='text-red-500 text-[11px] border border-red-900 p-3 bg-red-900/20 text-center mt-4'>[FATAL ERR] KEIN GEMINI-TOKEN GEFUNDEN.<br>Bitte im Reiter SYSTEM eintragen.</div>";
        return;
    }
    if (!input) return;

    resultsDiv.innerHTML = `<div class='text-green-400 text-xs text-center mt-4 animate-pulse'>[UPLINK: GOOGLE-NEURAL-NET] Processing data...</div>`;

    try {
        const systemPrompt = `Du bist ein hochintelligenter strategischer E-Commerce Analyst.
        Analysiere die Nische '${input}'. Antworte extrem präzise im Cyberpunk-Stil.
        Gliedere in 3 Bereiche:
        1. STATUS & POTENZIAL: Warum ist diese Nische stark?
        2. RISIKEN: Welche Gefahren gibt es?
        3. PRODUKT-IDEEN: Konkrete Konzepte.
        Nutze HTML für die Formatierung.`;

        // Die Gemini API URL (Modell: gemini-1.5-flash)
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${token}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt }] }]
            })
        });

        if (!response.ok) throw new Error(`API Error: ${response.status}`);

        const data = await response.json();
        const aiOutput = data.candidates[0].content.parts[0].text;

        // Umwandeln von Markdown-ähnlichem Text der KI in sauberes HUD-Design
        const formattedOutput = aiOutput
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white border-b border-green-500">$1</strong>');

        resultsDiv.innerHTML = `
            <div class="border-l-2 border-l-green-500 bg-black/60 p-3 leading-relaxed">
                <div class="font-bold text-sm text-white tracking-widest uppercase mb-3 border-b border-green-900/50 pb-1">TARGET: ${input}</div>
                <div class="text-[11px]">${formattedOutput}</div>
            </div>
        `;

    } catch (error) {
        resultsDiv.innerHTML = `<div class='p-3 border-l-4 border-l-red-500 bg-red-900/20 text-red-400 text-[11px] mt-4'>[ERR] Gemini Uplink fehlgeschlagen. Key prüfen.</div>`;
    }
}
