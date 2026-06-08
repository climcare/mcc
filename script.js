// ==================== CONFIGURAÇÃO ====================
const SUPABASE_URL = 'https://iaylyacrzurcjwvtecpu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pkzx4u5U9Xr407syiBE9yA_G7hUvGaw';

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

async function loadLatestReading() {

    const { data, error } = await supabaseClient
        .from('sensor_readings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error(error);
        return;
    }

    if (!data || data.length === 0) {
        console.log('Nenhuma leitura encontrada');
        return;
    }

    const reading = data[0];
    document.getElementById('deviceInfo').innerHTML = `
    <div class="flex items-center gap-2 mb-2">
        <div class="w-3 h-3 rounded-full bg-green-500"></div>
        <span class="font-semibold">ONLINE</span>
    </div>

    <div class="text-sm text-slate-300">
        Dispositivo:
        <strong>${reading.deviceId}</strong>
    </div>

    <div class="text-sm text-slate-300">
        Última atualização:
        <strong>
            ${new Date(reading.created_at).toLocaleTimeString('pt-BR')}
        </strong>
    </div>
`;
    console.log('Leitura recebida:', reading);

    const analysis = await analyzeEnvironment(reading);
    const scoreColor =
    analysis.score >= 90 ? '#22c55e' :
    analysis.score >= 75 ? '#3b82f6' :
    analysis.score >= 50 ? '#eab308' :
    '#ef4444';

    document.getElementById('scoreCard').innerHTML = `
    <h2 class="text-2xl font-bold mb-4">
        Índice Clim Care
    </h2>

    <div
         style="
            width:140px;
            height:140px;
            border-radius:50%;
            margin:auto;
            display:flex;
            align-items:center;
            justify-content:center;
            border:10px solid ${scoreColor};
            font-size:42px;
            font-weight:bold;
            color:${scoreColor};
        ">
        ${analysis.score}
    </div>

    <div class="mt-4 text-xl font-semibold">
        ${analysis.status}
    </div>
`;
   document.getElementById('cards').innerHTML = `

    <div class="card flex flex-col justify-center">
        <div class="text-xs uppercase tracking-wider text-slate-400 mb-1">
            Temperatura
        </div>

        <div class="text-2xl font-bold text-cyan-400">
            🌡 ${reading.temperature ?? '--'}°C
        </div>
    </div>

    <div class="card flex flex-col justify-center">
        <div class="text-xs uppercase tracking-wider text-slate-400 mb-1">
            Umidade
        </div>

        <div class="text-2xl font-bold text-blue-400">
            💧 ${reading.humidity ?? '--'}%
        </div>
    </div>

    <div class="card flex flex-col justify-center">
        <div class="text-xs uppercase tracking-wider text-slate-400 mb-1">
            Wi-Fi
        </div>

        <div class="text-2xl font-bold text-green-400">
            📶 ${reading.signalStrength ?? '--'} dBm
        </div>
    </div>

`;

    document.getElementById('statusCard').innerHTML = `
        <h2 class="text-2xl font-bold mb-4">
            Diagnóstico Ambiental
        </h2>

        <p class="text-xl">
            Status: <strong>${analysis.status}</strong>
        </p>

        <ul class="mt-4">
            ${analysis.diagnosis.map(item =>
                `<li class="mb-2">• ${item}</li>`
            ).join('')}
        </ul>
    `;

    document.getElementById('alertsCard').innerHTML = `
        <h2 class="text-2xl font-bold mb-4">
            Alertas
        </h2>

        <ul>
            ${analysis.alerts.map(item =>
                `<li class="mb-2">⚠ ${item}</li>`
            ).join('')}
        </ul>
    `;

    document.getElementById('mitigationCard').innerHTML = `
        <h2 class="text-2xl font-bold mb-4">
            Mitigações Recomendadas
        </h2>

        <ul>
            ${analysis.mitigations.map(item =>
                `<li class="mb-2">✓ ${item}</li>`
            ).join('')}
        </ul>
    `;
    function getIndicator(ok) {
    return ok ? "🟢" : "🟡";
}

const tempOk =
    reading.temperature >= 21 &&
    reading.temperature <= 24;

const humidityOk =
    reading.humidity >= 40 &&
    reading.humidity <= 60;

document.getElementById('environmentStatus').innerHTML = `
    <h2 class="text-2xl font-bold mb-4">
        Semáforo Ambiental
    </h2>

    <div class="space-y-3">

        <div class="flex justify-between">
            <span>Temperatura</span>
            <span>${getIndicator(tempOk)}</span>
        </div>

        <div class="flex justify-between">
            <span>Umidade</span>
            <span>${getIndicator(humidityOk)}</span>
        </div>

        <div class="flex justify-between">
            <span>CO₂</span>
            <span>⚪</span>
        </div>

        <div class="flex justify-between">
            <span>PM2.5</span>
            <span>⚪</span>
        </div>

        <div class="flex justify-between">
            <span>PM10</span>
            <span>⚪</span>
        </div>

    </div>
`;
}

loadLatestReading();
  
