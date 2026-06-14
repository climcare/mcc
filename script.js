console.log("🚀 Dashboard carregando...");

// Dados simulados (até conectar o Supabase)
let currentData = {
  deviceId: "HOSPITAL-01",
  temperature: 24.1,
  humidity: 64,
  co2: 730,
  pm25: 8.5,
  signalStrength: -67,
  created_at: new Date().toISOString()
};

// Função principal
async function updateDashboard() {
  try {
    const analysis = await analyzeEnvironment(currentData);

    // Device Info
    document.getElementById('deviceInfo').innerHTML = `
      <div class="flex items-center gap-3 bg-emerald-900/30 p-4 rounded-2xl">
        <div class="w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
        <div>
          <span class="font-semibold text-emerald-400">ONLINE</span><br>
          <span class="text-sm">${currentData.deviceId}</span>
        </div>
      </div>
    `;

    // Score Card
    const scoreColor = analysis.score >= 90 ? '#22c55e' : analysis.score >= 75 ? '#eab308' : '#ef4444';
    document.getElementById('scoreCard').innerHTML = `
      <h2 class="text-2xl font-bold text-center mb-4">Índice Clim Care</h2>
      <div class="flex justify-center my-6">
        <div style="width: 170px; height: 170px; border-radius: 9999px; border: 16px solid ${scoreColor}; 
                    display:flex; align-items:center; justify-content:center; font-size: 58px; font-weight: 700; color: ${scoreColor};">
          ${analysis.score}
        </div>
      </div>
      <p class="text-center text-3xl font-semibold">${analysis.status}</p>
    `;

    // Métricas
    document.getElementById('cards').innerHTML = `
      <div class="card text-center p-6">
        <div class="text-5xl mb-2">🌡️</div>
        <div class="text-4xl font-bold">${currentData.temperature}°C</div>
        <div class="text-slate-400 text-sm">Temperatura</div>
      </div>
      <div class="card text-center p-6">
        <div class="text-5xl mb-2">💧</div>
        <div class="text-4xl font-bold">${currentData.humidity}%</div>
        <div class="text-slate-400 text-sm">Umidade</div>
      </div>
      <div class="card text-center p-6">
        <div class="text-5xl mb-2">🌬️</div>
        <div class="text-4xl font-bold">${currentData.co2}</div>
        <div class="text-slate-400 text-sm">CO₂ ppm</div>
      </div>
    `;

    // Status e Alertas
    document.getElementById('statusCard').innerHTML = `
      <h2 class="text-xl font-bold mb-4">Diagnóstico</h2>
      <div class="text-slate-300 leading-relaxed">${analysis.diagnosis.join('<br><br>')}</div>
    `;

    document.getElementById('alertsCard').innerHTML = `
      <h2 class="text-xl font-bold mb-4">Alertas</h2>
      <ul class="space-y-3">${analysis.alerts.map(a => `<li class="text-amber-400">⚠️ ${a}</li>`).join('')}</ul>
    `;

    document.getElementById('mitigationCard').innerHTML = `
      <h2 class="text-xl font-bold mb-4">Mitigações Recomendadas</h2>
      <ul class="space-y-3">${analysis.mitigations.map(m => `<li class="text-emerald-400">✓ ${m}</li>`).join('')}</ul>
    `;

  } catch (e) {
    console.error("Erro:", e);
  }
}

// Inicialização
window.onload = () => {
  console.log("✅ Página carregada com sucesso!");
  updateDashboard();

  // Atualização automática (simulada)
  setInterval(() => {
    currentData.temperature = (22 + Math.random() * 6).toFixed(1);
    currentData.humidity = Math.floor(45 + Math.random() * 25);
    updateDashboard();
  }, 10000);
};
