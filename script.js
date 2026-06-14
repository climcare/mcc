console.log("🚀 Script carregado - versão mínima");

window.onload = async function() {
    console.log("✅ Página carregada");

    // Dados simulados temporariamente (para testar se a página renderiza)
    const reading = {
        deviceId: 11,
        temperature: 24.7,
        humidity: 51.2,
        co2: 730,
        pm25: 2.8
    };

    try {
        const analysis = await analyzeEnvironment(reading);

        document.getElementById('deviceInfo').innerHTML = `
            <div class="p-4 bg-emerald-900/30 rounded-2xl">
                <span class="text-emerald-400 font-bold">ONLINE</span> • Dispositivo ${reading.deviceId}
            </div>
        `;

        document.getElementById('scoreCard').innerHTML = `
            <h2 class="text-2xl font-bold text-center mb-4">Índice Clim Care</h2>
            <div class="text-7xl font-bold text-center text-emerald-400">${analysis.score}</div>
            <p class="text-center text-xl mt-2">${analysis.status}</p>
        `;

        document.getElementById('cards').innerHTML = `
            <div class="card p-6 text-center">
                <div class="text-4xl">🌡️</div>
                <div class="text-3xl font-bold">${reading.temperature}°C</div>
            </div>
            <div class="card p-6 text-center">
                <div class="text-4xl">💧</div>
                <div class="text-3xl font-bold">${reading.humidity}%</div>
            </div>
            <div class="card p-6 text-center">
                <div class="text-4xl">🌬️</div>
                <div class="text-3xl font-bold">${reading.co2} ppm</div>
            </div>
        `;

        console.log("✅ Dashboard renderizado com sucesso!");

    } catch (e) {
        console.error("Erro na análise:", e);
        document.getElementById('scoreCard').innerHTML = `<p class="text-red-400 p-8">Erro ao carregar análise</p>`;
    }
};
