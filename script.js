// ==================== CONFIG SUPABASE ====================
const SUPABASE_URL = 'https://iaylyacrzurcjwvtecpu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pkzx4u5U9Xr407syiBE9yA_G7hUvGaw';

let supabaseClient = null;

// ==================== INICIALIZAÇÃO SUPABASE ====================
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
  if (!supabaseClient) return;

  try {
    const { data, error } = await supabaseClient
      .from('sensor_readings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    if (!data) {
      console.log("Nenhuma leitura encontrada ainda");
      return;
    }

    console.log("📡 Leitura recebida do Supabase:", data);

    // Alimenta a análise
    const analysis = await analyzeEnvironment(data);

    // Atualiza a interface com foco em análise
    updateUIWithAnalysis(data, analysis);

  } catch (err) {
    console.warn("Erro ao buscar do Supabase (usando simulado):", err.message);
    // Fallback simulado
    const simulated = {
      deviceId: 11,
      temperature: 24.7,
      humidity: 51.2,
      co2: 730,
      pm25: 2.8,
      pm10: 6.0
    };
    const analysis = await analyzeEnvironment(simulated);
    updateUIWithAnalysis(simulated, analysis);
  }
}

// ==================== ATUALIZAR INTERFACE ====================
function updateUIWithAnalysis(reading, analysis) {
  // Device Info
  document.getElementById('deviceInfo').innerHTML = `
    <div class="flex items-center gap-3">
      <div class="w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
      <div>
        <span class="font-semibold">ONLINE</span><br>
        <span class="text-sm text-slate-400">ID: ${reading.deviceId || '—'}</span>
      </div>
    </div>
  `;

  // Score Card
  const scoreColor = analysis.score >= 90 ? '#22c55e' : 
                    analysis.score >= 75 ? '#3b82f6' : 
                    analysis.score >= 50 ? '#eab308' : '#ef4444';

  document.getElementById('scoreCard').innerHTML = `
    <h2 class="text-2xl font-bold mb-4 text-center">Índice Clim Care</h2>
    <div class="flex justify-center">
      <div style="width:170px;height:170px;border-radius:9999px;border:16px solid ${scoreColor};display:flex;align-items:center;justify-content:center;font-size:58px;font-weight:700;color:${scoreColor}">
        ${analysis.score}
      </div>
    </div>
    <p class="text-center mt-4 text-2xl font-semibold">${analysis.status}</p>
  `;

  // Métricas principais (resumidas)
  document.getElementById('cards').innerHTML = `
    <div class="card text-center">
      <div class="text-5xl">🌡️</div>
      <div class="text-3xl font-bold mt-3">${reading.temperature?.toFixed(1) || '—'}°C</div>
      <div class="text-xs text-slate-400">Temperatura</div>
    </div>
    <div class="card text-center">
      <div class="text-5xl">💧</div>
      <div class="text-3xl font-bold mt-3">${reading.humidity?.toFixed(1) || '—'}%</div>
      <div class="text-xs text-slate-400">Umidade</div>
    </div>
    <div class="card text-center">
      <div class="text-5xl">🌬️</div>
      <div class="text-3xl font-bold mt-3">${reading.co2 || '—'}</div>
      <div class="text-xs text-slate-400">CO₂ ppm</div>
    </div>
  `;

  // Diagnóstico, Alertas e Mitigações
  document.getElementById('statusCard').innerHTML = `
    <h2 class="text-xl font-bold mb-4">Diagnóstico Ambiental</h2>
    <div class="space-y-3 text-slate-300">
      ${analysis.diagnosis.map(d => `<p>• ${d}</p>`).join('')}
    </div>
  `;

  document.getElementById('alertsCard').innerHTML = `
    <h2 class="text-xl font-bold mb-4">Alertas</h2>
    <ul class="space-y-2">
      ${analysis.alerts.map(a => `<li class="text-amber-400">⚠️ ${a}</li>`).join('')}
    </ul>
  `;

  document.getElementById('mitigationCard').innerHTML = `
    <h2 class="text-xl font-bold mb-4">Recomendações de Mitigação</h2>
    <ul class="space-y-2 text-emerald-400">
      ${analysis.mitigations.map(m => `<li>✓ ${m}</li>`).join('')}
    </ul>
  `;
}

// ==================== INICIALIZAÇÃO ====================
window.onload = async () => {
  await initSupabase();
  await loadLatestReading();

  // Atualização automática a cada 30 segundos
  setInterval(loadLatestReading, 30000);
};
