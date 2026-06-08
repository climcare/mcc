async function analyzeEnvironment(reading) {

    const response = await fetch('rules.json');
    const rules = await response.json();

    let score = 100;

    const alerts = [];
    const diagnosis = [];
    const mitigations = [];

    // TEMPERATURA

    if (
        reading.temperature < rules.temperature.ideal_min ||
        reading.temperature > rules.temperature.ideal_max
    ) {

        score -= 15;

        alerts.push("Temperatura fora da faixa ideal.");

        diagnosis.push(
            "A temperatura está fora da faixa recomendada para conforto ambiental."
        );

        mitigations.push(
            "Verificar configuração do sistema de climatização."
        );
    }

    // UMIDADE

    if (
        reading.humidity < rules.humidity.ideal_min ||
        reading.humidity > rules.humidity.ideal_max
    ) {

        score -= 15;

        alerts.push("Umidade fora da faixa ideal.");

        diagnosis.push(
            "A umidade encontra-se fora da faixa recomendada pela OMS."
        );

        mitigations.push(
            "Aumentar renovação de ar e controlar a umidade."
        );
    }

    // CENÁRIO ESPECÍFICO

    if (
        reading.temperature >= 21 &&
        reading.temperature <= 25 &&
        reading.humidity > 60
    ) {

        score -= 10;

        diagnosis.push(
            "O ambiente apresenta potencial moderado para proliferação microbiológica."
        );

        mitigations.push(
            "Monitorar condensação e crescimento de fungos."
        );
    }

    let status = "EXCELENTE";

    if (score < 90) status = "BOM";
    if (score < 75) status = "ATENÇÃO";
    if (score < 50) status = "CRÍTICO";

    return {
        score,
        status,
        alerts,
        diagnosis,
        mitigations
    };
}
analyzeEnvironment({
    temperature: 24.1,
    humidity: 64
}).then(console.log);
