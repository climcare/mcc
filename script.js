// ============================================================
// SCORE QAI
// ============================================================
// IMPORTANTE:
// O script.js NÃO calcula o Score.
// Ele apenas exibe scoreGeral calculado pelo analysis.js,
// que deve reproduzir exatamente o algoritmo do dispositivo.
//
// CLASSIFICAÇÃO OFICIAL:
// 85–100 = EXCELENTE
// 70–84  = BOM
// 50–69  = ATENÇÃO
// 0–49   = CRÍTICO
// ============================================================

const scoreVal =
    relatorio.scoreGeral !== undefined
        ? Number(relatorio.scoreGeral)
        : 100;

const {
    lblScoreNumero,
    lblScoreStatus,
    barScoreProgresso,
    scoreContainer
} = domElements;


if (
    lblScoreNumero &&
    lblScoreStatus &&
    barScoreProgresso &&
    scoreContainer
) {

    // --------------------------------------------------------
    // VALOR
    // --------------------------------------------------------

    lblScoreNumero.innerText =
        Math.round(scoreVal);

    barScoreProgresso.style.width =
        `${Math.max(0, Math.min(100, scoreVal))}%`;


    // --------------------------------------------------------
    // LIMPAR CORES ANTERIORES
    // --------------------------------------------------------

    scoreContainer.classList.remove(

        "border-emerald-500",
        "bg-emerald-500/5",

        "border-sky-500",
        "bg-sky-500/5",

        "border-amber-500",
        "bg-amber-500/5",

        "border-rose-500",
        "bg-rose-500/5"

    );


    lblScoreStatus.classList.remove(

        "text-emerald-500",
        "text-sky-500",
        "text-amber-500",
        "text-rose-500"

    );


    barScoreProgresso.classList.remove(

        "bg-emerald-500",
        "bg-sky-500",
        "bg-amber-500",
        "bg-rose-500"

    );


    // --------------------------------------------------------
    // EXCELENTE
    // 85–100
    // --------------------------------------------------------

    if (scoreVal >= 85) {

        lblScoreStatus.innerText =
            "EXCELENTE";

        lblScoreStatus.classList.add(
            "text-emerald-500"
        );

        scoreContainer.classList.add(
            "border-emerald-500",
            "bg-emerald-500/5"
        );

        barScoreProgresso.classList.add(
            "bg-emerald-500"
        );
    }


    // --------------------------------------------------------
    // BOM
    // 70–84
    // --------------------------------------------------------

    else if (scoreVal >= 70) {

        lblScoreStatus.innerText =
            "BOM";

        lblScoreStatus.classList.add(
            "text-sky-500"
        );

        scoreContainer.classList.add(
            "border-sky-500",
            "bg-sky-500/5"
        );

        barScoreProgresso.classList.add(
            "bg-sky-500"
        );
    }


    // --------------------------------------------------------
    // ATENÇÃO
    // 50–69
    // --------------------------------------------------------

    else if (scoreVal >= 50) {

        lblScoreStatus.innerText =
            "ATENÇÃO";

        lblScoreStatus.classList.add(
            "text-amber-500"
        );

        scoreContainer.classList.add(
            "border-amber-500",
            "bg-amber-500/5"
        );

        barScoreProgresso.classList.add(
            "bg-amber-500"
        );
    }


    // --------------------------------------------------------
    // CRÍTICO
    // 0–49
    // --------------------------------------------------------

    else {

        lblScoreStatus.innerText =
            "CRÍTICO";

        lblScoreStatus.classList.add(
            "text-rose-500"
        );

        scoreContainer.classList.add(
            "border-rose-500",
            "bg-rose-500/5"
        );

        barScoreProgresso.classList.add(
            "bg-rose-500"
        );
    }
}
