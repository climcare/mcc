// ==================== CONFIGURAÇÃO SUPABASE ====================
const SUPABASE_URL = 'https://iaylyacrzurcjwvtecpu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pkzx4u5U9Xr407syiBE9yA_G7hUvGaw';

let supabaseClient = null;

// ==================== INICIALIZAÇÃO ====================
async function initSupabase() {
    if (typeof Supabase !== "undefined") {
        supabaseClient = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("✅ Supabase conectado com sucesso!");
    } else {
        console.error("❌ Supabase JS não carregou");
    }
}

async function loadLatestReading() {
    if (!supabaseClient) {
        console.warn("Supabase ainda não inicializado");
        return;
    }

    try {
        const { data, error } = await supabaseClient
            .from('sensor_readings')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1);

        if (error) throw error;
        if (!data || data.length === 0) {
            console.log('Nenhuma leitura encontrada ainda');
            return;
        }

        const reading = data[0];
        console.log('📡 Leitura recebida:', reading);

        // Análise completa
        const analysis = await analyzeEnvironment(reading);

        // Atualiza Device Info
        document.getElementById('deviceInfo').innerHTML = `
            <div class="flex items-center gap-2 mb-2">
                <div class="w-3 h-3 rounded-full bg-green-500"></div>
                <span class="font-semibold">ONLINE</span>
            </div>
            <div class="text-sm text-slate-300">
                Dispositivo: <strong>${reading.deviceId || 'N/A'}</strong>
            </div>
            <div class="text-xs text-slate-500">
                Última atualização: ${new Date(reading.created_at).toLocaleTimeString('pt-BR')}
            </div>
        `;

        // Score Card
        const scoreColor = analysis.score >= 90 ? '#22c55e' : 
                          analysis.score >= 75 ? '#3b82f6' : 
                          analysis.score >= 50 ? '#eab308' : '#ef4444';

        document.getElementById('scoreCard').innerHTML = `
            <h2 class="text-2xl font-bold mb-4 text-center">Índice Clim Care</h2>
            <div class="flex justify-center">
                <div style="width: 160px; height: 160px; border-radius: 50%; border: 14px solid ${scoreColor}; 
                            display: flex; align-items: center; justify-content: center; font-size: 48px; font-weight: bold; color: ${scoreColor};">
                    ${analysis.score}
                </div>
            </div>
            <div class="text-center mt-4 text-2xl font-semibold">${analysis.status}</div>
        `;

        // Cards de métricas
        document.getElementById('cards').innerHTML = `
            <div class="card">
                <div class="text-xs uppercase tracking-wider text-slate-400">Temperatura</div>
                <div class="text-3xl font-bold text-cyan-400 mt-2">🌡️ ${reading.temperature?.toFixed(1) || '--'}°C</div>
            </div>
            <div class="card">
                <div class="text-xs uppercase tracking-wider text-slate-400">Umidade</div>
                <div class="text-3xl font-bold text-blue-400 mt-2">💧 ${reading.humidity?.toFixed(1) || '--'}%</div>
            </div>
            <div class="card">
                <div class="text-xs uppercase tracking-wider text-slate-400">CO₂</div>
                <div class="text-3xl font-bold text-violet-400 mt-2">${reading.co2 || '--'} ppm</div>
            </div>
        `;

        // Diagnóstico, Alertas e Mitigações
        document.getElementById('statusCard').innerHTML = `
            <h2 class="text-xl font-bold mb-3">Diagnóstico Ambiental</h2>
            <ul class="space-y-2 text-slate-300">
                ${analysis.diagnosis.map(d => `<li>• ${d}</li>`).join('')}
            </ul>
        `;

        document.getElementById('alertsCard').innerHTML = `
            <h2 class="text-xl font-bold mb-3">Alertas Ativos</h2>
            <ul class="space-y-2 text-amber-400">
                ${analysis.alerts.map(a => `<li>⚠️ ${a}</li>`).join('')}
            </ul>
        `;

        document.getElementById('mitigationCard').innerHTML = `
            <h2 class="text-xl font-bold mb-3">Ações Recomendadas</h2>
            <ul class="space-y-2 text-emerald-400">
                ${analysis.mitigations.map(m => `<li>✓ ${m}</li>`).join('')}
            </ul>
        `;

    } catch (err) {
        console.error("Erro ao carregar leitura:", err);
    }
}

// Inicialização
window.onload = async () => {
    await initSupabase();
    await loadLatestReading();
    setInterval(loadLatestReading, 60000); // Atualiza a cada 60 segundos
};
