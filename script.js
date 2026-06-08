// ==================== CONFIGURAÇÃO ====================
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

// ==================== REGRAS DE ALERTAS ====================
const rules = [
  {
    condition: (d) => d.temperature > 26 && d.humidity > 60,
    title: "Condições Abafadas",
    severity: "amber",
    diagnosis: "Temperatura alta combinada com umidade elevada causa desconforto e fadiga.",
    mitigation: "Aumentar ventilação, ligar ar-condicionado ou desumidificador."
  },
  {
    condition: (d) => d.humidity > 65 && d.temperature < 22,
    title: "Risco de Mofo e Condensação",
    severity: "red",
    diagnosis: "Umidade alta + temperatura baixa favorece proliferação de fungos e bactérias.",
    mitigation: "Acionar aquecimento, reduzir resfriamento do AC, fechar janelas."
  },
  {
    condition: (d) => d.co2 > 1000,
    title: "Ventilação Insuficiente",
    severity: "amber",
    diagnosis: "Nível elevado de CO₂ indica acúmulo de bioefluentes (baixa renovação de ar).",
    mitigation: "Abrir janelas, aumentar taxa de ar fresco no HVAC."
  },
  {
    condition: (d) => d.pm25 > 25,
    title: "Poluição por Partículas",
    severity: "red",
    diagnosis: "Concentração alta de PM2.5 pode afetar vias respiratórias.",
    mitigation: "Usar purificador com filtro HEPA, evitar fontes geradoras."
  }
];

function getAlerts(data) {
  return rules.filter(rule => rule.condition(data));
}

// ==================== RENDERIZAÇÃO ====================
function renderDashboard() {
  // Cards
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

  // Alertas
  const alerts = getAlerts(currentData);
  const alertsHTML = alerts.length ? alerts.map(alert => `
    <div class="bg-gray-800 border-l-4 border-${alert.severity}-500 p-4 rounded-xl">
      <div class="flex items-start gap-3">
        <i class="fas fa-exclamation-triangle text-${alert.severity}-400 mt-1"></i>
        <div>
          <h3 class="font-semibold">${alert.title}</h3>
          <p class="text-sm text-gray-400">${alert.diagnosis}</p>
          <p class="text-sm text-emerald-400 mt-2"><strong>Mitigação:</strong> ${alert.mitigation}</p>
        </div>
      </div>
    </div>
  `).join('') : `<p class="text-emerald-400">✅ Todas as condições dentro da faixa aceitável.</p>`;

  document.getElementById('alerts-container').innerHTML = alertsHTML;
}

// Buscar dados
async function fetchLatestReading() {
  if (!supabase) return;

  try {
    const { data } = await supabase
      .from('sensor_readings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (data) currentData = { ...currentData, ...data };
  } catch (e) {}
  renderDashboard();
}

function initDashboard() {
  console.log("🚀 Iniciando Dashboard...");
  if (typeof Supabase !== "undefined") {
    supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("✅ Supabase carregado!");
  } else {
    console.warn("⚠️ Supabase não carregou. Modo simulado ativo.");
  }
  renderDashboard();
  fetchLatestReading();
  setInterval(fetchLatestReading, 10000);
}

window.onload = initDashboard;
