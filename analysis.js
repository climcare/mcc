// ====================================================================
// QAI - MOTOR DE ANÁLISE AMBIENTAL
// ====================================================================
// IMPORTANTE:
//
// O SCORE QAI DESTE ARQUIVO DEVE PERMANECER SINCRONIZADO COM
// O ALGORITMO UTILIZADO NO DISPOSITIVO.
//
// O MOTOR AVANÇADO DE DIAGNÓSTICO NÃO DEVE ALTERAR O SCORE.
// ====================================================================


// ====================================================================
// CONFIGURAÇÃO DOS LIMITES OPERACIONAIS TÉCNICOS
// ====================================================================

const NORMAS_QAI = {

    gases: {

        co2: {
            max: 1000
        },

        co: {
            max: 9.0
        },

        vocIndex: {
            max: 300
        }

    },


    particulados: {

        pm25: {
            max: 15.0
        },

        pm10: {
            max: 50.0
        }

    },


    contagem: {

        nc0_5: {
            max: 100
        },

        nc1_0: {
            max: 150
        },

        nc2_5: {
            max: 200
        },

        nc10_0: {
            max: 50
        }

    },


    conforto: {

        temperature: {
            min: 20.0,
            max: 24.0
        },

        humidity: {
            min: 40.0,
            max: 65.0
        }

    }

};


// ====================================================================
// REGRAS OFICIAIS DO SCORE QAI
// ====================================================================
//
// ATENÇÃO:
//
// ESTAS REGRAS DEVEM SER IGUAIS ÀS UTILIZADAS NO DISPOSITIVO.
//
// NÃO ALTERAR SEM ALTERAR TAMBÉM O FIRMWARE.
// ====================================================================

const SCORE_QAI = {

    temperatura: {

        min: 21,
        max: 24,
        penalidade: 20

    },


    umidade: {

        min: 40,
        max: 60,
        penalidade: 18

    },


    co2: {

        max: 1000,
        penalidade: 25

    },


    particulados: {

        pm25Max: 15,
        pm10Max: 45,
        penalidade: 22

    },


    voc: {

        max: 150,
        penalidade: 15

    },


    ruido: {

        max: 55,
        penalidade: 8

    }

};


// ====================================================================
// PONTO DE ORVALHO
// MATRIZ DE MAGNUS-TETENS
// ====================================================================

function calcularPontoOrvalho(t, rh) {

    const a = 17.625;

    const b = 243.04;


    if (
        rh <= 0 ||
        rh > 100 ||
        isNaN(t) ||
        isNaN(rh)
    ) {

        return 0;

    }


    const alfa =

        ((a * t) / (b + t))

        +

        Math.log(rh / 100);


    const pontoOrvalho =

        (b * alfa)

        /

        (a - alfa);


    return parseFloat(
        pontoOrvalho.toFixed(1)
    );

}


// ====================================================================
// SCORE QAI OFICIAL
// ====================================================================
//
// ESTE É O CÁLCULO QUE DEVE ESPELHAR O DISPOSITIVO.
//
// SCORE INICIAL = 100
//
// TEMPERATURA FORA DE 21–24°C  = -20
// UMIDADE FORA DE 40–60%       = -18
// CO2 > 1000 ppm               = -25
// PM2.5 > 15 OU PM10 > 45      = -22
// VOC > 150                    = -15
// RUÍDO > 55 dB                = -8
//
// ====================================================================

function calcularScoreQAI(leitura) {

    let score = 100;


    // --------------------------------------------------------------
    // LEITURA E NORMALIZAÇÃO
    // --------------------------------------------------------------

    const temp =
        Number(
            leitura.temperature || 0
        );


    const hum =
        Number(
            leitura.humidity || 0
        );


    const co2 =
        Number(
            leitura.co2 || 0
        );


    const pm25 =
        Number(
            leitura.pm25 || 0
        );


    const pm10 =
        Number(
            leitura.pm10 || 0
        );


    const voc =
        Number(

            leitura.vocIndex ??

            leitura.voc_index ??

            leitura.voc ??

            0

        );


    const ruido =
        Number(

            leitura.noise ??

            leitura.noiseDb ??

            leitura.noise_db ??

            leitura.ruido ??

            0

        );


    // --------------------------------------------------------------
    // TEMPERATURA
    // --------------------------------------------------------------

    if (

        temp < SCORE_QAI.temperatura.min

        ||

        temp > SCORE_QAI.temperatura.max

    ) {

        score -=
            SCORE_QAI
                .temperatura
                .penalidade;

    }


    // --------------------------------------------------------------
    // UMIDADE
    // --------------------------------------------------------------

    if (

        hum < SCORE_QAI.umidade.min

        ||

        hum > SCORE_QAI.umidade.max

    ) {

        score -=
            SCORE_QAI
                .umidade
                .penalidade;

    }


    // --------------------------------------------------------------
    // CO2
    // --------------------------------------------------------------

    if (

        co2 >
        SCORE_QAI.co2.max

    ) {

        score -=
            SCORE_QAI
                .co2
                .penalidade;

    }


    // --------------------------------------------------------------
    // PARTICULADOS
    // --------------------------------------------------------------
    //
    // IMPORTANTE:
    //
    // PM2.5 e PM10 formam UMA ÚNICA penalização.
    //
    // Mesmo que ambos estejam fora da faixa,
    // descontamos apenas 22 pontos.
    // --------------------------------------------------------------

    if (

        pm25 >
        SCORE_QAI
            .particulados
            .pm25Max

        ||

        pm10 >
        SCORE_QAI
            .particulados
            .pm10Max

    ) {

        score -=
            SCORE_QAI
                .particulados
                .penalidade;

    }


    // --------------------------------------------------------------
    // VOC
    // --------------------------------------------------------------

    if (

        voc >
        SCORE_QAI.voc.max

    ) {

        score -=
            SCORE_QAI
                .voc
                .penalidade;

    }


    // --------------------------------------------------------------
    // RUÍDO
    // --------------------------------------------------------------

    if (

        ruido >
        SCORE_QAI.ruido.max

    ) {

        score -=
            SCORE_QAI
                .ruido
                .penalidade;

    }


    // --------------------------------------------------------------
    // PROTEÇÃO 0–100
    // --------------------------------------------------------------

    score =
        Math.max(
            0,
            Math.min(
                100,
                score
            )
        );


    return Math.round(score);

}


// ====================================================================
// CLASSIFICAÇÃO OFICIAL DO SCORE
// ====================================================================

function classificarScoreQAI(score) {

    if (score >= 85) {

        return "EXCELENTE";

    }


    if (score >= 70) {

        return "BOM";

    }


    if (score >= 50) {

        return "ATENÇÃO";

    }


    return "CRÍTICO";

}


// ====================================================================
// ENGINE DE AVALIAÇÃO E FILTRAGEM DE VIOLAÇÕES
// ====================================================================

function analisarLeituraQAI(leitura) {


    // ==============================================================
    // NORMALIZAÇÃO
    // ==============================================================

    const co2Val =
        Number(
            leitura.co2 || 0
        );


    const coVal =
        Number(
            leitura.co || 0
        );


    const vocVal =
        Number(

            leitura.vocIndex ??

            leitura.voc_index ??

            leitura.voc ??

            0

        );


    const pm25Val =
        Number(
            leitura.pm25 || 0
        );


    const pm10Val =
        Number(
            leitura.pm10 || 0
        );


    const nc05Val =
        Number(
            leitura.nc0_5 || 0
        );


    const nc10Val =
        Number(
            leitura.nc1_0 || 0
        );


    const nc25Val =
        Number(
            leitura.nc2_5 || 0
        );


    const nc100Val =
        Number(
            leitura.nc10_0 || 0
        );


    const temp =
        Number(
            leitura.temperature || 0
        );


    const hum =
        Number(
            leitura.humidity || 0
        );


    // ==============================================================
    // OBJETO DE DIAGNÓSTICO
    // ==============================================================

    const diagnostico = {

        dispositivoId:

            leitura.deviceId

            ||

            leitura.device_id,


        carimbotempo:

            leitura.created_at

            ||

            new Date().toISOString(),


        statusGeral:
            "CONFORME",


        pontoOrvalho:
            0,


        violacoes:
            [],


        valoresAtuais:
            {},


        telemetriaAvancada:
            {},


        analiseIndividual:
            {},


        scoreGeral:
            100,


        sintomas: {

            fadiga: 0,

            alergia: 0,

            desconforto: 0

        },


        corStatus:

            "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",


        mensagemTexto:

            "Ambiente Conforme. Todos os parâmetros operam dentro dos limites ambientais definidos."

    };


    // ==============================================================
    // PONTO DE ORVALHO
    // ==============================================================

    if (
        !isNaN(temp) &&
        !isNaN(hum)
    ) {

        diagnostico.pontoOrvalho =
            calcularPontoOrvalho(
                temp,
                hum
            );

    }


    // =================================================================
    // 1. GASES
    // =================================================================


    // CO2

    if (
        co2Val >
        NORMAS_QAI.gases.co2.max
    ) {

        diagnostico.violacoes.push({

            parametro:
                "CO2",

            valor:
                co2Val,

            limite:
                NORMAS_QAI.gases.co2.max,

            unidade:
                "ppm",

            gravidade:
                "ATENÇÃO",

            mensagem:

                "Taxa de renovação de ar insuficiente. Alta concentração de bioefluentes humanos no ambiente."

        });

    }


    // CO

    if (
        coVal >
        NORMAS_QAI.gases.co.max
    ) {

        diagnostico.violacoes.push({

            parametro:
                "CO",

            valor:
                coVal,

            limite:
                NORMAS_QAI.gases.co.max,

            unidade:
                "ppm",

            gravidade:
                "CRÍTICO",

            mensagem:

                "Monóxido de Carbono acima do limite operacional de segurança."

        });

    }


    // VOC

    if (
        vocVal >
        NORMAS_QAI.gases.vocIndex.max
    ) {

        diagnostico.violacoes.push({

            parametro:
                "VOC",

            valor:
                vocVal,

            limite:
                NORMAS_QAI.gases.vocIndex.max,

            unidade:
                "",

            gravidade:
                "ATENÇÃO",

            mensagem:

                "Concentração elevada de Compostos Orgânicos Voláteis."

        });

    }


    // =================================================================
    // 2. MASSA DE PARTÍCULAS
    // =================================================================


    // PM2.5

    if (
        pm25Val >
        NORMAS_QAI.particulados.pm25.max
    ) {

        diagnostico.violacoes.push({

            parametro:
                "PM2.5",

            valor:
                pm25Val,

            limite:
                NORMAS_QAI.particulados.pm25.max,

            unidade:
                "µg/m³",

            gravidade:
                "CRÍTICO",

            mensagem:

                "Concentração elevada de partículas finas respiráveis."

        });

    }


    // PM10

    if (
        pm10Val >
        NORMAS_QAI.particulados.pm10.max
    ) {

        diagnostico.violacoes.push({

            parametro:
                "PM10",

            valor:
                pm10Val,

            limite:
                NORMAS_QAI.particulados.pm10.max,

            unidade:
                "µg/m³",

            gravidade:
                "ATENÇÃO",

            mensagem:

                "Partículas grossas em suspensão acima do limite operacional."

        });

    }


    // =================================================================
    // 3. CONTAGEM DE PARTÍCULAS
    // =================================================================


    if (
        nc05Val >
        NORMAS_QAI.contagem.nc0_5.max
    ) {

        diagnostico.violacoes.push({

            parametro:
                "NC0.5",

            valor:
                nc05Val.toFixed(0),

            limite:
                NORMAS_QAI.contagem.nc0_5.max,

            unidade:
                " pt/cm³",

            gravidade:
                "CRÍTICO",

            mensagem:

                "Alta concentração de micropartículas na faixa de 0,5 µm."

        });

    }


    if (
        nc10Val >
        NORMAS_QAI.contagem.nc1_0.max
    ) {

        diagnostico.violacoes.push({

            parametro:
                "NC1.0",

            valor:
                nc10Val.toFixed(0),

            limite:
                NORMAS_QAI.contagem.nc1_0.max,

            unidade:
                " pt/cm³",

            gravidade:
                "ATENÇÃO",

            mensagem:

                "Densidade elevada de partículas na faixa de 1,0 µm."

        });

    }


    if (
        nc100Val >
        NORMAS_QAI.contagem.nc10_0.max
    ) {

        diagnostico.violacoes.push({

            parametro:
                "NC10.0",

            valor:
                nc100Val.toFixed(0),

            limite:
                NORMAS_QAI.contagem.nc10_0.max,

            unidade:
                " pt/cm³",

            gravidade:
                "ATENÇÃO",

            mensagem:

                "Concentração elevada de partículas maiores na faixa de 10 µm."

        });

    }


    // =================================================================
    // 4. CONFORTO AMBIENTAL
    // =================================================================


    if (

        temp <
        NORMAS_QAI
            .conforto
            .temperature
            .min

        ||

        temp >
        NORMAS_QAI
            .conforto
            .temperature
            .max

    ) {

        diagnostico.violacoes.push({

            parametro:
                "Temperatura",

            valor:
                temp,

            limite:

                `${NORMAS_QAI.conforto.temperature.min}-${NORMAS_QAI.conforto.temperature.max}`,

            unidade:
                "°C",

            gravidade:
                "ATENÇÃO",

            mensagem:

                "Temperatura fora da faixa operacional recomendada."

        });

    }


    if (

        hum <
        NORMAS_QAI
            .conforto
            .humidity
            .min

        ||

        hum >
        NORMAS_QAI
            .conforto
            .humidity
            .max

    ) {

        diagnostico.violacoes.push({

            parametro:
                "Umidade",

            valor:
                hum,

            limite:

                `${NORMAS_QAI.conforto.humidity.min}-${NORMAS_QAI.conforto.humidity.max}`,

            unidade:
                "%",

            gravidade:
                "ATENÇÃO",

            mensagem:

                "Umidade relativa fora da faixa operacional recomendada."

        });

    }


    // =================================================================
    // ANÁLISE INDIVIDUAL
    // =================================================================

    diagnostico.analiseIndividual = {


        temperatura:

            (
                temp >=
                NORMAS_QAI.conforto.temperature.min

                &&

                temp <=
                NORMAS_QAI.conforto.temperature.max
            )

                ? "BOM"

                : (
                    temp > 26
                        ? "CRÍTICO"
                        : "ALERTA"
                ),


        umidade:

            (
                hum >=
                NORMAS_QAI.conforto.humidity.min

                &&

                hum <=
                NORMAS_QAI.conforto.humidity.max
            )

                ? "BOM"

                : "ALERTA",


        co2:

            (
                co2Val <= 800
            )

                ? "BOM"

                : (
                    co2Val >
                    NORMAS_QAI.gases.co2.max

                        ? "CRÍTICO"

                        : "ALERTA"
                ),


        nc05:

            (
                nc05Val <=
                NORMAS_QAI.contagem.nc0_5.max
            )

                ? "BOM"

                : "CRÍTICO",


        nc10:

            (
                nc10Val <=
                NORMAS_QAI.contagem.nc1_0.max
            )

                ? "BOM"

                : "ALERTA",


        nc25:

            (
                nc25Val <=
                NORMAS_QAI.contagem.nc2_5.max
            )

                ? "BOM"

                : "ALERTA",


        nc100:

            (
                nc100Val <=
                NORMAS_QAI.contagem.nc10_0.max
            )

                ? "BOM"

                : "ALERTA"

    };


    // =================================================================
    // SCORE QAI
    // =================================================================
    //
    // IMPORTANTE:
    //
    // O diagnóstico avançado acima NÃO altera o Score.
    //
    // O Score é calculado exclusivamente pela função oficial,
    // equivalente à utilizada no dispositivo.
    // =================================================================

    diagnostico.scoreGeral =
        calcularScoreQAI(leitura);


    // =================================================================
    // CLASSIFICAÇÃO DO SCORE
    // =================================================================

    const classificacaoScore =
        classificarScoreQAI(
            diagnostico.scoreGeral
        );


    // =================================================================
    // STATUS GERAL
    // =================================================================
    //
    // Para manter DISPLAY e DASHBOARD coerentes,
    // o status principal acompanha o Score oficial.
    // =================================================================


    diagnostico.statusGeral =
        classificacaoScore;


    if (
        classificacaoScore ===
        "EXCELENTE"
    ) {

        diagnostico.corStatus =

            "bg-emerald-500/10 border-emerald-500/20 text-emerald-500";


        diagnostico.mensagemTexto =

            "🟢 EXCELENTE: Qualidade ambiental dentro das condições ideais.";

    }


    else if (
        classificacaoScore ===
        "BOM"
    ) {

        diagnostico.corStatus =

            "bg-sky-500/10 border-sky-500/20 text-sky-500";


        diagnostico.mensagemTexto =

            "🔵 BOM: Qualidade ambiental adequada. Mantenha o monitoramento.";

    }


    else if (
        classificacaoScore ===
        "ATENÇÃO"
    ) {

        diagnostico.corStatus =

            "bg-amber-500/10 border-amber-500/20 text-amber-500";


        diagnostico.mensagemTexto =

            "⚠️ ATENÇÃO: Desvios ambientais detectados. Recomenda-se verificar as condições do ambiente.";

    }


    else {

        diagnostico.corStatus =

            "bg-rose-500/10 border-rose-500/20 text-rose-500 dark:text-rose-400";


        diagnostico.mensagemTexto =

            "🔴 CRÍTICO: Múltiplos parâmetros ambientais estão fora das condições recomendadas.";

    }


    // =================================================================
    // VALORES ATUAIS
    // =================================================================

    diagnostico.valoresAtuais = {

        temperature:
            temp,

        humidity:
            hum,

        co2:
            co2Val,

        co:
            coVal,

        vocIndex:
            vocVal,

        pm25:
            pm25Val,

        pm10:
            pm10Val

    };


    // =================================================================
    // TELEMETRIA AVANÇADA
    // =================================================================

    diagnostico.telemetriaAvancada = {


        contagemParticulas: {

            nc0_5:
                nc05Val,

            nc1_0:
                nc10Val,

            nc2_5:
                nc25Val,

            nc10_0:
                nc100Val

        },


        tamanhoTipico:

            leitura.typicalSize

            ||

            leitura.typical_size

            ||

            leitura.tps

            ||

            leitura.bpt

            ||

            0.45,


        sinalRede:

            leitura.signalStrength

            ||

            leitura.signal

            ||

            -65,


        nox:

            leitura.noxIndex

            ||

            leitura.nox_index

            ||

            0

    };


    // =================================================================
    // INDICADORES COMPLEMENTARES
    // =================================================================
    //
    // IMPORTANTE:
    //
    // NÃO PARTICIPAM DO SCORE QAI.
    //
    // São mantidos apenas por compatibilidade com o dashboard atual.
    // =================================================================


    diagnostico.sintomas = {


        fadiga:

            co2Val > 1000

                ? 75

                : co2Val > 800

                    ? 40

                    : 10,


        alergia:

            (
                pm25Val > 15

                ||

                pm10Val > 45
            )

                ? 75

                : 10,


        desconforto:

            (
                temp < 21

                ||

                temp > 24

                ||

                hum < 40

                ||

                hum > 60
            )

                ? 70

                : 10

    };


    // =================================================================
    // RETORNO
    // =================================================================

    return diagnostico;

}
