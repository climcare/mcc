// ==================== CONFIGURAÇÃO SUPABASE ====================
const SUPABASE_URL = 'https://iaylyacrzurcjwvtecpu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pkzx4u5U9Xr407syiBE9yA_G7hUvGaw';

let supabase = null;
let currentData = {
  temperature: 24.7,
  humidity: 51.2,
  co2: 730,
  pm25: 2.8,
  pm10: 6.0,
  battery: 88,
  signalStrength: -67
};

// ==================== INICIALIZAÇÃO ====================
console.log("🚀 Iniciando Dashboard...");

function initDashboard() {
  // Tenta inicializar Supabase
  if (typeof Supabase !== "undefined") {
    supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("✅ Supabase carregado com sucesso!");
  } else {
    console.warn("⚠️ Supabase não carregou. Modo simulado ativo.");
  }

  renderDashboard();
  fetchLatestReading();

  // Atualiza a cada 10 segundos
  setInterval(fetchLatestReading, 10000);
}

function renderDashboard() {
  document.getElementById('measurements').innerHTML = `
    <div class="bg-gray-900 rounded-3xl p-6 card">
      <div class="flex items-center gap-3 text-emerald-400 mb-2">
        <i class="fas fa-thermometer-half text-3xl"></i>
        <div><div class="text-4xl font-bold">${currentData.temperature.toFixed(1)}°C</div><div class="text-sm text-gray-400">Temperatura</div></div>
      </div>
    </div>
    <div class="bg-gray-900 rounded-3xl p-6 card">
      <div class="flex items-center gap-3 text-sky-400 mb-2">
        <i class="fas fa-droplet text-3xl"></i>
        <div><div class="text-4xl font-bold">${currentData.humidity.toFixed(0)}%</div><div class="text-sm text-gray-400">Umidade</div></div>
      </div>
    </div>
    <div class="bg-gray-900 rounded-3xl p-6 card">
      <div class="flex items-center gap-3 text-violet-400 mb-2">
        <i class="fas fa-wind text-3xl"></i>
        <div><div class="text-4xl font-bold">${Math.round(currentData.co2)}</div><div class="text-sm text-gray-400">CO₂ ppm</div></div>
      </div>
    </div>
    <div class="bg-gray-900 rounded-3xl p-6 card">
      <div class="flex items-center gap-3 text-rose-400 mb-2">
        <i class="fas fa-dust text-3xl"></i>
        <div><div class="text-4xl font-bold">${currentData.pm25.toFixed(1)}</div><div class="text-sm text-gray-400">PM2.5 µg/m³</div></div>
      </div>
    </div>
  `;
}

// Buscar último registro
async function fetchLatestReading() {
  if (!supabase) {
    console.log("🔄 Usando dados simulados (Supabase não disponível)");
    renderDashboard();
    return;
  }

  try {
    const { data, error } = await supabase
      .from('sensor_readings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    if (data) {
      currentData = { ...currentData, ...data };
      console.log("📡 Dados reais do Supabase:", currentData);
    }
  } catch (e) {
    console.warn("Tabela vazia ou erro:", e.message);
  }
  renderDashboard();
}

// Iniciar quando a página carregar
window.onload = initDashboard;
