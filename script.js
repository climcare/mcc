console.log("🚀 Dashboard iniciado");

let supabaseClient = null;

window.onload = async () => {
    // Inicializa Supabase
    if (typeof Supabase !== "undefined") {
        supabaseClient = Supabase.createClient(
            'https://iaylyacrzurcjwvtecpu.supabase.co',
            'sb_publishable_pkzx4u5U9Xr407syiBE9yA_G7hUvGaw'
        );
        console.log("✅ Supabase carregado!");
    } else {
        console.error("❌ Supabase não carregou");
    }

    await loadLatestReading();
    setInterval(loadLatestReading, 30000); // atualiza a cada 30s
};

async function loadLatestReading() {
    let reading = null;

    if (supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('sensor_readings')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (!error && data) reading = data;
        } catch (e) {
            console.warn("Erro Supabase:", e.message);
        }
    }

    // Fallback temporário enquanto não tem dados
    if (!reading) {
        reading = {
            deviceId: 11,
            temperature: 24.7,
            humidity: 51.2,
            co2: 730,
            pm25: 2.8
        };
    }

    const analysis = await analyzeEnvironment(reading);
    renderUI(reading, analysis);
}

function renderUI(reading, analysis) {
    // Device Info
    document.getElementById('deviceInfo').innerHTML = `
        <div class="flex items-center gap-3">
            <div class="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            <div>
                <span class="font-bold text-emerald-400">ONLINE</span><br>
                <span class="text-sm">Dispositivo ${reading.deviceId}</span>
            </div>
        </div>
    `;

    // Score
    const color = analysis.score >= 90 ? 'emerald' : analysis.score >= 75 ? 'blue' : 'amber';
    document.getElementById('scoreCard').innerHTML = `
        <h2 class="text-xl font-bold mb-4">Índice Clim Care</h2>
        <div class="text-6xl font-bold text-${color}-400 text-center">${analysis.score}</div>
        <div class="text-center text-2xl mt-2">${analysis.status}</div>
    `;

    // Cards
    document.getElementById('cards').innerHTML = `
        <div class="card text-center">
            <div class="text-4xl">🌡️</div>
            <div class="text-3xl font-bold">${reading.temperature}°C</div>
            <div class="text-xs text-slate-400">Temperatura</div>
        </div>
        <div class="card text-center">
            <div class="text-4xl">💧</div>
            <div class="text-3xl font-bold">${reading.humidity}%</div>
            <div class="text-xs text-slate-400">Umidade</div>
        </div>
        <div class="card text-center">
            <div class="text-4xl">🌬️</div>
            <div class="text-3xl font-bold">${reading.co2}</div>
            <div class="text-xs text-slate-400">CO₂</div>
        </div>
    `;

    // Diagnóstico, Alertas e Mitigações
    document.getElementById('statusCard').innerHTML = `<h2 class="font-bold mb-3">Diagnóstico</h2>${analysis.diagnosis.map(d => `<p>• ${d}</p>`).join('')}`;
    document.getElementById('alertsCard').innerHTML = `<h2 class="font-bold mb-3">Alertas</h2>${analysis.alerts.map(a => `<p>⚠️ ${a}</p>`).join('')}`;
    document.getElementById('mitigationCard').innerHTML = `<h2 class="font-bold mb-3">Mitigações</h2>${analysis.mitigations.map(m => `<p>✓ ${m}</p>`).join('')}`;
}
