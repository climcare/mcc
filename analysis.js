async function analyzeEnvironment(reading) {
    const response = await fetch('rules.json');
    const rules = await response.json();

    let score = 100;
    const alerts = [];
    const diagnosis = [];
    const mitigations = [];

    // ==================== TEMPERATURA ====================
    if (reading.temperature < rules.temperature.ideal_min || reading.temperature > rules.temperature.ideal_max) {
        score -= 20;
        alerts.push("Temperatura fora da faixa ideal");
        diagnosis.push(`Temperatura em ${reading.temperature.toFixed(1)}°C está fora da faixa confortável (21-24°C).`);
        mitigations.push("Ajustar sistema de climatização ou ventilação.");
    }

    // ==================== UMIDADE ====================
    if (reading.humidity < rules.humidity.ideal_min || reading.humidity > rules.humidity.ideal_max) {
        score -= 18;
        alerts.push("Umidade fora da faixa ideal");
        diagnosis.push(`Umidade em ${reading.humidity.toFixed(1)}% está fora da faixa recomendada (40-60%).`);
        mitigations.push("Controlar umidade com desumidificador ou umidificador conforme o caso.");
    }

    // ==================== CO₂ (Ventilação) ====================
    if (reading.co2 > 1000) {
        score -= 25;
        alerts.push("CO₂ elevado - Ventilação insuficiente");
        diagnosis.push(`Nível de CO₂ em ${reading.co2} ppm indica acúmulo de bioefluentes.`);
        mitigations.push("Abrir janelas ou aumentar renovação de ar no HVAC.");
    }

    // ==================== PARTÍCULAS (PM2.5 e PM10) ====================
    if (reading.pm25 > 15 || reading.pm10 > 45) {
        score -= 22;
        alerts.push("Nível alto de partículas");
        diagnosis.push(`PM2.5: ${reading.pm25} | PM10: ${reading.pm10} µg/m³ - Qualidade do ar comprometida.`);
        mitigations.push("Ligar purificador de ar com filtro HEPA e verificar fontes de poeira.");
    }

    // ==================== VOC (Compostos Orgânicos Voláteis) ====================
    if (reading.vocIndex > 150) {
        score -= 15;
        alerts.push("VOC elevado");
        diagnosis.push(`Índice VOC em ${reading.vocIndex} indica presença de compostos químicos no ar.`);
        mitigations.push("Melhorar ventilação e evitar uso de produtos químicos/voláteis.");
    }

    // ==================== RUÍDO ====================
    if (reading.noise > 55) {
        score -= 8;
        alerts.push("Nível de ruído elevado");
        diagnosis.push(`Nível de ruído em ${reading.noise} dB pode causar desconforto.`);
        mitigations.push("Identificar e reduzir fontes de ruído.");
    }

    // ==================== CENÁRIOS COMBINADOS ====================
    if (reading.temperature > 26 && reading.humidity > 60) {
        diagnosis.push("Condições abafadas detectadas - risco de desconforto e mofo.");
        mitigations.push("Priorizar ventilação cruzada e desumidificação.");
    }

    if (reading.humidity > 65 && reading.temperature < 22) {
        diagnosis.push("Risco alto de condensação e proliferação de fungos/bactérias.");
        mitigations.push("Acionar aquecimento e verificar pontos de umidade.");
    }

    // ==================== STATUS FINAL ====================
    let status = "EXCELENTE";
    if (score < 85) status = "BOM";
    if (score < 70) status = "ATENÇÃO";
    if (score < 50) status = "CRÍTICO";

    return {
        score: Math.max(0, Math.round(score)),
        status,
        alerts,
        diagnosis,
        mitigations
    };
}
