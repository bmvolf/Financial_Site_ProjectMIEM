(() => {
    const chart = document.getElementById('allocation-chart');
    const message = document.getElementById('allocation-message');

    if (!chart || !message) return;

    const percentFormatter = new Intl.NumberFormat('ru-RU', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    function renderAllocation(tickers, weights) {
        chart.replaceChildren();

        const valid =
            Array.isArray(tickers) &&
            Array.isArray(weights) &&
            tickers.length > 0 &&
            tickers.length === weights.length &&
            tickers.every(ticker => typeof ticker === 'string') &&
            weights.every(weight => Number.isFinite(weight));

        if (!valid) {
            throw new Error(
                'Список тикеров и массив числовых весов должны иметь одинаковую длину.'
            );
        }

        // Сначала связываем каждый тикер с его весом,
        // затем сортируем пары по размеру позиции.
        const assets = tickers.map((ticker, index) => ({
            ticker,
            weight: weights[index],
        }));

        assets.sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight));

        // Обычно вся полоса соответствует 100%.
        // Если есть плечо и вес больше 100%, расширяем общую шкалу.
        const scale = Math.max(
            1,
            ...assets.map(asset => Math.abs(asset.weight))
        );

        const fragment = document.createDocumentFragment();

        for (const { ticker, weight } of assets) {
            const row = document.createElement('div');
            row.className = 'allocation-row';
            row.title = `${ticker}: ${weight * 100}%`;

            const label = document.createElement('span');
            label.className = 'allocation-ticker';
            label.textContent = ticker;
            label.title = ticker;

            const track = document.createElement('div');
            track.className = 'allocation-track';
            track.setAttribute('aria-hidden', 'true');

            const bar = document.createElement('div');
            bar.className = 'allocation-bar';
            bar.style.width = `${Math.abs(weight) / scale * 100}%`;

            if (weight < 0) {
                bar.classList.add('is-negative');
            }

            const value = document.createElement('span');
            value.className = 'allocation-weight';
            value.textContent = percentFormatter.format(weight);

            track.appendChild(bar);
            row.append(label, track, value);
            fragment.appendChild(row);
        }

        chart.appendChild(fragment);
        message.hidden = true;
    }

    try {
        const saved = sessionStorage.getItem('portfolioResult');

        if (!saved) return;

        const data = JSON.parse(saved);

        renderAllocation(data.tickers, data.portfolio_weights);
    } catch (error) {
        message.hidden = false;
        message.textContent = `Не удалось построить структуру портфеля: ${error.message}`;
        console.error(error);
    }
})();