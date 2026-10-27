function renderCovarianceMatrix(tickers, matrix) {
    const svg = document.getElementById('covariance-chart');
    const message = document.getElementById('covariance-message');
    const legend = document.querySelector('.covariance-legend');

    if (!svg) return;

    svg.replaceChildren();
    legend.hidden = true;

    const n = Array.isArray(tickers) ? tickers.length : 0;

    // Проверяем размеры и числовые значения.
    const valid =
        n >= 2 &&
        n <= 100 &&
        tickers.every(ticker => typeof ticker === 'string') &&
        Array.isArray(matrix) &&
        matrix.length === n &&
        matrix.every(row =>
            Array.isArray(row) &&
            row.length === n &&
            row.every(value => Number.isFinite(value))
        );

    if (!valid) {
        message.hidden = false;
        message.textContent =
            'Нужна числовая матрица N × N и список из N тикеров (2–100).';
        return;
    }

    message.hidden = true;

    const ns = 'http://www.w3.org/2000/svg';

    function element(tag, attributes = {}, text = null) {
        const node = document.createElementNS(ns, tag);

        for (const [key, value] of Object.entries(attributes)) {
            node.setAttribute(key, value);
        }

        if (text !== null) node.textContent = text;
        return node;
    }

    function formatValue(value) {
        if (value === 0) return '0';

        if (Math.abs(value) < 0.001 || Math.abs(value) >= 1000) {
            return value.toExponential(2);
        }

        return Number(value.toPrecision(4)).toString();
    }

    // Симметричная шкала: отрицательные — терракотовые,
    // нулевые — тёмные, положительные — зелёные.
    let maxAbs = 0;

    matrix.forEach(row => {
        row.forEach(value => {
            maxAbs = Math.max(maxAbs, Math.abs(value));
        });
    });

    function cellColor(value) {
        const neutral = [37, 43, 37];
        const target = value < 0 ? [173, 103, 76] : [113, 150, 101];
        const intensity = maxAbs === 0 ? 0 : Math.abs(value) / maxAbs;

        const rgb = neutral.map((channel, index) =>
            Math.round(channel + (target[index] - channel) * intensity)
        );

        return `rgb(${rgb.join(',')})`;
    }

    const showNumbers = n <= 10;
    const cellSize = showNumbers ? 62 : 28;

    // Место для подписей слева и сверху.
    const longestTicker = Math.max(...tickers.map(ticker => ticker.length));
    const padding = Math.max(80, longestTicker * 7 + 20);
    const size = padding + n * cellSize + 16;

    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('viewBox', `0 0 ${size} ${size}`);

    const fragment = document.createDocumentFragment();

    tickers.forEach((ticker, index) => {
        const center = padding + index * cellSize + cellSize / 2;

        // Подписи строк.
        fragment.appendChild(element('text', {
            x: padding - 10,
            y: center,
            class: 'covariance-label',
            'text-anchor': 'end',
            'dominant-baseline': 'middle',
        }, ticker));

        // Вертикальные подписи столбцов.
        fragment.appendChild(element('text', {
            transform: `translate(${center}, ${padding - 10}) rotate(-90)`,
            class: 'covariance-label',
            'text-anchor': 'start',
            'dominant-baseline': 'middle',
        }, ticker));
    });

    matrix.forEach((row, i) => {
        row.forEach((value, j) => {
            const x = padding + j * cellSize;
            const y = padding + i * cellSize;

            const rect = element('rect', {
                x: x + 1,
                y: y + 1,
                width: cellSize - 2,
                height: cellSize - 2,
                rx: 3,
                fill: cellColor(value),
                class: 'covariance-cell',
            });

            // Нативная подсказка браузера с исходным значением.
            rect.appendChild(element(
                'title',
                {},
                `${tickers[i]} × ${tickers[j]}\nКовариация: ${value}`
            ));

            fragment.appendChild(rect);

            if (showNumbers) {
                fragment.appendChild(element('text', {
                    x: x + cellSize / 2,
                    y: y + cellSize / 2,
                    class: 'covariance-value',
                    'text-anchor': 'middle',
                    'dominant-baseline': 'middle',
                    'font-size': 10,
                }, formatValue(value)));
            }
        });
    });

    svg.appendChild(fragment);

    document.getElementById('covariance-min').textContent =
        formatValue(-maxAbs);

    document.getElementById('covariance-max').textContent =
        formatValue(maxAbs);

    legend.hidden = false;
}

// Загружаем тот же результат, который используется для верхних карточек.
try {
    const saved = sessionStorage.getItem('portfolioResult');

    if (saved) {
        const data = JSON.parse(saved);

        renderCovarianceMatrix(
            data.tickers,
            data.covariance_matrix
        );
    }
} catch (error) {
    const message = document.getElementById('covariance-message');

    if (message) {
        message.hidden = false;
        message.textContent =
            'Не удалось загрузить матрицу. Выполните расчёт заново.';
    }

    console.error(error);
}