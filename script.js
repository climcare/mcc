// ==================== CONFIGURAÇÃO SUPABASE ====================
const SUPABASE_URL = 'https://iaylyacrzurcjwvtecpu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pkzx4u5U9Xr407syiBE9yA_G7hUvGaw';

const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Dados simulados como fallback
let currentData = {
  "deviceId": "HOSPITAL-01",
  "temperature": 24.7,
  "humidity": 51.2,
  "co2": 730,
  "pm25": 2.8,
  "pm10": 6.0,
  "signalStrength": -67,
  "battery": 88,
  "timestamp": new Date().toISOString()
};

let history = []; // Para gráfico

// ==================== REGRAS E THRESHOLDS ====================
let thresholds = {};

// Carregar regras do JSON
async function loadRules() {
  try {
    const res = await fetch('rules.json');
    return await res.json();
  } catch (e) {
    console.warn("Não encontrou rules.json, usando defaults");
    return { thresholds: {} };
  }
}

// Função para status
function getStatus(value, param) {
  const t = thresholds[param] || {};
  if (param === 'temperature' || param === 'humidity') {
    if (value > (t.critical_max || 30) || value < (t.critical_min || 18)) return { color: 'red', label: 'Crítico' };
    if (value > (t.attention_max || 26) || value < (t.attention_min || 20)) return { color: 'amber', label: 'Atenção' };
  } else if (param === 'co2') {
    if (value > 1500) return { color: 'red', label: 'Crítico' };
    if (value > 1000) return { color: 'amber', label: 'Atenção' };
  } else if (param === 'pm25') {
    if (value > 25) return { color: 'red', label: 'Crítico' };
    if (value > 10) return { color: 'amber', label: 'Atenção' };
  }
  return { color: 'emerald', label: 'Bom' };
}

// Função principal
async function renderDashboard() {
  const rules = await loadRules();
  thresholds = rules.thresholds || {};

  // Atualiza cards (exemplo)
  document.getElementById('temp-value').textContent = currentData.temperature.toFixed(1) + '°C';
  document.getElementById('humidity-value').textContent = currentData.humidity.toFixed(0) + '%';
  document.getElementById('co2-value').textContent = Math.round(currentData.co2);

  // Detectar anomalias (lógica existente)
  console.log("✅ Dashboard atualizado com dados:", currentData);
}

// Carregar ao iniciar
document.addEventListener('DOMContentLoaded', () => {
  renderDashboard();
  
  // Atualizar a cada 30 segundos
  setInterval(renderDashboard, 30000);
});
