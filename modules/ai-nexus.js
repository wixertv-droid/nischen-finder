// modules/ai-nexus.js

window.startAiScan = async function() {
    const input = document.getElementById("ai-input").value.trim();
    const out = document.getElementById("ai-results");
    const token = localStorage.getItem("ai_dww_token");

    if (!input || !token) return;
    out.innerHTML = `<div class='flex flex-col items-center justify-center mt-10 gap-2 animate-pulse'><div class='w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin'></div><div class='text-[10px] uppercase'>Generating Matrix...</div></div>`;

    const prompt = `Analysiere die Nische: ${input}. Gib NUR valides JSON zurück: 
    {
      "market": {"trend": "", "cpc": "", "margin": ""},
      "psychology": {"target": "", "pain": ""},
      "marketing": {"platform": "", "hook": ""},
      "seo": {"keywords": []},
      "risks": [],
      "description": "Professioneller, rechtssicherer AIDA Text für Deutschland mit Bulletpoints."
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
            <div class="bg-black/70 border-l-2 border-green-500 p-4 font-mono text-xs space-y-4">
                <div class="text-white font-bold border-b border-green-900 pb-2 uppercase tracking-widest">${input}</div>
                <div class="text-green-400 grid grid-cols-2 gap-2">
                    <div>MARKET: ${d.market.trend}</div><div>MARGIN: ${d.market.margin}</div>
                </div>
                <div class="text-yellow-500">
                    <b class="block border-b border-yellow-900/30 mb-1">SEO KEYWORDS</b>
                    ${d.seo.keywords.join(", ")}
                </div>
                <div class="bg-green-900/10 p-3 text-green-300 leading-relaxed border border-green-900/30">
                    <b class="text-[#00ff41] block mb-2 underline">AIDA-PRODUKTBESCHREIBUNG (RECHTSSICHER)</b>
                    ${d.description.replace(/\n/g, '<br>')}
                </div>
                <div class="text-red-400 text-[10px] uppercase">Risks: ${d.risks.join(" | ")}</div>
            </div>`;
    } catch (e) { out.innerHTML = "JSON_PARSE_ERROR"; }
}
