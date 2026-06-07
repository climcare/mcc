// Dados simulados (substitua por Firebase mais tarde)
let currentData = {
  "deviceId": "HOSPITAL-01",
  "temperature": 29.15,
  "humidity": 66.96,
  "co2": 465.00,
  "pm25": 6.36,
  "pm10": 6.74,
  "signalStrength": -65,
  "timestamp": new Date().toISOString()
};

let history = []; // Para gráfico

async function loadRules() {
  const res = await fetch('rules.json');
  return await res.json();
}

function getStatus(value, param) {
  const t = thresholds[param];
  if (!t) return { color: 'gray', label: 'Normal' };

  if (param === 'temperature' || param === 'humidity') {
    if (value > t.critical_max || value < t.critical_min) return { color: 'red', label: 'Crítico' };
    if (value > t.attention_max || value < t.attention_min) return { color: 'amber', label: 'Atenção' };
  } else if (param === 'co2' || param === 'pm25' || param === 'pm10') {
    if (value > t.critical) return { color: 'red', label: 'Crítico' };
    if (value > t.attention) return { color: 'amber', label: 'Atenção' };
  }
  return { color: 'emerald', label: 'Bom' };
}

let thresholds = {};

async function renderDashboard() {
  const rules = await loadRules();
  thresholds = rules.thresholds;

  // Render measurements
  const container = document.getElementById('measurements');
  container.innerHTML = `
    <div class="bg-gray-900 rounded-3xl p-6 card">
      <div class="flex items-center gap-3 text-emerald-400 mb-2">
        <i class="fas fa-thermometer-half text-3xl"></i>
        <div>
          <div class="text-4xl font-bold">${currentData.temperature.toFixed(1)}°C</div>
          <div class="text-sm text-gray-400">Temperatura</div>
        </div>
      </div>
      <div class="h-2 bg-gray-700 rounded-full mt-4 overflow-hidden">
        <div class="h-full bg-emerald-400 w-3/4"></div>
      </div>
    </div>

    <div class="bg-gray-900 rounded-3xl p-6 card">
      <div class="flex items-center gap-3 text-sky-400 mb-2">
        <i class="fas fa-droplet text-3xl"></i>
        <div>
          <div class="text-4xl font-bold">${currentData.humidity.toFixed(0)}%</div>
          <div class="text-sm text-gray-400">Umidade Relativa</div>
        </div>
      </div>
    </div>

    <div class="bg-gray-900 rounded-3xl p-6 card">
      <div class="flex items-center gap-3 text-violet-400 mb-2">
        <i class="fas fa-wind text-3xl"></i>
        <div>
          <div class="text-4xl font-bold">${Math.round(currentData.co2)}</div>
          <div class="text-sm text-gray-400">CO₂ (ppm)</div>
        </div>
      </div>
    </div>

    <div class="bg-gray-900 rounded-3xl p-6 card">
      <div class="flex items-center gap-3 text-rose-400 mb-2">
        <i class="fas fa-dust text-3xl"></i>
        <div>
          <div class="text-4xl font-bold">${currentData.pm25.toFixed(1)}</div>
          <div class="text-sm text-gray-400">PM2.5 (µg/m³)</div>
        </div>
      </div>
    </div>
  `;

  // Detectar anomalias
  renderAlerts(rules);
  renderSummary(rules);
}

function renderAlerts(rules) {
  const container = document.getElementById('alerts-container');
  let alertsHTML = '';

  const temp = currentData.temperature;
  const hum = currentData.humidity;
  const co2 = currentData.co2;
  const pm = currentData.pm25;

  rules.scenarios.forEach(scenario => {
    let match = false;

    if (scenario.condition === "temp_high && humidity_high") {
      match = temp > 26 && hum > 60;
    } else if (scenario.condition === "temp_low && humidity_high") {
      match = temp < 20 && hum > 65;
    } else if (scenario.condition === "temp_high && humidity_low") {
      match = temp > 26 && hum < 40;
    } else if (scenario.condition === "co2_high") {
      match = co2 > 1000;
    } else if (scenario.condition === "pm_high") {
      match = pm > 25;
    }

    if (match) {
      const color = scenario.severity === 'high' ? 'red' : 'amber';
      alertsHTML += `
        <div class="alert bg-gray-800 border border-${color}-500/30 rounded-2xl p-5">
          <div class="flex items-start gap-4">
            <div class="text-3xl">⚠️</div>
            <div class="flex-1">
              <h3 class="font-semibold text-lg">${scenario.name}</h3>
              <p class="text-gray-300 mt-1">${scenario.diagnosis}</p>
              <div class="mt-4">
                <strong class="text-sm text-gray-400">MITIGAÇÃO:</strong>
                <ul class="list-disc list-inside text-sm mt-1 space-y-1 text-gray-300">
                  ${scenario.mitigation.map(m => `<li>${m}</li>`).join('')}
                </ul>
              </div>
            </div>
          </div>
        </div>`;
    }
  });

  if (!alertsHTML) {
    alertsHTML = `<div class="bg-emerald-900/30 border border-emerald-500/30 rounded-2xl p-8 text-center">
      <p class="text-2xl mb-2">✅ Tudo dentro dos padrões!</p>
      <p class="text-gray-400">Nenhuma anomalia detectada no momento.</p>
    </div>`;
  }

  container.innerHTML = alertsHTML;
}

function renderSummary(rules) {
  const summaryDiv = document.getElementById('summary');
  summaryDiv.innerHTML = `
    <div class="bg-gray-800 rounded-2xl p-5">
      <div class="text-emerald-400 text-sm font-medium">STATUS GERAL</div>
      <div class="text-5xl font-bold mt-2 text-emerald-400">BOM</div>
      <p class="text-gray-400 mt-1">Última leitura: agora</p>
    </div>

    <div>
      <strong class="block text-gray-400 mb-3">AÇÕES RECOMENDADAS</strong>
      <div class="space-y-3 text-sm">
        <div class="flex gap-3">
          <i class="fas fa-door-open text-emerald-400 mt-1"></i>
          <div>Mantenha boa ventilação natural sempre que possível</div>
        </div>
        <div class="flex gap-3">
          <i class="fas fa-filter text-emerald-400 mt-1"></i>
          <div>Verifique filtros do ar-condicionado mensalmente</div>
        </div>
      </div>
    </div>
  `;
}

// Gráfico simples
let chart;
function initChart() {
  const ctx = document.getElementById('evolutionChart');
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
      datasets: [{
        label: 'Temperatura (°C)',
        data: [28, 27.5, 26.8, 29.1, 28.4, 27.9],
        borderColor: '#f59e0b',
        tension: 0.4
      }, {
        label: 'Umidade (%)',
        data: [62, 65, 68, 67, 66, 64],
        borderColor: '#22d3ee',
        tension: 0.4
      }]
    },
    options: { responsive: true, plugins: { legend: { position: 'top' } } }
  });
}

function updateChart() {
  // Aqui você carregaria dados reais do Firebase
  console.log("Atualizando gráfico...");
}

function sendTelegramAlert() {
  alert("✅ Alerta enviado para o Telegram! (Integração real via backend)");
}

// Inicializar
window.onload = () => {
  renderDashboard();
  initChart();

  // Simular atualização a cada 30 segundos
  setInterval(() => {
    currentData.temperature = 28.8 + Math.random() * 2;
    currentData.humidity = 64 + Math.random() * 6;
    renderDashboard();
  }, 30000);
};
