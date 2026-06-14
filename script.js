console.log("🚀 Dashboard iniciado - Versão com Supabase");

const SUPABASE_URL = 'https://iaylyacrzurcjwvtecpu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pkzx4u5U9Xr407syiBE9yA_G7hUvGaw';

let supabaseClient = null;

window.onload = async () => {
    console.log("✅ Página carregada");

    // Inicializa Supabase
    if (typeof Supabase !== "undefined") {
        supabaseClient = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("✅ Supabase inicializado com sucesso!");
    } else {
        console.error("❌ Supabase JS não foi carregado");
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

            if (error) console.error("Erro Supabase:", error);
            if (data) reading = data;
        } catch (e) {
            console.warn("Erro ao buscar dados:", e.message);
        }
    }

    // Se não tiver dados ainda, usa simulado (temporário)
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
        <div class="p-4 bg-emerald-900/30 rounded-2xl flex items-center gap-3">
            <div class="w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
            <div>ONLINE • Dispositivo ${reading.deviceId}</div>
        </div>
    `;

    const scoreColor = analysis.score >= 90 ? '#22c55e' : analysis.score >= 75 ? '#eab308' : '#ef4444';

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
            <div class="text-4xl font-bold">${reading.temperature?.toFixed(1) || '—'}°C</div>
        </div>
        <div class="card text-center p
