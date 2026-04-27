// modules/keyword-scanner.js

window.startKeywordScan = async function() {
    const input = document.getElementById("kw-input").value.trim();
    const out = document.getElementById("kw-results");
    const token = localStorage.getItem("ai_dww_token");

    if (!input || !token) return;
    out.innerHTML = `<div class='flex flex-col items-center justify-center mt-10 gap-2 animate-pulse'><div class='w-6 h-6 border-2 border-[#00ff41] border-t-transparent rounded-full animate-spin'></div><div class='text-[10px] uppercase'>Generiere SEO Dashboard...</div></div>`;

    const prompt = `Analysiere Keyword: "${input}" für DACH. Gib NUR JSON zurück:
    {
      "volumeMonth": "15.000", "volumeDay": "500", "trend": "Steigend", "difficulty": 65, "cpc": "0,80€", "intent": "Kauf",
      "demographics": "25-45 Jahre, 60% M",
      "bestMonth": "November",
      "longtails": ["KW 1", "KW 2", "KW 3", "KW 4", "KW 5", "KW 6", "KW 7", "KW 8", "KW 9", "KW 10"],
      "strategy": "Taktische Empfehlung für Monetarisierung."
    }`;

    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${token}`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await res.json();
        const rawText = data.candidates[0].content.parts[0].text;
        const d = JSON.parse(rawText.match(/\{[\s\S]*\}/)[0]);

        // Farbe für Difficulty Balken
        let diffColor = d.difficulty < 40 ? "bg-[#00ff41]" : (d.difficulty < 70 ? "bg-yellow-400" : "bg-red-500");

        out.innerHTML = `
            <div class="space-y-4 font-mono">
                <div class="bg-black/60 border border-green-900/50 p-4 shadow-[0_0_15px_rgba(0,255,65,0.05)]">
                    <div class="flex justify-between items-center border-b border-green-900/50 pb-2 mb-3">
                        <strong class="text-white tracking-widest uppercase">${input}</strong>
                        <span class="text-green-500 text-[10px]">${d.trend}</span>
                    </div>

                    <div class="mb-4">
                        <div class="flex justify-between text-[10px] text-white mb-1">
                            <span>SEO SCHWIERIGKEIT</span><span>${d.difficulty}/100</span>
                        </div>
                        <div class="w-full bg-green-900/30 h-1.5 rounded-full overflow-hidden">
                            <div class="${diffColor} h-full" style="width: ${d.difficulty}%"></div>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-2 text-[10px] mb-4">
                        <div class="bg-green-900/20 p-2 border border-green-900/30"><div class="text-green-500/70">VOLUMEN (MONAT)</div><div class="text-lg text-white font-bold">${d.volumeMonth}</div></div>
                        <div class="bg-green-900/20 p-2 border border-green-900/30"><div class="text-green-500/70">VOLUMEN (TAG)</div><div class="text-lg text-white font-bold">${d.volumeDay}</div></div>
                        <div class="bg-green-900/20 p-2 border border-green-900/30"><div class="text-green-500/70">KLICKPREIS (CPC)</div><div class="text-white font-bold">${d.cpc}</div></div>
                        <div class="bg-green-900/20 p-2 border border-green-900/30"><div class="text-green-500/70">KAUFINTENTION</div><div class="text-white font-bold">${d.intent}</div></div>
                    </div>
                    
                    <div class="text-[10px] text-green-400 border-t border-green-900/50 pt-2">
                        Zielgruppe: <span class="text-white">${d.demographics}</span> | Peak: <span class="text-white">${d.bestMonth}</span>
                    </div>
                </div>

                <div class="bg-black/40 border border-green-900/30 p-3 text-[11px] text-white">
                    <b class="text-yellow-500 block border-b border-yellow-900/30 mb-2 uppercase">10 Verwandte Kauf-Keywords</b>
                    <ul class="space-y-1">
                        ${d.longtails.map(kw => `<li><span class="text-green-600 mr-2">></span>${kw}</li>`).join('')}
                    </ul>
                </div>

                <div class="bg-green-900/10 border-l-2 border-[#00ff41] p-3 text-[11px] text-green-300 italic">
                    >> <strong class="text-white">Strategie:</strong> ${d.strategy}
                </div>
            </div>`;
    } catch (e) { out.innerHTML = `<div class="text-red-500 text-xs p-4 border border-red-900">API Timeout. Bitte nochmal scannen.</div>`; }
}
