// modules/keyword-scanner.js

window.startKeywordScan = async function() {
    const input = document.getElementById("kw-input").value.trim();
    const out = document.getElementById("kw-results");
    const token = localStorage.getItem("ai_dww_token");

    if (!input || !token) return;
    out.innerHTML = `<div class='flex flex-col items-center justify-center mt-10 gap-2 animate-pulse'><div class='w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin'></div><div class='text-[10px] uppercase'>Scanning Matrix...</div></div>`;

    const prompt = `Analysiere Keyword: ${input}. Gib NUR JSON zurück:
    {
      "volume": "10.000", "difficulty": 45, "cpc": "0,80€", "intent": "Kauf",
      "demographics": {"age": "25-45", "gender": "60% M"},
      "longtails": ["Keyword A", "Keyword B"],
      "strategy": "Taktische Empfehlung hier."
    }`;

    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${token}`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await res.json();
        const d = JSON.parse(data.candidates[0].content.parts[0].text.match(/\{[\s\S]*\}/)[0]);

        out.innerHTML = `
            <div class="space-y-4 font-mono">
                <div class="grid grid-cols-2 gap-2 text-[10px]">
                    <div class="bg-green-900/20 border border-green-900/50 p-2">
                        <div class="text-green-500 opacity-70">VOLUMEN</div><div class="text-lg text-white font-bold">${d.volume}</div>
                    </div>
                    <div class="bg-green-900/20 border border-green-900/50 p-2">
                        <div class="text-green-500 opacity-70">SEO DIFF</div><div class="text-lg text-white font-bold">${d.difficulty}/100</div>
                    </div>
                </div>
                <div class="bg-black/40 border border-green-900/30 p-3 text-[11px]">
                    <b class="text-green-400 block border-b border-green-900/50 pb-1 mb-2">TARGET GROUP</b>
                    Alter: ${d.demographics.age} | Gender: ${d.demographics.gender}
                </div>
                <div class="bg-black/40 border border-green-900/30 p-3 text-[11px] text-white">
                    <b class="text-yellow-500 block border-b border-yellow-900/30 mb-2">LONGTAILS</b>
                    ${d.longtails.join(" | ")}
                </div>
                <div class="bg-green-900/10 border-l-2 border-[#00ff41] p-3 text-[11px] text-green-300 italic">
                    >> ${d.strategy}
                </div>
            </div>`;
    } catch (e) { out.innerHTML = "SCAN_ERROR"; }
}
