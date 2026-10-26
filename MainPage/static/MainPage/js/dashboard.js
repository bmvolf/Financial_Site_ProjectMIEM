function fillDashboard() {
    const message = document.getElementById("dashboard-message");
    const savedResult = sessionStorage.getItem("portfolioResult");

    if (!savedResult) {
        return;
    }

    try {
        const data = JSON.parse(savedResult);
        const metrics = data.metrics;

        if (!metrics || typeof metrics !== "object") {
            throw new Error("В результате отсутствуют показатели");
        }

        function formatPercent(value, showPlus = false) {
            if (!Number.isFinite(value)) {
                return "—";
            }

            const sign = showPlus && value > 0 ? "+" : "";
            return `${sign}${(value * 100).toFixed(2)}%`;
        }

        function formatNumber(value) {
            return Number.isFinite(value) ? value.toFixed(2) : "—";
        }

        document.getElementById("metric-return").textContent =
            formatPercent(metrics.expected_return, true);

        document.getElementById("metric-volatility").textContent =
            formatPercent(metrics.volatility);

        // Эти поля можно добавить в JSON позже.
        document.getElementById("metric-sharpe").textContent =
            formatNumber(metrics.sharpe_ratio);

        document.getElementById("metric-var").textContent =
            formatPercent(metrics.var_95);

        message.hidden = true;
    } catch (error) {
        message.hidden = false;
        message.textContent =
            "Не удалось загрузить показатели. Выполните расчёт заново.";
        console.error(error);
    }
}

fillDashboard();