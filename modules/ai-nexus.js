// modules/ai-nexus.js

window.startAiScan = async function() {
    const inputField = document.getElementById("ai-input");
    const input = inputField.value.trim();
    const resultsDiv = document.getElementById("ai-results");
    const token = localStorage.getItem("ai_dww_token");

    if (!input || !token) return;
    if (resultsDiv.innerHTML.includes("Awaiting Target")) resultsDiv.innerHTML = '';

    const loadId = 'load-' + Date.now();
    resultsDiv.insertAdjacentHTML('afterbegin', `<div id="${loadId}" class='flex flex-col items-center justify-center my-6 gap-3'><div class='w-8 h-8 border-2 border-[#00ff41] border-t-transparent rounded-full animate-spin'></div><div class='text-xs uppercase tracking-widest text-[#00ff41]'>Deep Scan läuft...</div></div>`);
    inputField.value = ""; 
    sessionStorage.setItem('dww_ai_html', resultsDiv.innerHTML);

    // NEU: Zwingt die KI, einen englischen Regie-Prompt für Video-Generatoren zu schreiben
    const prompt = `Analysiere die Nische: "${input}" für DACH. Gib NUR valides JSON zurück. 
    Liefere SEHR detaillierte Antworten.
    {
      "marketScore": 85,
      "market": {"trend": "Prognose in 1 Satz", "cpc": "0,50€", "margin": "30%"},
      "psychology": {"target": "Genaue Zielgruppe", "pain": "Welcher Schmerz wird gelöst?"},
      "marketing": {"platform": "Beste Plattform", "videoPrompt": "Schreibe einen hochdetaillierten ENGLISCHEN (!) Text-to-Video Prompt (Regieanweisung) für eine AI (wie Veo, Kling, Sora). Beschreibe eine extrem fesselnde erste Szene (3-5 Sekunden), Kamerabewegung (z.B. Cinematic Pan), Beleuchtung und fotorealistische Details, die das Produkt oder das Problem perfekt in Szene setzen."},
      "seo": ["KW 1", "KW 2", "KW 3", "KW 4", "KW 5", "KW 6", "KW 7", "KW 8", "KW 9", "KW 10", "KW 11", "KW 12", "KW 13", "KW 14", "KW 15", "KW 16", "KW 17", "KW 18", "KW 19", "KW 20"],
      "risks": ["Risiko 1", "Risiko 2"],
      "description": "Schreibe eine ausführliche, rechtssichere Produktbeschreibung nach der AIDA-Formel. WICHTIG: Lass die Wörter 'Attention', 'Interest', 'Desire', 'Action' und 'AIDA' im Text komplett weg! Nutze HTML <br> für Absätze."
    }`;

    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${token}`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await res.json();
        const rawText = data.candidates[0].content.parts[0].text;
        const d = JSON.parse(rawText.match(/\{[\s\S]*\}/)[0]);
        document.getElementById(loadId).remove();

        const descId = 'desc-' + Date.now();
        const videoPromptId = 'vid-' + Date.now();

        const resultHTML = `
            <div class="bg-black/80 border border-green-900/50 p-4 font-mono text-sm shadow-[0_0_20px_rgba(0,255,65,0.05)] mb-6">
                <div class="flex justify-between items-center border-b-2 border-green-800 pb-3 mb-4 bg-green-900/10 p-2">
                    <strong class="text-white text-lg tracking-widest uppercase">${input}</strong>
                    <span class="text-black bg-[#00ff41] px-2 py-1 text-[10px] font-bold">[ SCAN OK ]</span>
                </div>
                
                <div class="mb-5">
                    <div class="flex justify-between text-xs text-green-400 mb-1"><span class="uppercase tracking-widest">Markt-Potenzial</span><span class="font-bold text-white">${d.marketScore}/100</span></div>
                    <div class="w-full bg-black h-2.5 rounded-sm overflow-hidden border border-green-900"><div class="bg-[#00ff41] h-full" style="width: ${d.marketScore}%"></div></div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-5 text-xs">
                    <div class="border border-green-900/40 p-3 bg-black"><div class="text-green-500/70 mb-1 uppercase text-[10px]">Trend</div><div class="text-white font-bold">${d.market.trend}</div></div>
                    <div class="border border-green-900/40 p-3 bg-black"><div class="text-green-500/70 mb-1 uppercase text-[10px]">Marge / CPC</div><div class="text-white font-bold">${d.market.margin} | ${d.market.cpc}</div></div>
                    <div class="col-span-2 border border-green-900/40 p-3 bg-black"><div class="text-green-500/70 mb-1 uppercase text-[10px]">Zielgruppe & Problem</div><div class="text-white">${d.psychology.target}</div><div class="text-green-400 mt-1 italic">> Löste Schmerz: ${d.psychology.pain}</div></div>
                </div>
                
                <div class="mb-5 border-l-2 border-yellow-500 bg-yellow-900/10 p-3 text-xs">
                    <b class="text-yellow-500 block mb-3 uppercase tracking-widest">Top 20 SEO Keywords</b>
                    <div class="text-white leading-relaxed flex flex-wrap gap-1.5">${d.seo.map(k => `<span class="bg-black border border-yellow-700/50 px-2 py-1 text-[10px] rounded">${k}</span>`).join('')}</div>
                </div>
                
                <div class="mb-5 bg-green-900/20 p-4 text-xs leading-relaxed border border-[#00ff41]/50">
                    <div class="flex justify-between items-center border-b border-green-900/50 pb-2 mb-3">
                        <div>
                            <b class="text-[#00ff41] uppercase tracking-widest block">AI Video Prompt</b>
                            <span class="text-green-500/70 text-[9px] uppercase">Für Veo, Kling, Runway (${d.marketing.platform})</span>
                        </div>
                        <button onclick="copyDescText('${videoPromptId}', this)" class="bg-green-900/40 hover:bg-[#00ff41] hover:text-black text-[#00ff41] border border-[#00ff41] px-3 py-1 text-[10px] font-bold rounded transition-colors duration-200">
                            KOPIEREN
                        </button>
                    </div>
                    <div id="${videoPromptId}" class="text-white font-sans tracking-wide text-[13px] italic">${d.marketing.videoPrompt}</div>
                </div>
                
                <div class="bg-black p-4 text-xs text-green-300 leading-relaxed border border-green-900">
                    <div class="flex justify-between items-center border-b border-green-900/50 pb-2 mb-3">
                        <b class="text-white uppercase tracking-widest">Listing Text (AIDA)</b>
                        <button onclick="copyDescText('${descId}', this)" class="bg-green-900/40 hover:bg-[#00ff41] hover:text-black text-[#00ff41] border border-[#00ff41] px-3 py-1 text-[10px] font-bold rounded transition-colors duration-200">
                            KOPIEREN
                        </button>
                    </div>
                    <div id="${descId}" class="text-white/90 font-sans tracking-wide text-[13px]">${d.description}</div>
                </div>
            </div>`;
            
        resultsDiv.insertAdjacentHTML('afterbegin', resultHTML);
        sessionStorage.setItem('dww_ai_html', resultsDiv.innerHTML);
    } catch (e) { 
        document.getElementById(loadId).innerHTML = `<div class="text-red-500 p-4 border border-red-900 bg-red-900/20 text-xs">FEHLER: API Timeout. Bitte versuche es erneut.</div>`; 
        sessionStorage.setItem('dww_ai_html', resultsDiv.innerHTML);
    }
}

// UNIVERSAL-KOPIER-FUNKTION
window.copyDescText = function(elementId, btn) {
    const textToCopy = document.getElementById(elementId).innerText; 
    navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = btn.innerText;
        btn.innerText = "KOPIERT!";
        btn.classList.add("bg-[#00ff41]", "text-black");
        setTimeout(() => {
            btn.innerText = originalText;
            btn.classList.remove("bg-[#00ff41]", "text-black");
        }, 2000);
    }).catch(err => {
        console.error("Kopieren fehlgeschlagen: ", err);
        btn.innerText = "FEHLER";
    });
}

// MEMORY SYSTEM
if (!window.aiObserver) {
    window.aiObserver = new MutationObserver(() => {
        const resDiv = document.getElementById('ai-results');
        const inDiv = document.getElementById('ai-input');
        if (resDiv && !resDiv.dataset.restored) {
            const saved = sessionStorage.getItem('dww_ai_html');
            if (saved) resDiv.innerHTML = saved;
            resDiv.dataset.restored = "true";
        }
        if (inDiv && !inDiv.dataset.restored) {
            const savedInput = sessionStorage.getItem('dww_ai_input');
            if (savedInput) inDiv.value = savedInput;
            inDiv.dataset.restored = "true";
            inDiv.addEventListener('input', e => sessionStorage.setItem('dww_ai_input', e.target.value));
        }
    });
    window.aiObserver.observe(document.body, { childList: true, subtree: true });
}
