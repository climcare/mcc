// ==================== CONFIGURAÇÃO ====================
const SUPABASE_URL = 'https://iaylyacrzurcjwvtecpu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pkzx4u5U9Xr407syiBE9yA_G7hUvGaw';

let supabaseClient = null;

// Aguarda o Supabase carregar
function waitForSupabase(callback) {
    if (typeof Supabase !== "undefined") {
        supabaseClient = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("✅ Supabase carregado com sucesso!");
        callback();
    } else {
        console.log("⏳ Aguardando Supabase...");
        setTimeout(() => waitForSupabase(callback), 300);
    }
}

// Atualiza a UI
function updateUI(reading, analysis) {
    // Device Info
    document.getElementById('deviceInfo').innerHTML = `
        <div class="flex items-center gap-3 bg-emerald-900/30 p-4 rounded-2xl">
            <div class="w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
            <div><span class="font-semibold">ONLINE</span><br>Dispositivo ${reading.deviceId || '—'}</div>
        </div>
    `;

    const scoreColor = analysis.score >= 90 ? '#22c55e' : analysis.score >= 75 ? '#3b82f6' : analysis.score >= 50 ? '#eab308' : '#ef4444';

    document.getElementById('scoreCard').innerHTML = `
        <h2 class="text-2xl font-bold mb-4 text-center">Índice Clim Care</h2>
        <div class="flex justify-center my-6">
            <div style="width:170px;height:170px;border-radius:9999px;border:16px solid ${scoreColor};display:flex;align-items:center;justify-content:center;font-size:58px;font-weight:700;color:${scoreColor}">
                ${analysis.score}
            </div>
        </div>
        <p class="text-center text-3xl font-semibold">${analysis.status}</p>
    `;

    document.getElementById('cards').innerHTML = `
        <div class="card text-center p-6">
            <div class="text-5xl">🌡️</div>
            <div class="text-3xl font-bold">${reading.temperature?.toFixed(1) || '—'}°C</div>
        </div>
        <div class="card text-center p-6">
            <div class="text-5xl">💧</div>
            <div class="text-3xl font-bold">${reading.humidity?.toFixed(1) || '—'}%</div>
        </div>
        <div class="card text-center p-6">
            <div class="text-5xl">🌬️</div>
            <div class="text-3xl font-bold">${reading.co2 || '—'}</div>
        </div>
    `;

    document.getElementById('statusCard').innerHTML = `
        <h2 class="font-bold mb-3">Diagnóstico</h2>
        ${analysis.diagnosis.map(d => `<p class="text-slate-300">• ${d}</p>`).join('')}
    `;

    document.getElementById('alertsCard').innerHTML = `
        <h2 class="font-bold mb-3">Alertas</h2>
        ${analysis.alerts.map(a => `<p class="text-amber-400">⚠️ ${a}</p>`).join('')}
    `;

    document.getElementById('mitigationCard').innerHTML = `
        <h2 class="font-bold mb-3">Mitigações</h2>
        ${analysis.mitigations.map(m => `<p class="text-emerald-400">✓ ${m}</p>`).join('')}
    `;
}

// Carrega dados
async function loadData() {
    if (!supabaseClient) return;

    try {
        const { data, error } = await supabaseClient
            .from('sensor_readings')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error || !data) throw new Error("Sem dados");

        const analysis = await analyzeEnvironment(data);
        updateUI(data, analysis);

    } catch (e) {
        console.warn("Sem dados no banco ainda ou erro:", e.message);
        // Mostra mensagem amigável
        document.getElementById('scoreCard').innerHTML = `
            <h2 class="text-2xl font-bold text-center mb-6">Índice Clim Care</h2>
            <p class="text-amber-400 text-center py-12">Aguardando primeira leitura do dispositivo...</p>
        `;
    }
}

// Inicialização
window.onload = () => {
    console.log("🚀 Dashboard iniciado");
    waitForSupabase(() => {
        loadData();
        setInterval(loadData, 30000); // atualiza a cada 30s
    });
};
