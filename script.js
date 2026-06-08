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

// ==================== CARREGAR REGRAS DO JSON ====================
let rulesData = { scenarios: [] };

async function loadRules() {
  try {
    const res = await fetch('rules.json');
    rulesData = await res.json();
    console.log("✅ Regras carregadas do rules.json");
  } catch (e) {
    console.warn("Não encontrou rules.json");
  }
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

  // Alertas usando rules.json (melhor usar scenarios)
  let alertsHTML = '';
  rulesData.scenarios.forEach(scenario => {
    // Lógica simples por enquanto (pode ser expandida)
    if (scenario.id === "abafado" && currentData.temperature > 26 && currentData.humidity > 60) {
      alertsHTML += createAlertHTML(scenario);
    }
    if (scenario.id === "mofo" && currentData.humidity > 65 && currentData.temperature < 22) {
      alertsHTML += createAlertHTML(scenario);
    }
    if (scenario.id === "ventilacao_pobre" && currentData.co2 > 1000) {
      alertsHTML += createAlertHTML(scenario);
    }
    if (scenario.id === "particulas" && currentData.pm25 > 25) {
      alertsHTML += createAlertHTML(scenario);
    }
  });

  if (!alertsHTML) {
    alertsHTML = `<div class="bg-emerald-900/30 p-6 rounded-3xl text-center text-emerald-400">✅ Todas as condições estão dentro da faixa aceitável (OMS/Anvisa).</div>`;
  }

  document.getElementById('alerts-container').innerHTML = alertsHTML;
}

function createAlertHTML(scenario) {
  return `
    <div class="bg-gray-800 border-l-4 border-red-500 p-5 rounded-2xl">
      <h3 class="font-bold text-lg">${scenario.name}</h3>
      <p class="text-gray-300 mt-2">${scenario.diagnosis}</p>
      <p class="text-emerald-400 mt-4"><strong>Mitigação:</strong> ${scenario.mitigation.join(" • ")}</p>
    </div>
  `;
}

// ==================== INICIALIZAÇÃO ====================
async function initDashboard() {
  console.log("🚀 Iniciando Dashboard...");
  
  await loadRules();

  // Supabase
  if (typeof Supabase !== "undefined") {
    supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("✅ Supabase carregado");
  } else {
    console.warn("⚠️ Supabase não carregou - modo simulado");
  }

  renderDashboard();
  setInterval(renderDashboard, 8000);
}

window.onload = initDashboard;
