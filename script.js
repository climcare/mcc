// ==================== CONFIG SUPABASE ====================
const SUPABASE_URL = 'https://iaylyacrzurcjwvtecpu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pkzx4u5U9Xr407syiBE9yA_G7hUvGaw';

let supabaseClient = null;

// ==================== INICIALIZAÇÃO ====================
function initSupabase() {
  if (typeof Supabase !== "undefined") {
    supabaseClient = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("✅ Supabase conectado com sucesso!");
  } else {
    console.error("❌ Supabase JS não carregou");
  }
}

// ==================== BUSCAR ÚLTIMA LEITURA ====================
async function loadLatestReading() {
  if (!supabaseClient) {
    showNoDataMessage("Supabase não inicializado");
    return;
  }

  try {
    const { data, error } = await supabaseClient
      .from('sensor_readings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    if (!data) {
      showNoDataMessage("Nenhuma leitura encontrada no banco ainda");
      return;
    }

    console.log("📡 Leitura recebida:", data);

    const analysis = await analyzeEnvironment(data);
    updateUIWithAnalysis(data, analysis);

  } catch (err) {
    console.error("Erro ao buscar dados:", err);
    showNoDataMessage("Erro ao conectar com o banco de dados");
  }
}

// ==================== EXIBIR MENSAGEM SEM DADOS ====================
function showNoDataMessage(message) {
  document.getElementById('scoreCard').innerHTML = `
    <h2 class="text-2xl font-bold mb-6 text-center">Índice Clim Care</h2>
    <div class="text-center py-12">
      <p class="text-amber-400 text-xl mb-4">⚠️ ${message}</p>
      <p class="text-slate-400">Aguardando primeira leitura do dispositivo...</p>
    </div>
  `;
}

// ==================== ATUALIZAR INTERFACE ====================
function updateUIWithAnalysis(reading, analysis) {
  // Device Info
  document.getElementById('deviceInfo').innerHTML = `
    <div class="flex items-center gap-3 bg-emerald-900/30 p-4 rounded-2xl">
      <div class="w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
      <div>
        <span class="font-semibold text-emerald-400">ONLINE</span><br>
        <span class="text-sm">Dispositivo ${reading.deviceId || '—'}</span>
      </div>
    </div>
  `;

  // Score
  const scoreColor = analysis.score >= 90 ? '#22c55e' : 
                    analysis.score >= 75 ? '#3b82f6' : 
                    analysis.score >= 50 ? '#eab308' : '#ef4444';

  document.getElementById('scoreCard').innerHTML = `
    <h2 class="text-2xl font-bold mb-4 text-center">Índice Clim Care</h2>
    <div class="flex justify-center my-6">
      <div style="width:170px;height:170px;border-radius:9999px;border:16px solid ${scoreColor};display:flex;align-items:center;justify-content:center;font-size:58px;font-weight:700;color:${scoreColor}">
        ${analysis.score}
      </div>
    </div>
    <p class="text-center text-3xl font-semibold">${analysis.status}</p>
  `;

  // Cards principais
  document.getElementById('cards').innerHTML = `
    <div class="card text-center p-6">
      <div class="text-5xl mb-2">🌡️</div>
      <div class="text-4xl font-bold">${reading.temperature?.toFixed(1) || '—'}°C</div>
      <div class="text-xs text-slate-400">Temperatura</div>
    </div>
    <div class="card text-center p-6">
      <div class="text-5xl mb-2">💧</div>
      <div class="text-4xl font-bold">${reading.humidity?.toFixed(1) || '—'}%</div>
      <div class="text-xs text-slate-400">Umidade</div>
    </div>
    <div class="card text-center p-6">
      <div class="text-5xl mb-2">🌬️</div>
      <div class="text-4xl font-bold">${reading.co2 || '—'}</div>
      <div class="text-xs text-slate-400">CO₂ ppm</div>
    </div>
  `;

  // Diagnóstico, Alertas e Mitigações
  document.getElementById('statusCard').innerHTML = `
    <h2 class="text-xl font-bold mb-4">Diagnóstico Ambiental</h2>
    <div class="space-y-3">${analysis.diagnosis.map(d => `<p class="text-slate-300">• ${d}</p>`).join('')}</div>
  `;

  document.getElementById('alertsCard').innerHTML = `
    <h2 class="text-xl font-bold mb-4">Alertas</h2>
    <ul class="space-y-2">${analysis.alerts.map(a => `<li class="text-amber-400">⚠️ ${a}</li>`).join('')}</ul>
  `;

  document.getElementById('mitigationCard').innerHTML = `
    <h2 class="text-xl font-bold mb-4">Recomendações de Mitigação</h2>
    <ul class="space-y-2">${analysis.mitigations.map(m => `<li class="text-emerald-400">✓ ${m}</li>`).join('')}</ul>
  `;
}

// ==================== INICIALIZAÇÃO ====================
window.onload = async () => {
  initSupabase();
  await loadLatestReading();
  
  // Atualiza a cada 30 segundos
  setInterval(loadLatestReading, 30000);
};
