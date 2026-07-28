const SUPABASE_URL = 'https://iaylyacrzurcjwvtecpu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pkzx4u5U9Xr407syiBE9yA_G7hUvGaw';

let supabaseClient = null;
let domElements = {}; // Cache para otimização de performance do DOM

window.onload = async () => {
    inicializarGerenciadorTema();

    if (typeof supabase !== "undefined") {
        supabaseClient = supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
        );

        inicializarCacheDOM();

        await processarCicloMonitoramento();

        setInterval(
            processarCicloMonitoramento,
            15000
        );
    }
};


// ============================================================
// GERENCIADOR DE TEMA
// ============================================================

function inicializarGerenciadorTema() {

    const btn = document.getElementById('btnAlternarTema');
    const ico = document.getElementById('icoTema');
    const txt = document.getElementById('txtTema');
    const htmlElement = document.documentElement;

    const atualizarTemaUI = (isDark) => {

        htmlElement.classList.toggle(
            'dark',
            isDark
        );

        if (ico) {
            ico.innerText =
                isDark ? '☀️' : '🌙';
        }

        if (txt) {
            txt.innerText =
                isDark
                    ? 'MODO DIURNO'
                    : 'MODO NOTURNO';
        }
    };


    const temaSalvo =
        localStorage.getItem('qai-tema')
        || 'dark';


    atualizarTemaUI(
        temaSalvo === 'dark'
    );


    if (btn) {

        btn.addEventListener(
            'click',
            () => {

                const ficarEscuro =
                    !htmlElement
                        .classList
                        .contains('dark');

                atualizarTemaUI(
                    ficarEscuro
                );

                localStorage.setItem(
                    'qai-tema',
                    ficarEscuro
                        ? 'dark'
                        : 'light'
                );
            }
        );
    }
}


// ============================================================
// CACHE DOM
// ============================================================

function inicializarCacheDOM() {

    const ids = [

        'txtDeviceId',
        'txtSignal',
        'txtTimestamp',

        'lblScoreNumero',
        'lblScoreStatus',
        'barScoreProgresso',
        'scoreContainer',

        'txtPctFadiga',
        'txtPctAlergia',
        'txtPctDesconforto',

        'barSintomaFadiga',
        'barSintomaAlergia',
        'barSintomaDesconforto',

        'icoSintomaFadiga',
        'icoSintomaAlergia',
        'icoSintomaDesconforto',

        'valTemperature',
        'valHumidity',
        'valCO2',
        'valPontoOrvalho',

        'cardTemp',
        'statusTemp',

        'cardHum',
        'statusHum',

        'cardCO2',
        'statusCO2',

        'cardOrvalho',
        'statusOrvalho',

        'alertaInfoCritico',

        'panelStatusGeral',
        'txtStatusGeral',

        'panelTriagem',

        'panelTriagemMassaQuantidade'
    ];


    ids.forEach(id => {

        domElements[id] =
            document.getElementById(id);

    });
}


// ============================================================
// CICLO DE MONITORAMENTO
// ============================================================

async function processarCicloMonitoramento() {

    if (!supabaseClient) {
        return;
    }

    try {

        const {
            data: leituraBruta,
            error
        } = await supabaseClient

            .from('sensor_readings')

            .select('*')

            .order(
                'created_at',
                {
                    ascending: false
                }
            )

            .limit(1)

            .single();


        if (!error && leituraBruta) {

            // ====================================================
            // MOTOR DE ANÁLISE
            // ====================================================
            //
            // IMPORTANTE:
            //
            // O SCORE NÃO É CALCULADO NESTE SCRIPT.
            //
            // Ele vem diretamente do analysis.js através de:
            //
            // analisarLeituraQAI(leituraBruta)
            //
            // ====================================================

            const relatorio =

                typeof analisarLeituraQAI === "function"

                    ? analisarLeituraQAI(
                        leituraBruta
                    )

                    : {

                        valoresAtuais:
                            leituraBruta,

                        statusGeral:
                            "EXCELENTE",

                        scoreGeral:
                            100

                    };


            atualizarInterfaceVisual(
                relatorio,
                leituraBruta
            );
        }

        else if (error) {

            console.error(
                "Erro ao consultar Supabase:",
                error
            );

        }

    }

    catch (err) {

        console.error(
            "Erro no ciclo de monitoramento:",
            err
        );

    }
}


// ============================================================
// NORMALIZAÇÃO DE STATUS
// ============================================================

function normalizarNivel(nivel) {

    const valor =
        String(
            nivel || ''
        )
        .trim()
        .toUpperCase();


    if (valor === 'CRITICO') {
        return 'CRÍTICO';
    }


    if (valor === 'CONFORME') {
        return 'EXCELENTE';
    }


    if (valor === 'ALERTA') {
        return 'ATENÇÃO';
    }


    return valor;
}


// ============================================================
// ATUALIZAÇÃO DA INTERFACE
// ============================================================

function atualizarInterfaceVisual(
    relatorio,
    leituraBruta = {}
) {

    const v =
        relatorio.valoresAtuais || {};

    const t =
        relatorio.telemetriaAvancada || {};

    const dadosBanco =
        leituraBruta || {};


    // ========================================================
    // TELEMETRIA DO TOPO
    // ========================================================

    if (domElements.txtDeviceId) {

        domElements.txtDeviceId.innerText =

            relatorio.dispositivoId

            ||

            dadosBanco.device_id

            ||

            '--';

    }


    if (domElements.txtSignal) {

        const sinal =

            t.sinalRede

            ??

            dadosBanco.signal;


        domElements.txtSignal.innerText =

            sinal !== undefined

            &&

            sinal !== null

                ? `${sinal} dBm`

                : '-- dBm';

    }


    if (domElements.txtTimestamp) {

        const origemData =

            relatorio.carimbotempo

            ||

            dadosBanco.created_at;


        const data =

            origemData

                ? new Date(origemData)

                : null;


        domElements.txtTimestamp.innerText =

            data

            &&

            !Number.isNaN(
                data.getTime()
            )

                ? `⏱️ ATUALIZADO EM: ${data.toLocaleTimeString('pt-BR')}`

                : '⏱️ ATUALIZADO EM: --:--:--';

    }


    // ========================================================
    // SCORE QAI
    // ========================================================
    //
    // O SCORE JÁ VEM CALCULADO DO analysis.js.
    //
    // ESTE BLOCO APENAS EXIBE E CLASSIFICA VISUALMENTE.
    //
    // 85–100 = EXCELENTE
    // 70–84  = BOM
    // 50–69  = ATENÇÃO
    // 0–49   = CRÍTICO
    //
    // ========================================================

    const scoreBruto =
        Number(
            relatorio.scoreGeral
        );


    const scoreVal =

        Number.isFinite(
            scoreBruto
        )

            ? Math.max(
                0,
                Math.min(
                    100,
                    scoreBruto
                )
            )

            : 100;


    const {

        lblScoreNumero,
        lblScoreStatus,
        barScoreProgresso,
        scoreContainer

    } = domElements;


    if (
        lblScoreNumero
        &&
        lblScoreStatus
        &&
        barScoreProgresso
        &&
        scoreContainer
    ) {

        lblScoreNumero.innerText =
            Math.round(scoreVal);


        barScoreProgresso.style.width =
            `${scoreVal}%`;


        // ----------------------------------------------------
        // LIMPAR CORES ANTERIORES
        // ----------------------------------------------------

        scoreContainer.classList.remove(

            'border-emerald-500',
            'bg-emerald-500/5',

            'border-sky-500',
            'bg-sky-500/5',

            'border-amber-500',
            'bg-amber-500/5',

            'border-rose-500',
            'bg-rose-500/5'

        );


        lblScoreStatus.classList.remove(

            'text-emerald-500',
            'text-sky-500',
            'text-amber-500',
            'text-rose-500'

        );


        barScoreProgresso.classList.remove(

            'bg-emerald-500',
            'bg-sky-500',
            'bg-amber-500',
            'bg-rose-500'

        );


        // ----------------------------------------------------
        // EXCELENTE
        // 85–100
        // ----------------------------------------------------

        if (scoreVal >= 85) {

            lblScoreStatus.innerText =
                "EXCELENTE";


            lblScoreStatus.classList.add(
                'text-emerald-500'
            );


            scoreContainer.classList.add(
                'border-emerald-500',
                'bg-emerald-500/5'
            );


            barScoreProgresso.classList.add(
                'bg-emerald-500'
            );

        }


        // ----------------------------------------------------
        // BOM
        // 70–84
        // ----------------------------------------------------

        else if (scoreVal >= 70) {

            lblScoreStatus.innerText =
                "BOM";


            lblScoreStatus.classList.add(
                'text-sky-500'
            );


            scoreContainer.classList.add(
                'border-sky-500',
                'bg-sky-500/5'
            );


            barScoreProgresso.classList.add(
                'bg-sky-500'
            );

        }


        // ----------------------------------------------------
        // ATENÇÃO
        // 50–69
        // ----------------------------------------------------

        else if (scoreVal >= 50) {

            lblScoreStatus.innerText =
                "ATENÇÃO";


            lblScoreStatus.classList.add(
                'text-amber-500'
            );


            scoreContainer.classList.add(
                'border-amber-500',
                'bg-amber-500/5'
            );


            barScoreProgresso.classList.add(
                'bg-amber-500'
            );

        }


        // ----------------------------------------------------
        // CRÍTICO
        // 0–49
        // ----------------------------------------------------

        else {

            lblScoreStatus.innerText =
                "CRÍTICO";


            lblScoreStatus.classList.add(
                'text-rose-500'
            );


            scoreContainer.classList.add(
                'border-rose-500',
                'bg-rose-500/5'
            );


            barScoreProgresso.classList.add(
                'bg-rose-500'
            );

        }
    }


    // ========================================================
    // INDICADORES DE PERCEPÇÃO AMBIENTAL
    // ========================================================

    if (relatorio.sintomas) {

        const s =
            relatorio.sintomas;


        const atualizarSintoma = (
            idPct,
            idBar,
            idIco,
            valor,
            emojiAlto,
            emojiBaixo
        ) => {

            const numero =
                Number(valor);


            const pct =

                Number.isFinite(numero)

                    ? Math.max(
                        0,
                        Math.min(
                            100,
                            numero
                        )
                    )

                    : 0;


            if (domElements[idPct]) {

                domElements[idPct].innerText =
                    `${Math.round(pct)}%`;

            }


            if (domElements[idBar]) {

                domElements[idBar].style.width =
                    `${pct}%`;

            }


            if (domElements[idIco]) {

                domElements[idIco].innerText =

                    pct > 40

                        ? emojiAlto

                        : emojiBaixo;

            }
        };


        atualizarSintoma(
            'txtPctFadiga',
            'barSintomaFadiga',
            'icoSintomaFadiga',
            s.fadiga,
            "🥱",
            "💤"
        );


        atualizarSintoma(
            'txtPctAlergia',
            'barSintomaAlergia',
            'icoSintomaAlergia',
            s.alergia,
            "🚨",
            "🤧"
        );


        atualizarSintoma(
            'txtPctDesconforto',
            'barSintomaDesconforto',
            'icoSintomaDesconforto',
            s.desconforto,
            "🥵",
            "😮‍💨"
        );
    }


    // ========================================================
    // VALORES DOS CARDS PRINCIPAIS
    // ========================================================

    if (domElements.valTemperature) {

        const valor =

            v.temperature

            ??

            dadosBanco.temperature;


        const temp =

            Number.isFinite(
                Number(valor)
            )

                ? Number(valor)
                    .toFixed(1)

                : '--.-';


        domElements.valTemperature.innerHTML =

            `${temp}<span class="text-xl font-light opacity-40">°C</span>`;

    }


    if (domElements.valHumidity) {

        const valor =

            v.humidity

            ??

            dadosBanco.humidity;


        const hum =

            Number.isFinite(
                Number(valor)
            )

                ? Number(valor)
                    .toFixed(1)

                : '--.-';


        domElements.valHumidity.innerHTML =

            `${hum}<span class="text-xl font-light opacity-40">%</span>`;

    }


    if (domElements.valCO2) {

        const valor =

            v.co2

            ??

            dadosBanco.co2;


        const co2 =

            valor !== undefined

            &&

            valor !== null

                ? valor

                : '----';


        domElements.valCO2.innerHTML =

            `<span class="text-slate-900 dark:text-white font-black text-3xl sm:text-4xl">${co2}</span>

             <span class="text-base font-light opacity-40">PPM</span>`;

    }


    if (domElements.valPontoOrvalho) {

        const valor =
            Number(
                relatorio.pontoOrvalho
            );


        const valorOrvalho =

            Number.isFinite(valor)

                ? valor.toFixed(1)

                : '--.-';


        domElements.valPontoOrvalho.innerHTML =

            `<span class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">${valorOrvalho}</span>

             <span class="text-xl font-light opacity-40">°C</span>`;

    }


    // ========================================================
    // PARTÍCULAS
    // MASSA × CONTAGEM
    // ========================================================

    const m10 =
        Number(
            dadosBanco.pm1_0
            ??
            v.pm1_0
            ??
            v["PM1.0"]
            ??
            0
        );


    const m25 =
        Number(
            dadosBanco.pm25
            ??
            v.pm25
            ??
            v["PM2.5"]
            ??
            0
        );


    const m40 =
        Number(
            dadosBanco.pm4_0
            ??
            v.pm4_0
            ??
            v["PM4.0"]
            ??
            v.pm40
            ??
            0
        );


    const m100 =
        Number(
            dadosBanco.pm10
            ??
            v.pm10
            ??
            v["PM10"]
            ??
            0
        );


    const contagem =
        t.contagemParticulas
        ||
        {};


    const q10 =
        Number(
            contagem.nc0_5
            ??
            dadosBanco.nc0_5
            ??
            0
        );


    const q25 =
        Number(
            contagem.nc1_0
            ??
            dadosBanco.nc1_0
            ??
            0
        );


    const q40 =
        Number(
            contagem.nc2_5
            ??
            dadosBanco.nc2_5
            ??
            0
        );


    const q100 =
        Number(
            contagem.nc10_0
            ??
            dadosBanco.nc10_0
            ??
            0
        );


    const avaliarAnomaliaParticula = (
        massa,
        quantidade,
        statusContagem,
        limiteCritico
    ) => {

        const status =
            normalizarNivel(
                statusContagem
            );


        if (
            !massa
            &&
            !quantidade
        ) {

            return "BOM";

        }


        if (
            status === "CRÍTICO"
            ||
            massa > limiteCritico
        ) {

            return "CRITICO";

        }


        if (
            status === "ATENÇÃO"
            ||
            massa > (
                limiteCritico * 0.5
            )
        ) {

            return "ALERTA";

        }


        return "BOM";
    };


    const statusC05 =
        avaliarAnomaliaParticula(
            m10,
            q10,
            relatorio.analiseIndividual?.nc05,
            25
        );


    const statusC10 =
        avaliarAnomaliaParticula(
            m25,
            q25,
            relatorio.analiseIndividual?.nc10,
            15
        );


    const statusC25 =
        avaliarAnomaliaParticula(
            m40,
            q40,
            relatorio.analiseIndividual?.nc25
            ||
            "BOM",
            40
        );


    const statusC100 =
        avaliarAnomaliaParticula(
            m100,
            q100,
            relatorio.analiseIndividual?.nc100,
            50
        );


    // ========================================================
    // CARDS SEMAFÓRICOS
    // ========================================================

    if (
        relatorio.analiseIndividual
    ) {

        pintarCard(
            'cardTemp',
            'statusTemp',
            relatorio
                .analiseIndividual
                .temperatura
        );


        pintarCard(
            'cardHum',
            'statusHum',
            relatorio
                .analiseIndividual
                .umidade
        );


        pintarCard(
            'cardCO2',
            'statusCO2',
            relatorio
                .analiseIndividual
                .co2
        );


        pintarCard(
            'cardOrvalho',
            'statusOrvalho',

            relatorio
                .analiseIndividual
                .pontoOrvalho

            ||

            relatorio
                .analiseIndividual
                .umidade
        );
    }


    // ========================================================
    // STATUS GERAL
    // ========================================================

    let statusGeral =
        normalizarNivel(
            relatorio.statusGeral
        );


    // Proteção:
    // caso o analysis.js entregue algum status antigo,
    // o dashboard usa a classificação oficial do Score.

    if (
        ![
            'EXCELENTE',
            'BOM',
            'ATENÇÃO',
            'CRÍTICO'
        ]
        .includes(statusGeral)
    ) {

        if (scoreVal >= 85) {

            statusGeral =
                'EXCELENTE';

        }

        else if (scoreVal >= 70) {

            statusGeral =
                'BOM';

        }

        else if (scoreVal >= 50) {

            statusGeral =
                'ATENÇÃO';

        }

        else {

            statusGeral =
                'CRÍTICO';

        }
    }


    // ========================================================
    // BANNER CRÍTICO
    // ========================================================

    if (
        domElements
            .alertaInfoCritico
    ) {

        domElements
            .alertaInfoCritico
            .classList
            .toggle(
                'hidden',
                statusGeral !== "CRÍTICO"
            );

    }


    // ========================================================
    // PAINEL DE STATUS + TRIAGEM
    // ========================================================

    const {

        panelStatusGeral,
        txtStatusGeral,
        panelTriagem

    } = domElements;


    if (
        panelStatusGeral
        &&
        txtStatusGeral
        &&
        panelTriagem
    ) {

        txtStatusGeral.className =

            "text-xs sm:text-sm font-black uppercase tracking-wider text-white w-full";


        // ----------------------------------------------------
        // EXCELENTE
        // ----------------------------------------------------

        if (
            statusGeral === "EXCELENTE"
        ) {

            panelStatusGeral.className =

                "md:col-span-7 rounded-2xl py-1.5 px-4 text-center md:text-left shadow-sm border-2 transition-all bg-emerald-500 text-white border-emerald-400 font-bold flex items-center justify-center md:justify-start min-h-[44px]";


            txtStatusGeral.innerText =

                "AMBIENTE EM CONDIÇÃO EXCELENTE";


            panelTriagem.innerHTML = `

                <div
                    class="
                        bg-emerald-500/10
                        border
                        border-emerald-500/20
                        rounded-2xl
                        p-4
                        text-emerald-600
                        dark:text-emerald-400
                        font-medium
                        text-xs
                        text-center
                        leading-relaxed
                    "
                >

                    ✅ Os parâmetros monitorados encontram-se
                    em condição excelente dentro das referências
                    técnicas adotadas para este ambiente.

                    Nenhuma ação corretiva é necessária
                    neste momento.

                </div>

            `;

        }


        // ----------------------------------------------------
        // BOM
        // ----------------------------------------------------

        else if (
            statusGeral === "BOM"
        ) {

            panelStatusGeral.className =

                "md:col-span-7 rounded-2xl py-1.5 px-4 text-center md:text-left shadow-sm border-2 transition-all bg-sky-500 text-white border-sky-400 font-bold flex items-center justify-center md:justify-start min-h-[44px]";


            txtStatusGeral.innerText =

                "AMBIENTE EM BOAS CONDIÇÕES";


            panelTriagem.innerHTML = `

                <div
                    class="
                        bg-sky-500/10
                        border
                        border-sky-500/20
                        rounded-2xl
                        p-4
                        text-sky-600
                        dark:text-sky-400
                        font-medium
                        text-xs
                        text-center
                        leading-relaxed
                    "
                >

                    🔵 A qualidade ambiental está boa.

                    Mantenha o monitoramento contínuo
                    e as condições atuais de ventilação,
                    limpeza e climatização.

                </div>

            `;

        }


        // ----------------------------------------------------
        // ATENÇÃO OU CRÍTICO
        // ----------------------------------------------------

        else {

            const critico =
                statusGeral === "CRÍTICO";


            panelStatusGeral.className =

                `md:col-span-7
                 rounded-2xl
                 py-1.5
                 px-4
                 text-center
                 md:text-left
                 shadow-sm
                 border-2
                 transition-all
                 text-white
                 font-bold
                 flex
                 items-center
                 justify-center
                 md:justify-start
                 min-h-[44px]

                 ${
                    critico

                        ? 'bg-rose-600 border-rose-500 animate-pulse'

                        : 'bg-amber-500 border-amber-400'
                 }`;


            txtStatusGeral.innerText =

                critico

                    ? "DESVIOS CRÍTICOS IDENTIFICADOS"

                    : "PARÂMETROS REQUEREM ATENÇÃO";


            let htmlAlertas = `

                <div
                    class="
                        bg-white
                        dark:bg-slate-900
                        border
                        border-slate-200
                        dark:border-slate-800
                        p-3
                        rounded-2xl
                        space-y-3
                        shadow-sm
                    "
                >

                    <h3
                        class="
                            text-[10px]
                            font-black
                            uppercase
                            text-slate-400
                            tracking-wider
                            mb-1
                        "
                    >

                        📋 Diretrizes Técnicas Ativas

                    </h3>

            `;


            const violacoes =

                Array.isArray(
                    relatorio.violacoes
                )

                    ? [
                        ...relatorio.violacoes
                    ]

                    : [];


            // ------------------------------------------------
            // PONTO DE ORVALHO
            // ------------------------------------------------

            if (

                violacoes.some(
                    e =>
                        e.parametro
                        ===
                        "Umidade"
                )

                &&

                !violacoes.some(
                    e =>
                        e.parametro
                        ===
                        "PontoOrvalho"
                )

            ) {

                violacoes.push({

                    parametro:
                        "PontoOrvalho",

                    valor:

                        Number.isFinite(
                            Number(
                                relatorio
                                    .pontoOrvalho
                            )
                        )

                            ? Number(
                                relatorio
                                    .pontoOrvalho
                            )
                            .toFixed(1)

                            : '--',

                    unidade:
                        "°C",

                    gravidade:

                        relatorio
                            .analiseIndividual
                            ?.umidade

                        ||

                        statusGeral

                });

            }


            // ------------------------------------------------
            // LISTA DE VIOLAÇÕES
            // ------------------------------------------------

            if (
                violacoes.length > 0
            ) {

                violacoes.forEach(
                    erro => {

                        const gravidade =
                            normalizarNivel(
                                erro.gravidade
                            );


                        const eCritico =
                            gravidade
                            ===
                            'CRÍTICO';


                        const corBorda =

                            eCritico

                                ? 'border-rose-500'

                                : 'border-amber-500';


                        const corTexto =

                            eCritico

                                ? 'text-rose-600 dark:text-rose-400'

                                : 'text-amber-600 dark:text-amber-400';


                        htmlAlertas += `

                            <div
                                class="
                                    bg-slate-50
                                    dark:bg-slate-950/40
                                    border-l-4
                                    ${corBorda}
                                    rounded-xl
                                    p-3
                                    shadow-sm
                                    transition-all
                                "
                            >

                                <details class="group">

                                    <summary
                                        class="
                                            flex
                                            justify-between
                                            items-center
                                            cursor-pointer
                                            list-none
                                            focus:outline-none
                                            select-none
                                        "
                                    >

                                        <div class="space-y-0.5">

                                            <p
                                                class="
                                                    text-xs
                                                    font-bold
                                                    ${corTexto}
                                                    uppercase
                                                    tracking-tight
                                                "
                                            >

                                                ⚠️
                                                ${obterNomeTraduzido(
                                                    erro.parametro
                                                )}

                                            </p>


                                            <p
                                                class="
                                                    text-[10px]
                                                    text-slate-500
                                                    dark:text-slate-400
                                                    font-mono
                                                "
                                            >

                                                Atual:

                                                ${erro.valor ?? '--'}

                                                ${erro.unidade ?? ''}

                                            </p>

                                        </div>


                                        <span
                                            class="
                                                text-[10px]
                                                bg-white
                                                dark:bg-slate-900
                                                border
                                                border-slate-200
                                                dark:border-slate-800
                                                px-2
                                                py-1
                                                rounded
                                                font-bold
                                                text-slate-500
                                                dark:text-slate-400
                                                group-open:hidden
                                                transition-all
                                                shadow-sm
                                            "
                                        >

                                            🛠️ Ver orientação

                                        </span>


                                        <span
                                            class="
                                                text-[10px]
                                                bg-slate-200
                                                dark:bg-slate-800
                                                px-2
                                                py-1
                                                rounded
                                                font-bold
                                                text-slate-600
                                                dark:text-slate-300
                                                hidden
                                                group-open:inline
                                                transition-all
                                            "
                                        >

                                            ▲ Ocultar

                                        </span>

                                    </summary>


                                    <div
                                        class="
                                            mt-3
                                            pt-2.5
                                            border-t
                                            border-slate-200/60
                                            dark:border-slate-800/80
                                            space-y-2
                                        "
                                    >

                                        <p
                                            class="
                                                text-xs
                                                font-semibold
                                                text-slate-700
                                                dark:text-slate-300
                                                leading-relaxed
                                            "
                                        >

                                            ${obterMensagemAnvisa(
                                                erro.parametro,
                                                erro.valor
                                            )}

                                        </p>


                                        <div
                                            class="
                                                bg-sky-500/[0.06]
                                                rounded-xl
                                                p-3
                                                border
                                                border-sky-500/10
                                            "
                                        >

                                            <p
                                                class="
                                                    text-[9px]
                                                    font-mono
                                                    font-black
                                                    text-sky-600
                                                    dark:text-sky-400
                                                    uppercase
                                                    tracking-wider
                                                "
                                            >

                                                🛠️ PROTOCOLO DE MITIGAÇÃO :

                                            </p>


                                            <p
                                                class="
                                                    text-xs
                                                    text-slate-600
                                                    dark:text-slate-300
                                                    font-medium
                                                    mt-1
                                                    leading-relaxed
                                                "
                                            >

                                                ${obterMitigacaoAnvisa(
                                                    erro.parametro
                                                )}

                                            </p>

                                        </div>

                                    </div>

                                </details>

                            </div>

                        `;

                    }
                );

            }

            else {

                htmlAlertas += `

                    <div
                        class="
                            text-xs
                            text-slate-500
                            dark:text-slate-400
                            p-2
                        "
                    >

                        O Score QAI indica
                        ${statusGeral.toLowerCase()},
                        mas não há violações individuais
                        disponíveis para detalhamento
                        nesta leitura.

                    </div>

                `;

            }


            htmlAlertas +=
                `</div>`;


            panelTriagem.innerHTML =
                htmlAlertas;

        }
    }


    // ========================================================
    // ANÁLISE FÍSICA DE PARTÍCULAS
    // ========================================================

    if (
        domElements
            .panelTriagemMassaQuantidade
    ) {

        const tpsRaw =

            dadosBanco.typical_size

            ??

            dadosBanco.typicalSize

            ??

            dadosBanco.tps

            ??

            t.tamanhoTipico

            ??

            0.45;


        const getClassColor = (
            status
        ) =>

            status === "CRITICO"

                ? "text-rose-500 font-black"

                : (
                    status === "ALERTA"

                        ? "text-amber-500 font-black"

                        : "text-emerald-500 font-black"
                );


        const getClassBorder = (
            status
        ) =>

            status === "CRITICO"

                ? "border-rose-500/50 bg-rose-500/[0.02]"

                : (
                    status === "ALERTA"

                        ? "border-amber-500/40 bg-amber-500/[0.02]"

                        : "border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20"
                );


        domElements
            .panelTriagemMassaQuantidade
            .innerHTML = `

            <div class="space-y-4">

                <div
                    class="
                        flex
                        flex-col
                        sm:flex-row
                        justify-between
                        items-start
                        sm:items-center
                        gap-2
                        px-1
                    "
                >

                    <h2
                        class="
                            text-xs
                            font-black
                            text-slate-800
                            dark:text-slate-200
                            uppercase
                            tracking-wider
                        "
                    >

                        🔬 Análise Física de Partículas
                        (Massa × Contagem - NBR 17037)

                    </h2>


                    <span
                        class="
                            bg-slate-100
                            text-slate-700
                            dark:bg-slate-800
                            dark:text-slate-300
                            text-[10px]
                            font-mono
                            px-2.5
                            py-1
                            rounded-md
                            font-bold
                            border
                            border-slate-200
                            dark:border-slate-700
                            text-center
                            tracking-tight
                        "
                    >

                        📐 TAMANHO MÉDIO RELEVANTE:

                        ${Number(tpsRaw).toFixed(2)} µm

                    </span>

                </div>


                <div
                    class="
                        grid
                        grid-cols-1
                        sm:grid-cols-2
                        md:grid-cols-4
                        gap-3
                    "
                >

                    ${renderParticulaCard(

                        "Partículas Ultrafinas Suspensas",

                        m10,

                        q10,

                        getClassBorder(
                            statusC05
                        ),

                        getClassColor(
                            statusC05
                        )

                    )}


                    ${renderParticulaCard(

                        "Aerossóis e Fumaças",

                        m25,

                        q25,

                        getClassBorder(
                            statusC10
                        ),

                        getClassColor(
                            statusC10
                        )

                    )}


                    ${renderParticulaCard(

                        "Poeira Inalável Fina",

                        m40,

                        q40,

                        getClassBorder(
                            statusC25
                        ),

                        getClassColor(
                            statusC25
                        )

                    )}


                    ${renderParticulaCard(

                        "Particulado Macroscópico",

                        m100,

                        q100,

                        getClassBorder(
                            statusC100
                        ),

                        getClassColor(
                            statusC100
                        )

                    )}

                </div>

            </div>

        `;

    }
}


// ============================================================
// CARD DE PARTÍCULAS
// ============================================================

function renderParticulaCard(
    titulo,
    massa,
    contagem,
    classeBorda,
    classeCorMassa
) {

    return `

        <div
            class="
                p-3.5
                border
                rounded-xl
                flex
                flex-col
                justify-between
                text-center
                ${classeBorda}
            "
        >

            <div>

                <p
                    class="
                        text-xs
                        text-slate-800
                        dark:text-slate-200
                        font-bold
                        uppercase
                        tracking-tight
                    "
                >

                    ${titulo}

                </p>

            </div>


            <div
                class="
                    mt-2
                    py-2
                    bg-white
                    dark:bg-slate-950
                    border
                    border-slate-200/60
                    dark:border-slate-800/80
                    rounded-xl
                    space-y-1
                "
            >

                <p
                    class="
                        text-[11px]
                        text-slate-400
                        font-medium
                    "
                >

                    Massa:

                    <span class="${classeCorMassa}">

                        ${
                            massa > 0

                                ? massa.toFixed(2)

                                : '--'
                        }

                        µg/m³

                    </span>

                </p>


                <p
                    class="
                        text-[11px]
                        text-slate-400
                        font-medium
                    "
                >

                    Contagem:

                    <span
                        class="
                            text-sky-500
                            font-bold
                        "
                    >

                        ${
                            contagem > 0

                                ? contagem.toFixed(0)

                                : '--'
                        }

                        pt/cm³

                    </span>

                </p>

            </div>

        </div>

    `;

}


// ============================================================
// PINTURA DOS CARDS
// ============================================================

function pintarCard(
    cardId,
    statusId,
    nivel
) {

    const card =

        domElements[cardId]

        ||

        document.getElementById(
            cardId
        );


    const status =

        domElements[statusId]

        ||

        document.getElementById(
            statusId
        );


    if (
        !card
        ||
        !status
    ) {

        return;

    }


    const nivelNormalizado =
        normalizarNivel(
            nivel
        );


    card.classList.remove(

        'border-emerald-500',
        'border-sky-500',
        'border-amber-500',
        'border-rose-600',
        'border-transparent'

    );


    status.className =

        "text-[9px] font-black uppercase py-0.5 px-2 rounded w-fit text-white";


    // ========================================================
    // PARÂMETRO BOM / EXCELENTE
    // ========================================================

    if (
        nivelNormalizado === "BOM"
        ||
        nivelNormalizado === "EXCELENTE"
    ) {

        card.classList.add(
            'border-emerald-500'
        );


        status.innerText =
            "🟢 EXCELENTE";


        status.classList.add(
            'bg-emerald-500'
        );

    }


    // ========================================================
    // ATENÇÃO
    // ========================================================

    else if (
        nivelNormalizado === "ATENÇÃO"
    ) {

        card.classList.add(
            'border-amber-500'
        );


        status.innerText =
            "⚠️ ATENÇÃO";


        status.classList.add(
            'bg-amber-500'
        );

    }


    // ========================================================
    // CRÍTICO
    // ========================================================

    else {

        card.classList.add(
            'border-rose-600'
        );


        status.innerText =
            "🚨 CRÍTICO";


        status.classList.add(
            'bg-rose-600'
        );

    }
}


// ============================================================
// NOMES TRADUZIDOS
// ============================================================

function obterNomeTraduzido(param) {

    const nomes = {

        "CO2":
            "Dióxido de Carbono (Renovação do Ar)",

        "CO":
            "Monóxido de Carbono (Gás Tóxico)",

        "VOC":
            "Compostos Orgânicos Voláteis (VOC)",

        "PM1.0":
            "Partículas Ultrafinas (PM1.0)",

        "PM2.5":
            "Partículas Finas Inaláveis (PM2.5)",

        "PM4.0":
            "Poeira Respirável (PM4.0)",

        "PM10":
            "Partículas Grossas (PM10)",

        "NC0.5":
            "Contagem de Partículas Ultrafinas",

        "NC1.0":
            "Contagem de Partículas Finas",

        "NC2.5":
            "Contagem de Partículas Finas",

        "NC10.0":
            "Contagem de Partículas Grossas",

        "Temperatura":
            "Conforto Térmico",

        "Umidade":
            "Umidade do Ambiente",

        "PontoOrvalho":
            "Risco de Condensação"

    };


    return nomes[param]
        ||
        param;
}


// ============================================================
// MENSAGENS
// ============================================================

function obterMensagemAnvisa(
    param,
    valor
) {

    const mensagens = {

        "CO2":

            `⚠️ A concentração de CO₂ está acima da faixa recomendada. Isso indica renovação insuficiente do ar e acúmulo do ar exalado pelos ocupantes.`,


        "CO":

            `🚨 Foi detectada concentração de Monóxido de Carbono acima do nível seguro. Essa condição pode indicar entrada de gases provenientes de combustão.`,


        "VOC":

            `⚠️ A concentração de Compostos Orgânicos Voláteis (VOC) está elevada. Isso pode indicar acúmulo de produtos químicos, solventes ou materiais presentes no ambiente.`,


        "PM1.0":

            `🚨 Foi identificada elevada concentração de partículas ultrafinas. Essas partículas permanecem suspensas por mais tempo e reduzem a qualidade do ar.`,


        "PM2.5":

            `🚨 Foi identificada elevada concentração de partículas finas inaláveis. Essa condição pode favorecer desconforto respiratório em ambientes internos.`,


        "PM4.0":

            `🌬️ Foi observado aumento da concentração de partículas respiráveis, indicando maior presença de poeira em suspensão.`,


        "PM10":

            `🍂 A concentração de partículas maiores está elevada. Esse comportamento favorece a circulação de poeira, pólen e outros materiais suspensos.`,


        "NC0.5":

            `🚨 A quantidade de partículas ultrafinas em suspensão está acima do esperado para um ambiente com boa qualidade do ar.`,


        "NC1.0":

            `🚨 A contagem de partículas finas está elevada, indicando aumento da concentração de aerossóis presentes no ambiente.`,


        "NC2.5":

            `⚠️ Foi identificado aumento da quantidade de partículas finas em suspensão, reduzindo a qualidade ambiental.`,


        "NC10.0":

            `🍂 Foi observada elevada quantidade de partículas maiores em suspensão, indicando aumento de poeira e materiais particulados.`,


        "Temperatura":

            `🌡️ A temperatura está fora da faixa recomendada para proporcionar conforto térmico aos ocupantes.`,


        "Umidade":

            `💧 A umidade relativa está fora da faixa recomendada. Essa condição pode comprometer o conforto ambiental e favorecer condições inadequadas no ambiente.`,


        "PontoOrvalho":

            `🚨 As condições atuais aumentam o risco de condensação sobre superfícies frias, favorecendo umidade excessiva e formação de mofo.`

    };


    return mensagens[param]

        ||

        "⚠️ Foi identificado um parâmetro ambiental fora da faixa recomendada para ambientes internos.";

}


// ============================================================
// MITIGAÇÕES
// ============================================================

function obterMitigacaoAnvisa(
    param
) {

    const mitigacoes = {

        "CO2":

            `🍃 Aumente a renovação do ar abrindo portas, janelas ou ajustando o sistema de ventilação. Verifique se a ocupação do ambiente é compatível com a capacidade de ventilação disponível.`,


        "CO":

            `🚨 Afaste imediatamente os ocupantes, se necessário, e aumente a ventilação do ambiente. Verifique possíveis fontes de combustão ou entrada de gases externos antes de reutilizar o local.`,


        "VOC":

            `🧪 Aumente a ventilação do ambiente e reduza o uso de produtos químicos enquanto os níveis permanecerem elevados. Verifique possíveis fontes como tintas, solventes, produtos de limpeza ou mobiliário novo.`,


        "PM1.0":

            `🌬️ Aumente a renovação do ar e reduza fontes que possam gerar partículas ultrafinas. Verifique a presença de fumaça, processos de combustão ou equipamentos que produzam aerossóis.`,


        "PM2.5":

            `🌬️ Aumente a ventilação do ambiente e realize limpeza úmida sempre que necessário. Verifique filtros de climatização e possíveis fontes de poeira fina ou fumaça.`,


        "PM4.0":

            `🧹 Realize limpeza do ambiente e aumente a renovação do ar. Verifique atividades que possam estar elevando a concentração de poeira em suspensão.`,


        "PM10":

            `🍂 Reduza o acúmulo de poeira realizando limpeza adequada e aumentando a ventilação. Verifique entradas de poeira externa, circulação de pessoas e atividades que levantem partículas.`,


        "NC0.5":

            `🔬 Aumente a renovação do ar e verifique possíveis fontes de partículas ultrafinas. Avalie a eficiência da filtragem e as condições de ventilação do ambiente.`,


        "NC1.0":

            `🔬 Reforce a renovação do ar e verifique possíveis fontes de aerossóis ou fumaça. Avalie também o desempenho do sistema de filtragem do ambiente.`,


        "NC2.5":

            `🌬️ Aumente a ventilação e reduza fontes de partículas em suspensão. Verifique a necessidade de limpeza e a eficiência da filtragem do ar.`,


        "NC10.0":

            `🧹 Realize limpeza do ambiente para reduzir o acúmulo de partículas maiores. Verifique entradas de poeira e atividades que favoreçam sua dispersão.`,


        "Temperatura":

            `🌡️ Ajuste a climatização para restabelecer a faixa de conforto térmico. Verifique a incidência solar, a ocupação do ambiente e o funcionamento do sistema de climatização.`,


        "Umidade":

            `💧 Ajuste as condições de ventilação ou climatização para restabelecer a umidade recomendada. Verifique possíveis fontes de umidade excessiva ou ar excessivamente seco.`,


        "PontoOrvalho":

            `💦 Reduza a umidade do ambiente e aumente a circulação de ar para minimizar a condensação. Verifique superfícies frias, isolamento térmico e possíveis sinais de infiltração.`

    };


    return mitigacoes[param]

        ||

        "🔎 Recomenda-se verificar as condições do ambiente e adotar medidas para restabelecer a qualidade do ar.";

}
