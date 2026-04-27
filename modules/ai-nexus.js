// modules/ai-nexus.js

window.startAiScan = async function() {
    const input = document.getElementById("ai-input").value.trim();
    const out = document.getElementById("ai-results");
    const token = localStorage.getItem("ai_dww_token");

    if (!input || !token) return;
    out.innerHTML = `<div class='flex flex-col items-center justify-center mt-10 gap-2 animate-pulse'><div class='w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin'></div><div class='text-[10px] uppercase tracking-widest'>Deep Scan läuft... Lade Matrix...</div></div>`;

    const prompt = `Analysiere die Nische: "${input}" für DACH. Gib NUR valides JSON zurück. 
    Liefere SEHR detaillierte Antworten, besonders bei 'hook' und 'description'.
    {
      "marketScore": 85, // Bewerte das Potenzial von 0-100
      "market": {"trend": "Prognose in 1 Satz", "cpc": "0,50€", "margin": "30%"},
      "psychology": {"target": "Genaue Zielgruppe", "pain": "Welcher Schmerz wird gelöst?"},
      "marketing": {"platform": "Beste Plattform", "hook": "Detaillierte Idee für die ersten 3 Sekunden eines Videos"},
      "seo": ["Keyword 1", "Keyword 2", "Keyword 3", "Keyword 4", "Keyword 5", "Keyword 6", "Keyword 7", "Keyword 8", "Keyword 9", "Keyword 10", "Keyword 11", "Keyword 12", "Keyword 13", "Keyword 14", "Keyword 15", "Keyword 16", "Keyword 17", "Keyword 18", "Keyword 19", "Keyword 20"],
      "risks": ["Risiko 1", "Risiko 2"],
      "description": "Schreibe eine ausführliche, rechtssichere Produktbeschreibung nach der AIDA-Formel. Nutze HTML <br> für Zeilenumbrüche und Bulletpoints."
    }`;

    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${token}`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await res.json();
        const rawText = data.candidates[0].content.parts[0].text;
        const d = JSON.parse(rawText.match(/\{[\s\S]*\}/)[0]);

        out.innerHTML = `
            <div class="bg-black/70 border-l-2 border-[#00ff41] p-4 font-mono text-xs shadow-[0_0_20px_rgba(0,255,65,0.05)]">
                <div class="flex justify-between items-center border-b border-green-900 pb-2 mb-3">
                    <strong class="text-white text-base tracking-widest uppercase">${input}</strong>
                    <span class="text-[#00ff41] text-[10px]">[SCAN OK]</span>
                </div>

                <div class="mb-4">
                    <div class="flex justify-between text-[10px] text-green-500 mb-1">
                        <span>KI MARKT-POTENZIAL</span><span>${d.marketScore}/100</span>
                    </div>
                    <div class="w-full bg-green-900/30 h-2 rounded-full overflow-hidden border border-green-900">
                        <div class="bg-[#00ff41] h-full" style="width: ${d.marketScore}%"></div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3 mb-4 text-[10px]">
                    <div class="border border-green-900/50 p-2"><div class="text-green-500/70">TREND</div><div class="text-white">${d.market.trend}</div></div>
                    <div class="border border-green-900/50 p-2"><div class="text-green-500/70">MARGE / CPC</div><div class="text-white">${d.market.margin} | ${d.market.cpc}</div></div>
                    <div class="col-span-2 border border-green-900/50 p-2"><div class="text-green-500/70">ZIELGRUPPE & SCHMERZ</div><div class="text-white">${d.psychology.target}<br><i class="text-green-400">-> ${d.psychology.pain}</i></div></div>
                </div>

                <div class="mb-4 border border-yellow-900/50 bg-yellow-900/10 p-3 text-[10px]">
                    <b class="text-yellow-500 block mb-2 border-b border-yellow-900/50 pb-1">TOP 20 SEO KEYWORDS</b>
                    <div class="text-white leading-relaxed flex flex-wrap gap-1">
                        ${d.seo.map(k => `<span class="bg-black border border-yellow-700/50 px-1 py-0.5 rounded">${k}</span>`).join('')}
                    </div>
                </div>

                <div class="mb-4 text-[11px] text-white bg-green-900/20 p-3 border border-green-900/50">
                    <b class="text-[#00ff41] block mb-1">VIDEO HOOK (${d.marketing.platform}):</b>
                    ${d.marketing.hook}
                </div>

                <div class="bg-black p-3 text-[11px] text-green-300 leading-relaxed border-l-2 border-[#00ff41]">
                    <b class="text-white block mb-2 underline tracking-widest">MASTER-PRODUKTBESCHREIBUNG (AIDA)</b>
                    ${d.description}
                </div>
            </div>`;
    } catch (e) { out.innerHTML = `<div class="text-red-500 p-4 border border-red-900 bg-red-900/20 text-xs">FEHLER: KI-Antwort konnte nicht verarbeitet werden. Versuche es nochmal.</div>`; }
}
