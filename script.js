console.log("🚀 Tentando conectar ao Supabase...");

// ======================================================
// SUPABASE
// ======================================================

const SUPABASE_URL = "https://iaylyacrzurcjwvtecpu.supabase.co";
const SUPABASE_ANON_KEY =
    "sb_publishable_pkzx4u5U9Xr407syiBE9yA_G7hUvGaw";

let supabaseClient = null;


// ======================================================
// INICIALIZAÇÃO
// ======================================================

window.onload = async () => {

    console.log("✅ Página carregada");

    if (typeof supabase !== "undefined") {

        supabaseClient = supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
        );

        console.log("✅ Supabase Client criado!");

        await lerUltimaLeitura();

        // Atualiza os dados a cada 15 segundos
        setInterval(lerUltimaLeitura, 15000);

    } else {

        console.error(
            "❌ Supabase JS não carregou. Verifique o <script> no HTML."
        );
    }
};


// ======================================================
// BUSCAR ÚLTIMA LEITURA
// ======================================================

async function lerUltimaLeitura() {

    if (!supabaseClient) return;

    try {

        const { data, error } = await supabaseClient
            .from("sensor_readings")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (error) {

            console.error("❌ Erro na consulta:", error);
            return;
        }

        if (!data) {

            console.log("Nenhuma leitura encontrada.");
            return;
        }

        console.log("✅ Última leitura:", data);

        // Motor de análise existente
        const analise = await analyzeEnvironment(data);

        console.log("📊 Análise:", analise);

        renderizarDashboard(data, analise);

    } catch (err) {

        console.error("❌ Erro ao ler banco:", err);
    }
}


// ======================================================
// FUNÇÕES AUXILIARES
// ======================================================

function numero(valor, fallback = 0) {

    const convertido = Number(valor);

    return Number.isFinite(convertido)
        ? convertido
        : fallback;
}


function campo(reading, ...nomes) {

    for (const nome of nomes) {

        if (
            reading[nome] !== undefined &&
            reading[nome] !== null
        ) {
            return numero(reading[nome]);
        }
    }

    return 0;
}


function limitar(valor, minimo, maximo) {

    return Math.min(
        maximo,
        Math.max(minimo, valor)
    );
}


// ======================================================
// CORES DO STATUS QAI
// ======================================================

function statusTheme(status) {

    const s = (status || "").toUpperCase();

    if (s === "EXCELENTE") {

        return {
            cor: "#62d90b",
            fundo: "#62d90b"
        };
    }

    if (s === "BOM") {

        return {
            cor: "#12bfff",
            fundo: "#12bfff"
        };
    }

    if (s === "ATENÇÃO") {

        return {
            cor: "#ffd400",
            fundo: "#ffd400"
        };
    }

    return {
        cor: "#ff3b30",
        fundo: "#ff3b30"
    };
}


// ======================================================
// DESCRIÇÃO DO SCORE
// ======================================================

function descricaoScore(status) {

    switch ((status || "").toUpperCase()) {

        case "EXCELENTE":

            return `
                Qualidade do ar excelente.<br>
                Condições ambientais favoráveis.
            `;

        case "BOM":

            return `
                Qualidade do ar boa.<br>
                Mantenha o monitoramento.
            `;

        case "ATENÇÃO":

            return `
                Qualidade do ar regular.<br>
                Parâmetros requerem atenção.
            `;

        default:

            return `
                Qualidade do ar crítica.<br>
                Ação corretiva recomendada.
            `;
    }
}


// ======================================================
// PILARES QAI
// ======================================================

function criarPilar(nome, valor, cor) {

    valor = limitar(valor, 0, 100);

    return `
        <div class="pillar">

            <div>

                <div class="pillar-name">
                    ${nome}
                </div>

                <div class="bar">

                    <i
                        style="
                            width:${valor}%;
                            background:${cor};
                        "
                    ></i>

                </div>

            </div>

            <div class="pillar-score">
                ${valor}%
            </div>

        </div>
    `;
}


// ======================================================
// CARD DE SENSOR
// ======================================================

function criarCardSensor(
    titulo,
    valor,
    unidade,
    maximo,
    referencia,
    cor,
    estado
) {

    const posicao = limitar(
        (valor / maximo) * 100,
        0,
        100
    );

    return `

        <div class="panel metric">

            <div
                class="metric-title"
                style="color:${cor}"
            >
                ${titulo}
            </div>


            <div class="metric-value">

                ${valor.toFixed(1)}

            </div>


            <div class="metric-unit">

                ${unidade}

            </div>


            <div
                class="metric-state"
                style="color:${cor}"
            >

                ✓

                <br>

                ${estado}

            </div>


            <div class="scale">

                <i
                    class="marker"
                    style="left:${posicao}%"
                ></i>

            </div>


            <div class="scale-labels">

                <span>0</span>

                <span>${referencia}</span>

                <span>${maximo}</span>

            </div>

        </div>
    `;
}


// ======================================================
// RENDERIZAÇÃO PRINCIPAL
// ======================================================

function renderizarDashboard(reading, analise) {

    // --------------------------------------------------
    // LEITURAS
    // --------------------------------------------------

    const temperatura = campo(
        reading,
        "temperature"
    );

    const umidade = campo(
        reading,
        "humidity"
    );

    const co2 = campo(
        reading,
        "co2"
    );

    const pm25 = campo(
        reading,
        "pm25",
        "pm2_5"
    );

    const pm10 = campo(
        reading,
        "pm10"
    );

    const voc = campo(
        reading,
        "vocIndex",
        "voc_index",
        "voc"
    );


    // --------------------------------------------------
    // TEMA
    // --------------------------------------------------

    const tema = statusTheme(
        analise.status
    );


    // ==================================================
    // PILARES
    // ==================================================

    let penalidadeConforto = 0;


    // Temperatura ideal
    if (
        temperatura < 21 ||
        temperatura > 24
    ) {

        penalidadeConforto += 12;
    }


    // Umidade ideal
    if (
        umidade < 40 ||
        umidade > 60
    ) {

        penalidadeConforto += 13;
    }


    // Gases
    const gases = limitar(

        Math.round(

            100 -

            (
                Math.max(
                    0,
                    co2 - 600
                ) / 14
            )

            -

            (
                Math.max(
                    0,
                    voc - 100
                ) / 5
            )

        ),

        0,
        100
    );


    // Poluentes
    const poluentes = limitar(

        Math.round(

            100 -

            (pm25 / 15) * 25 -

            (pm10 / 45) * 15

        ),

        0,
        100
    );


    // Conforto
    const conforto = limitar(

        100 -
        penalidadeConforto * 2,

        0,
        100
    );


    // --------------------------------------------------
    // EXIBIR PILARES
    // --------------------------------------------------

    const pillars =
        document.getElementById("pillars");

    if (pillars) {

        pillars.innerHTML =

            criarPilar(
                "GASES",
                gases,
                "#62d90b"
            )

            +

            criarPilar(
                "POLUENTES",
                poluentes,
                "#12bfff"
            )

            +

            criarPilar(
                "CONFORTO",
                conforto,
                "#ff7a00"
            );
    }


    // ==================================================
    // AMBIENTE
    // ==================================================

    const ambiente =
        document.getElementById(
            "environmentMini"
        );


    if (ambiente) {

        ambiente.innerHTML = `

            <div>

                <div class="env-value">

                    ${temperatura.toFixed(1)}

                    <small
                        style="font-size:22px"
                    >
                        °C
                    </small>

                </div>

                <div class="env-label">
                    TEMPERATURA
                </div>

            </div>


            <div>

                <div class="env-value">

                    ${umidade.toFixed(1)}

                    <small
                        style="font-size:22px"
                    >
                        %
                    </small>

                </div>

                <div class="env-label">
                    UMIDADE
                </div>

            </div>
        `;
    }


    // ==================================================
    // SCORE CENTRAL
    // ==================================================

    const scoreCard =
        document.getElementById(
            "scoreCard"
        );


    if (scoreCard) {

        scoreCard.innerHTML = `

            <div class="gauge">

                <div class="gauge-ring"></div>


                <div class="gauge-content">

                    <div class="qai-label">
                        QAI
                    </div>


                    <div
                        class="score"
                        style="
                            color:${tema.cor}
                        "
                    >

                        ${analise.score}

                    </div>


                    <div
                        class="status-pill"
                        style="
                            background:${tema.fundo}
                        "
                    >

                        ${analise.status}

                    </div>

                </div>

            </div>


            <div class="gauge-desc">

                ${descricaoScore(
                    analise.status
                )}

            </div>
        `;
    }


    // ==================================================
    // ALERTAS
    // ==================================================

    let alertas = analise.alerts || [];


    if (alertas.length === 0) {

        alertas = [
            "Parâmetros monitorados dentro das faixas definidas."
        ];
    }


    const alertsCard =
        document.getElementById(
            "alertsCard"
        );


    if (alertsCard) {

        alertsCard.innerHTML = `

            <div
                class="alert-title"
                style="
                    color:${tema.cor}
                "
            >

                ◉ &nbsp;
                ${analise.status}

            </div>


            <div class="alert-text">

                ${alertas
                    .slice(0, 3)
                    .join("<br>")}

            </div>
        `;
    }


    // ==================================================
    // AÇÕES RECOMENDADAS
    // ==================================================

    let acoes =
        analise.mitigations || [];


    if (acoes.length === 0) {

        acoes = [

            "Mantenha as condições atuais e acompanhe as próximas leituras."

        ];
    }


    const mitigationCard =
        document.getElementById(
            "mitigationCard"
        );


    if (mitigationCard) {

        mitigationCard.innerHTML = `

            <div class="section-title">

                ◎ &nbsp;
                AÇÕES RECOMENDADAS

            </div>


            <ul>

                ${acoes
                    .slice(0, 5)
                    .map(
                        acao =>
                            `<li>${acao}</li>`
                    )
                    .join("")}

            </ul>
        `;
    }


    // ==================================================
    // CARDS CO2 / PM2.5 / PM10
    // ==================================================

    const cards =
        document.getElementById(
            "cards"
        );


    if (cards) {

        cards.innerHTML =


            // CO2
            criarCardSensor(

                "CO₂",

                co2,

                "ppm",

                2000,

                800,

                "#62d90b",

                co2 <= 1000
                    ? "ADEQUADO"
                    : "ATENÇÃO"

            )


            +


            // PM2.5
            criarCardSensor(

                "PM2.5",

                pm25,

                "µg/m³",

                50,

                15,

                "#12bfff",

                pm25 <= 15
                    ? "BOM"
                    : "ATENÇÃO"

            )


            +


            // PM10
            criarCardSensor(

                "PM10",

                pm10,

                "µg/m³",

                150,

                45,

                "#9b45ff",

                pm10 <= 45
                    ? "BOM"
                    : "ATENÇÃO"

            );
    }


    // ==================================================
    // DATA / HORA
    // ==================================================

    const dataLeitura =
        new Date(
            reading.created_at
        );


    const deviceInfo =
        document.getElementById(
            "deviceInfo"
        );


    if (deviceInfo) {

        deviceInfo.innerHTML = `

            <div>

                ${dataLeitura
                    .toLocaleDateString(
                        "pt-BR"
                    )}

            </div>


            <div>

                ${dataLeitura
                    .toLocaleTimeString(
                        "pt-BR"
                    )}

            </div>
        `;
    }
}
