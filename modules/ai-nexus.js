async function startAiScan() {
    const input = document.getElementById('ai-input').value.trim();
    const resultsDiv = document.getElementById('ai-results');
    const token = localStorage.getItem('ai_dww_token');

    if (!token) {
        resultsDiv.innerHTML = "<div class='text-red-500 text-[11px] border border-red-900 p-3 bg-red-900/20 text-center mt-4'>[FATAL ERR] KEIN OPENAI-TOKEN GEFUNDEN.<br>Bitte im Reiter SYSTEM eintragen.</div>";
        return;
    }
    if (!input) return;

    resultsDiv.innerHTML = `<div class='text-green-400 text-xs text-center mt-4 animate-pulse'>[UPLINK ESTABLISHED] Processing neural data...</div>`;

    try {
        // Der unsichtbare System-Prompt, der der KI sagt, WIE sie antworten soll
        const systemPrompt = `Du bist ein hochintelligenter strategischer E-Commerce Analyst, der durch ein Cyberpunk-Terminal spricht.
        Analysiere die Nische '${input}'.
        Antworte extrem präzise, hart an den Fakten und direkt. Nutze HTML-Tags zur Formatierung.
        Dein Output muss ZWINGEND diese 3 Bereiche enthalten:
        <br><br><strong class='text-white text-[12px] bg-green-900/50 px-1 border border-green-500'>1. STATUS & POTENZIAL:</strong><br><span class='text-green-400 text-[11px]'>Warum ist diese Nische stark?</span>
        <br><br><strong class='text-white text-[12px] bg-red-900/50 px-1 border border-red-500'>2. RISIKEN:</strong><br><span class='text-red-400 text-[11px]'>Welche Gefahren gibt es hier?</span>
        <br><br><strong class='text-black text-[12px] bg-green-500 px-1'>3. PRODUKT-IDEEN:</strong><br><span class='text-green-300 text-[11px]'>Konkrete Ideen, wie man sich abhebt.</span>`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini', // Schnell, günstig, extrem clever
                messages: [{ role: 'user', content: systemPrompt }],
                temperature: 0.7,
                max_tokens: 600
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const aiOutput = data.choices[0].message.content;

        // Ausgabe in der Box formatieren
        resultsDiv.innerHTML = `
            <div class="border-l-2 border-l-green-500 bg-black/60 p-3 leading-relaxed shadow-[inset_0_0_20px_rgba(0,255,65,0.05)]">
                <div class="font-bold text-sm text-white tracking-widest uppercase mb-3 border-b border-green-900/50 pb-1">TARGET: ${input}</div>
                ${aiOutput}
            </div>
        `;

    } catch (error) {
        resultsDiv.innerHTML = `
            <div class="p-3 border-l-4 border-l-red-500 bg-red-900/20 text-red-400 text-[11px] mt-4">
                [ERR] Neural Net Uplink fehlgeschlagen. Token überprüfen oder Limit erreicht.
            </div>
        `;
    }
}
