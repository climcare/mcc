console.log("🚀 Dashboard iniciado - Versão Estável");

window.onload = async () => {
    console.log("✅ Página carregada com sucesso!");

    // Dados do último registro (simulado por enquanto)
    const reading = {
        deviceId: 11,
        temperature: 24.7,
        humidity: 51.2,
        co2: 730,
        pm25: 2.8,
        signalStrength: -67
    };

    try {
        const analysis = await analyzeEnvironment(reading);

        // Device Info
        document.getElementById('deviceInfo').innerHTML = `
            <div class="p-4 bg-emerald-900/30 rounded-2xl flex items-center gap-3">
                <div class="w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
                <div>
                    <span class="font-bold text-emerald-400">ONLINE</span><br>
                    Dispositivo ${reading.deviceId}
                </div>
            </div>
        `;

        // Score
        const scoreColor = analysis.score >= 90 ? '#22c55e' : analysis.score >= 75 ? '#eab308' : '#ef4444';
        document.getElementById('scoreCard').innerHTML = `
            <h2 class="text-2xl font-bold mb-4 text-center">Índice Clim Care</h2>
            <div class="flex justify-center my-6">
                <div style="width:170px;height:170px;border-radius:9999px;border:16px solid ${scoreColor};display:flex;align-items:center;justify-content:center;font-size:58px;font-weight:700;color:${scoreColor}">
                    ${analysis.score}
                </div>
            </div>
            <p class="text-center text-3xl font-semibold">${analysis.status}</p>
        `;

        // Métricas
        document.getElementById('cards').innerHTML = `
            <div class="card text-center p-6">
                <div class="text-5xl">🌡️</div>
                <div class="text-4xl font-bold">${reading.temperature}°C</div>
            </div>
            <div class="card text-center p-6">
                <div class="text-5xl">💧</div>
                <div class="text-4xl font-bold">${reading.humidity}%</div>
            </div>
            <div class="card text-center p-6">
                <div class="text-5xl">🌬️</div>
                <div class="text-4xl font-bold">${reading.co2} ppm</div>
            </div>
        `;

        // Diagnóstico, Alertas e Mitigações
        document.getElementById('statusCard').innerHTML = `
            <h2 class="font-bold mb-3">Diagnóstico</h2>
            ${analysis.diagnosis.map(d => `<p class="text-slate-300">• ${d}</p>`).join('')}
        `;

        document.getElementById('alertsCard').innerHTML = `
            <h2 class="font-bold mb-3">Alertas</h2>
            ${analysis.alerts.map(a => `<p class="text-amber-400">⚠️ ${a}</p>`).join('')}
        `;

        document.getElementById('mitigationCard').innerHTML = `
            <h2 class="font-bold mb-3">Mitigações</h2>
            ${analysis.mitigations.map(m => `<p class="text-emerald-400">✓ ${m}</p>`).join('')}
        `;

        console.log("✅ Dashboard renderizado!");

    } catch (e) {
        console.error("Erro ao executar analyzeEnvironment:", e);
    }
};
