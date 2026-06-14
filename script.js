// ==================== CONFIGURAÇÃO BÁSICA ====================
console.log("🚀 Dashboard iniciado");

let currentData = {
  temperature: 24.1,
  humidity: 64,
  co2: 730,
  deviceId: "HOSPITAL-01"
};

// Função de análise (chamada do analysis.js)
async function updateDashboard() {
    try {
        const analysis = await analyzeEnvironment(currentData);

        // Device Info
        document.getElementById('deviceInfo').innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                    <div class="font-semibold">Dispositivo Online</div>
                    <div class="text-sm text-slate-400">${currentData.deviceId}</div>
                </div>
            </div>
        `;

        // Score
        const scoreColor = analysis.score >= 90 ? '#22c55e' : analysis.score >= 75 ? '#eab308' : '#ef4444';
        document.getElementById('scoreCard').innerHTML = `
            <h2 class="text-2xl font-bold text-center mb-4">Índice Clim Care</h2>
            <div class="flex justify-center">
                <div style="width:150px;height:150px;border-radius:9999px;border:12px solid ${scoreColor};display:flex;align-items:center;justify-content:center;font-size:52px;font-weight:bold;color:${scoreColor}">
                    ${analysis.score}
                </div>
            </div>
            <p class="text-center mt-4 text-2xl font-semibold">${analysis.status}</p>
        `;

        // Cards básicos
        document.getElementById('cards').innerHTML = `
            <div class="card text-center">
                <div class="text-cyan-400 text-4xl">🌡️</div>
                <div class="text-3xl font-bold mt-2">${currentData.temperature}°C</div>
                <div class="text-xs text-slate-400">Temperatura</div>
            </div>
            <div class="card text-center">
                <div class="text-blue-400 text-4xl">💧</div>
                <div class="text-3xl font-bold mt-2">${currentData.humidity}%</div>
                <div class="text-xs text-slate-400">Umidade</div>
            </div>
            <div class="card text-center">
                <div class="text-violet-400 text-4xl">🌬️</div>
                <div class="text-3xl font-bold mt-2">${currentData.co2}</div>
                <div class="text-xs text-slate-400">CO₂ ppm</div>
            </div>
        `;

        // Diagnóstico e Alertas
        document.getElementById('statusCard').innerHTML = `
            <h2 class="font-bold mb-3">Diagnóstico</h2>
            <div class="text-slate-300">${analysis.diagnosis.join('<br>')}</div>
        `;

        document.getElementById('alertsCard').innerHTML = `
            <h2 class="font-bold mb-3">Alertas</h2>
            <ul class="list-disc pl-5">${analysis.alerts.map(a => `<li>${a}</li>`).join('')}</ul>
        `;

        document.getElementById('mitigationCard').innerHTML = `
            <h2 class="font-bold mb-3">Mitigações</h2>
            <ul class="list-disc pl-5">${analysis.mitigations.map(m => `<li>${m}</li>`).join('')}</ul>
        `;

    } catch (e) {
        console.error("Erro ao atualizar dashboard:", e);
    }
}

// Inicialização
window.onload = () => {
    console.log("✅ Página carregada");
    updateDashboard();
    
    // Simula atualização
    setInterval(() => {
        currentData.temperature = (Math.random() * 5 + 22).toFixed(1);
        currentData.humidity = Math.floor(Math.random() * 30 + 45);
        updateDashboard();
    }, 8000);
};
