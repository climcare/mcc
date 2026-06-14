console.log("🚀 Dashboard iniciado - Versão Estável");

window.onload = async () => {
    console.log("✅ Página carregada com sucesso!");

    // Dados simulados (enquanto o Supabase não funciona)
    const reading = {
        deviceId: 11,
        temperature: 24.7,
        humidity: 51.2,
        co2: 730,
        pm25: 2.8
    };

    try {
        const analysis = await analyzeEnvironment(reading);

        // Device Info
        document.getElementById('deviceInfo').innerHTML = `
            <div class="p-4 bg-emerald-900/30 rounded-2xl flex items-center gap-3">
                <div class="w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
                <div>ONLINE • Dispositivo ${reading.deviceId}</div>
            </div>
        `;

        // Score Card
        const scoreColor = analysis.score >= 90 ? '#22c55e' : '#eab308';
        document.getElementById('scoreCard').innerHTML = `
            <h2 class="text-2xl font-bold mb-4 text-center">Índice Clim Care</h2>
            <div class="flex justify-center my-6">
                <div style="width:160px;height:160px;border-radius:9999px;border:14px solid ${scoreColor};display:flex;align-items:center;justify-content:center;font-size:52px;font-weight:bold;color:${scoreColor}">
                    ${analysis.score}
                </div>
            </div>
            <p class="text-center text-2xl font-semibold">${analysis.status}</p>
        `;

        // Cards
        document.getElementById('cards').innerHTML = `
            <div class="card text-center p-6">
                <div class="text-5xl">🌡️</div>
                <div class="text-4xl font-bold mt-2">${reading.temperature}°C</div>
            </div>
            <div class="card text-center p-6">
                <div class="text-5xl">💧</div>
                <div class="text-4xl font-bold mt-2">${reading.humidity}%</div>
            </div>
            <div class="card text-center p-6">
                <div class="text-5xl">🌬️</div>
                <div class="text-4xl font-bold mt-2">${reading.co2} ppm</div>
            </div>
        `;

        // Diagnóstico, Alertas e Mitigações
        document.getElementById('statusCard').innerHTML = `<h2 class="font-bold mb-3">Diagnóstico</h2>${analysis.diagnosis.map(d => `<p>• ${d}</p>`).join('')}`;
        document.getElementById('alertsCard').innerHTML = `<h2 class="font-bold mb-3">Alertas</h2>${analysis.alerts.map(a => `<p>⚠️ ${a}</p>`).join('')}`;
        document.getElementById('mitigationCard').innerHTML = `<h2 class="font-bold mb-3">Mitigações</h2>${analysis.mitigations.map(m => `<p>✓ ${m}</p>`).join('')}`;

        console.log("✅ Dashboard renderizado com sucesso!");

    } catch (e) {
        console.error("Erro ao executar analyzeEnvironment:", e);
        document.getElementById('scoreCard').innerHTML = `<p class="p-8 text-red-400">Erro na análise. Verifique analysis.js</p>`;
    }
};
