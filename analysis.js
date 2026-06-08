async function analyzeEnvironment(reading) {

    const response = await fetch('rules.json');
    const rules = await response.json();

    let score = 100;
    let status = "EXCELLENT";

    const alerts = [];
    const diagnosis = [];
    const mitigations = [];

    // ======================
    // TEMPERATURA
    // ======================

    if (
        reading.temperature < rules.temperature.ideal_min ||
        reading.temperature > rules.temperature.ideal_max
    ) {

        score -= 15;

        alerts.push({
            severity: "warning",
            title: "Temperatura fora da faixa ideal"
        });

        diagnosis.push(
            "Temperatura fora da faixa recomendada para conforto ambiental."
        );

        mitigations.push(
            "Verificar ajuste do sistema de climatização."
        );
    }

    // ======================
    // UMIDADE
    // ======================

    if (
        reading.humidity < rules.humidity.ideal_min ||
        reading.humidity > rules.humidity.ideal_max
    ) {

        score -= 15;

        alerts.push({
            severity: "warning",
            title: "Umidade fora da faixa ideal"
        });

        diagnosis.push(
            "Umidade fora da faixa recomendada pela OMS."
        );

        mitigations.push(
            "Aumentar renovação de ar e controlar a umidade."
        );
    }

    // ======================
    // CO2
    // ======================

    if (
        reading.co2 &&
        reading.co2 > rules.co2.ideal_max
    ) {

        score -= 25;

        alerts.push({
            severity: "high",
            title: "CO₂ elevado"
        });

        diagnosis.push(
            "Ventilação insuficiente detectada."
        );

        mitigations.push(
            "Aumentar a renovação de ar externo."
        );
    }

    // ======================
    // CENÁRIOS COMPOSTOS
    // ======================

    if (
        reading.temperature < 21 &&
        reading.humidity > 60
    ) {

        score -= 20;

        alerts.push({
            severity: "high",
            title: "Risco de Mofo e Condensação"
        });

        diagnosis.push(
            "Condições favoráveis ao crescimento de fungos e bactérias."
        );

        mitigations.push(
            "Reduzir umidade e elevar temperatura ambiente."
        );
    }

    // ======================
    // CLASSIFICAÇÃO
    // ======================

    if (score >= 90)
        status = "EXCELLENT";
    else if (score >= 80)
        status = "GOOD";
    else if (score >= 60)
        status = "ATTENTION";
    else if (score >= 40)
        status = "POOR";
    else
        status = "CRITICAL";

    return {
        score,
        status,
        alerts,
        diagnosis,
        mitigations
    };
}
