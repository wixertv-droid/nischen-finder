// modules/keyword-scanner.js

window.startKeywordScan = async function() {
    const input = document.getElementById("kw-input").value.trim();
    const resultsDiv = document.getElementById("kw-results");
    const token = localStorage.getItem("ai_dww_token");

    if (!input || !token) return;
    if (resultsDiv.innerHTML.includes("Awaiting")) resultsDiv.innerHTML = '';

    const loadId = 'load-' + Date.now();
    resultsDiv.insertAdjacentHTML('afterbegin', `<div id="${loadId}" class='flex flex-col items-center justify-center my-6 gap-3'><div class='w-8 h-8 border-2 border-[#00ff41] border-t-transparent rounded-full animate-spin'></div><div class='text-xs uppercase tracking-widest text-[#00ff41]'>Generiere SEO Dashboard...</div></div>`);
    sessionStorage.setItem('dww_kw_html', resultsDiv.innerHTML);

    const prompt = `Analysiere Keyword: "${input}" für DACH. Gib NUR JSON zurück:
    {
      "volumeMonth": "15.000", "volumeDay": "500", "trend": "Steigend", "difficulty": 65, "cpc": "0,80€", "intent": "Kauf",
      "demographics": "25-45 Jahre, 60% M", "bestMonth": "November",
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
        document.getElementById(loadId).remove();

        let diffColor = d.difficulty < 40 ? "bg-[#00ff41]" : (d.difficulty < 70 ? "bg-yellow-400" : "bg-red-500");

        const resultHTML = `
            <div class="space-y-4 font-mono mb-8">
                <div class="bg-black/80 border border-green-900/50 p-4 shadow-[0_0_15px_rgba(0,255,65,0.05)]">
                    <div class="flex justify-between items-center border-b-2 border-green-800 pb-3 mb-4 bg-green-900/10 p-2">
                        <strong class="text-white text-lg tracking-widest uppercase">${input}</strong>
                        <span class="text-black bg-[#00ff41] px-2 py-1 text-[10px] font-bold">${d.trend}</span>
                    </div>
                    <div class="mb-5">
                        <div class="flex justify-between text-xs text-white mb-1"><span class="uppercase tracking-widest text-green-400">SEO Schwierigkeit</span><span>${d.difficulty}/100</span></div>
                        <div class="w-full bg-black h-2.5 rounded-sm overflow-hidden border border-green-900"><div class="${diffColor} h-full" style="width: ${d.difficulty}%"></div></div>
                    </div>
                    <div class="grid grid-cols-2 gap-3 text-xs mb-4">
                        <div class="bg-black p-3 border border-green-900/40"><div class="text-green-500/70 uppercase text-[10px] mb-1">Volumen (Monat)</div><div class="text-lg text-white font-bold">${d.volumeMonth}</div></div>
                        <div class="bg-black p-3 border border-green-900/40"><div class="text-green-500/70 uppercase text-[10px] mb-1">Volumen (Tag)</div><div class="text-lg text-white font-bold">${d.volumeDay}</div></div>
                        <div class="bg-black p-3 border border-green-900/40"><div class="text-green-500/70 uppercase text-[10px] mb-1">Klickpreis (CPC)</div><div class="text-white font-bold">${d.cpc}</div></div>
                        <div class="bg-black p-3 border border-green-900/40"><div class="text-green-500/70 uppercase text-[10px] mb-1">Kaufintention</div><div class="text-white font-bold">${d.intent}</div></div>
                    </div>
                    <div class="text-[11px] text-green-400 border-t border-green-900/50 pt-3">
                        Zielgruppe: <span class="text-white font-bold">${d.demographics}</span> | Peak: <span class="text-white font-bold">${d.bestMonth}</span>
                    </div>
                </div>
                <div class="border-l-2 border-yellow-500 bg-yellow-900/10 p-4 text-xs text-white">
                    <b class="text-yellow-500 block border-b border-yellow-900/30 pb-2 mb-3 uppercase tracking-widest">10 Kauf-Keywords (Longtail)</b>
                    <ul class="space-y-1.5">${d.longtails.map(kw => `<li><span class="text-green-600 mr-2">></span>${kw}</li>`).join('')}</ul>
                </div>
                <div class="bg-green-900/20 border-l-2 border-[#00ff41] p-4 text-xs text-green-300 leading-relaxed">
                    >> <strong class="text-white">Strategie:</strong> ${d.strategy}
                </div>
            </div>`;
        resultsDiv.insertAdjacentHTML('afterbegin', resultHTML);
        sessionStorage.setItem('dww_kw_html', resultsDiv.innerHTML);
    } catch (e) { 
        document.getElementById(loadId).innerHTML = `<div class="text-red-500 text-xs p-4 border border-red-900">API Timeout.</div>`; 
        sessionStorage.setItem('dww_kw_html', resultsDiv.innerHTML);
    }
}

// MEMORY SYSTEM
if (!window.kwObserver) {
    window.kwObserver = new MutationObserver(() => {
        const resDiv = document.getElementById('kw-results');
        const inDiv = document.getElementById('kw-input');
        if (resDiv && !resDiv.dataset.restored) {
            const saved = sessionStorage.getItem('dww_kw_html');
            if (saved) resDiv.innerHTML = saved;
            resDiv.dataset.restored = "true";
        }
        if (inDiv && !inDiv.dataset.restored) {
            const savedInput = sessionStorage.getItem('dww_kw_input');
            if (savedInput) inDiv.value = savedInput;
            inDiv.dataset.restored = "true";
            inDiv.addEventListener('input', e => sessionStorage.setItem('dww_kw_input', e.target.value));
        }
    });
    window.kwObserver.observe(document.body, { childList: true, subtree: true });
}
