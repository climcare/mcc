// ==================== CONFIGURAÇÃO ====================
const SUPABASE_URL = 'https://iaylyacrzurcjwvtecpu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pkzx4u5U9Xr407syiBE9yA_G7hUvGaw';

let supabaseClient = null;   // ← Mudamos o nome para evitar conflito
let currentData = {
  temperature: 24.7,
  humidity: 51.2,
  co2: 730,
  pm25: 2.8,
  pm10: 6.0,
  battery: 88,
  signalStrength: -67
};

let rulesData = { scenarios: [] };

// Carregar regras
async function loadRules() {
  try {
    const res = await fetch('rules.json');
    rulesData = await res.json();
    console.log("✅ Regras carregadas do rules.json");
  } catch (e) {
    console.warn("⚠️ rules.json não encontrado");
  }
}

// Renderizar Dashboard
function renderDashboard() {
  // === CARDS ===
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
        <div><div class="text-4xl font-bold">${currentData.humidity.toFixed(0)}%</div><div class="
