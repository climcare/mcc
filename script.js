console.log("🚀 Tentando conectar ao Supabase...");

const SUPABASE_URL = 'https://iaylyacrzurcjwvtecpu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pkzx4u5U9Xr407syiBE9yA_G7hUvGaw';

let supabaseClient = null;

window.onload = async () => {
    console.log("✅ Página carregada");

    // Correção do case-sensitivity (S minúsculo)
    if (typeof supabase !== "undefined") {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("✅ Supabase Client criado!");
        
        await lerUltimaLeitura();
        setInterval(lerUltimaLeitura, 15000); // Atualiza a cada 15s
    } else {
        console.error("❌ Supabase JS não carregou. Verifique o <script> no HTML.");
    }
};

async function lerUltimaLeitura() {
    if (!supabaseClient) return;

    try {
        const { data, error } = await supabaseClient
            .from('sensor_readings')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            console.error("Erro na consulta:", error);
            return;
        }

        if (data) {
            console.log("✅ Última leitura encontrada:", data);
            
            // 🌟 CHAMANDO A SUA FUNÇÃO DE ANÁLISE AQUI:
            const analise = await analyzeEnvironment(data);
            
            // 🌟 RENDERIZANDO OS DADOS NO HTML
            renderizarDashboard(data, analise);
        } else {
            console.log("Nenhuma leitura encontrada ainda");
        }
    } catch (err) {
        console.error("Erro ao ler banco:", err);
    }
}

// Função auxiliar para injetar os dados analisados nas suas divs do HTML
function renderizarDashboard(reading, analise) {
    // 1. Score Card e Status Geral
    document.getElementById('scoreCard').innerHTML = `
        <h2 class="text-xl font-semibold text-slate-400 mb-2">Score de Qualidade</h2>
        <div class="text-5xl font-black text-emerald-400">${analise.score}</div>
        <p class="text-sm mt-2 font-medium">Status: <span class="text-amber-400">${analise.status}</span></p>
    `;

    // 2. Cards com os valores individuais dos Sensores
    document.getElementById('cards').innerHTML = `
        <div class="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <p class="text-slate-400 text-sm font-medium">Temperatura</p>
            <p class="text-2xl font-bold mt-1">${reading.temperature?.toFixed(1) || 0}°C</p>
        </div>
        <div class="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <p class="text-slate-400 text-sm font-medium">Umidade</p>
            <p class="text-2xl font-bold mt-1">${reading.humidity?.toFixed(1) || 0}%</p>
        </div>
        <div class="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <p class="text-slate-400 text-sm font-medium">CO₂</p>
            <p class="text-2xl font-bold mt-1">${reading.co2 || 0} ppm</p>
        </div>
    `;

    // 3. Alertas
    const alertsHtml = analise.alerts.map(a => `<li class="text-red-400 font-semibold">⚠️ ${a}</li>`).join('') || '<li class="text-emerald-400">✅ Nenhum alerta ativo</li>';
    document.getElementById('alertsCard').innerHTML = `
        <h3 class="text-lg font-bold mb-3 text-red-500">Alertas Ativos</h3>
        <ul class="space-y-2 text-sm">${alertsHtml}</ul>
    `;

    // 4. Diagnóstico (Status do Ambiente)
    const diagnosisHtml = analise.diagnosis.map(d => `<li class="text-slate-300">📌 ${d}</li>`).join('') || '<li class="text-slate-400">Ambiente operando dentro dos conformes.</li>';
    document.getElementById('environmentStatus').innerHTML = `
        <h3 class="text-lg font-bold mb-3">Diagnóstico do Ambiente</h3>
        <ul class="space-y-2 text-sm">${diagnosisHtml}</ul>
    `;

    // 5. Mitigações (Ações Recomendadas)
    const mitigationHtml = analise.mitigations.map(m => `<li class="text-slate-300">💡 ${m}</li>`).join('') || '<li class="text-slate-400">Nenhuma ação necessária.</li>';
    document.getElementById('mitigationCard').innerHTML = `
        <h3 class="text-lg font-bold mb-3 text-sky-400">Ações Recomendadas</h3>
        <ul class="space-y-2 text-sm">${mitigationHtml}</ul>
    `;

    // 6. Informações do Dispositivo (Header)
    document.getElementById('deviceInfo').innerHTML = `
        <p class="text-xs text-slate-400">Dispositivo ID: <span class="font-mono text-white">${reading.device_id || 'Desconhecido'}</span></p>
        <p class="text-xs text-slate-400 mt-1">Última atualização: <span class="text-white">${new Date(reading.created_at).toLocaleTimeString('pt-BR')}</span></p>
    `;
}
