(() => {
// Хранилище выбора для 5 модулей: [null, null, null, null, null]
    const selections = new Array(modulesData.length).fill(null);
  const storageKey = 'selectedMethods';

  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey) || '[]');

    if (Array.isArray(saved)) {
      modulesData.forEach((module, index) => {
        const savedSelection = saved[index];

        if (!savedSelection) return;

        // Проверяем, что сохранённый метод ещё существует.
        const method = module.methods.find(
          method => method.id === savedSelection.methodId
        );

        if (!method) return;

        // Названия и описание берём из актуальных данных.
        selections[index] = {
          moduleId: index + 1,
          moduleName: module.title,
          methodId: method.id,
          methodName: method.name,
          desc: method.desc,
        };
      });
    }
  } catch (error) {
    console.warn('Не удалось восстановить выбранные методы:', error);
  }

    let currentModuleIndex = 0;

    const cards = [...document.querySelectorAll('.module')];
    const moduleNumber = document.querySelector('#module-number');
    const moduleCategory = document.querySelector('#module-category');
    const moduleTitle = document.querySelector('#module-title');
    const moduleDesc = document.querySelector('#module-desc');
    const methodList = document.querySelector('#method-list');
    const methodTitle = document.querySelector('#method-title');
    const methodDesc = document.querySelector('#method-desc');
    const confirmBtn = document.querySelector('.confirm');

    // Проверка активности кнопки «Рассчитать»
    function checkConfirmStatus() {
      const allDone = selections.every(s => s !== null);
      confirmBtn.disabled = !allDone;
      if (allDone) {
        confirmBtn.title = 'Все 5 методов выбраны! Нажмите для расчета и вывода в консоль браузера';
      } else {
        const left = selections.filter(s => s === null).length;
        confirmBtn.title = `Выберите методы еще в ${left} модулях`;
      }
    }

    // Выбор конкретного метода кликом по точке слева
    function selectMethod(method, itemEl) {
      selections[currentModuleIndex] = {
        moduleId: currentModuleIndex + 1,
        moduleName: modulesData[currentModuleIndex].title,
        methodId: method.id,
        methodName: method.name,
        desc: method.desc
      };
      sessionStorage.setItem(storageKey, JSON.stringify(selections));
      // Переключаем активную точку
      [...methodList.children].forEach(li => li.classList.remove('active'));
      itemEl.classList.add('active');

      // Обновляем описание по центру
      methodTitle.textContent = method.name;
      methodDesc.textContent = method.desc;

      // Обновляем статус в карточке модуля наверху
      cards[currentModuleIndex].querySelector('.module-status').textContent = '✓ ' + method.name;

      checkConfirmStatus();
    }

    // Отрисовка активного модуля
    function displayModule(index) {
      currentModuleIndex = index;
      const data = modulesData[index];

      // Активная карточка модуля
      cards.forEach((c, i) => c.setAttribute('aria-pressed', String(i === index)));

      moduleNumber.textContent = 'Модуль ' + String(index + 1).padStart(2, '0');
      moduleCategory.textContent = data.category;
      moduleTitle.textContent = data.title;
      moduleDesc.textContent = data.description;

      // Отрисовка списка 5 методов с точками слева
      methodList.innerHTML = '';
      data.methods.forEach((method, i) => {
        const li = document.createElement('li');
        li.className = 'method-item';

        const isSelected = selections[index] && selections[index].methodId === method.id;
        if (isSelected) li.classList.add('active');

        li.innerHTML = `
          <span class="method-num">${String(i + 1).padStart(2, '0')}</span>
          <span class="method-dot" title="Нажмите, чтобы выбрать"></span>
          <span class="method-name">${method.name}</span>
        `;

        li.addEventListener('click', () => selectMethod(method, li));
        methodList.appendChild(li);
      });

      // Отображение описания метода по центру
      if (selections[index]) {
        methodTitle.textContent = selections[index].methodName;
        methodDesc.textContent = selections[index].desc;
      } else {
        methodTitle.textContent = 'Метод не выбран';
        methodDesc.textContent = 'Нажмите на точку напротив любого метода слева, чтобы ознакомиться с его описанием и назначить для расчета.';
      }
    }

    // Клик по модулям наверху
    cards.forEach((card, index) => {
      card.addEventListener('click', () => displayModule(index));
    });

    // Кнопка «Рассчитать»: вывод в консоль браузера (console.log)
  confirmBtn.addEventListener('click', async () => {
    if (confirmBtn.disabled) return;

    const output = document.querySelector('#calculation-result');
    const csrfToken = document.querySelector(
        '[name=csrfmiddlewaretoken]'
    ).value;

    confirmBtn.disabled = true;
    output.textContent = 'Выполняется расчёт…';

    try {
        const response = await fetch(confirmBtn.dataset.url, {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },

            // Для примера метод и данные заданы явно.
            body: JSON.stringify({
            methods: selections.map(selection => ({
                module_id: selection.moduleId,
                method_id: selection.methodId,
            })),
            tickers: ['SBER', 'LKOH'],
        }),
        });

        if (!response.headers.get('content-type')?.includes('application/json')) {
            throw new Error(`Сервер вернул неожиданный ответ: ${response.status}`);
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Ошибка расчёта');
        }
        sessionStorage.setItem("portfolioResult", JSON.stringify(data));

        const result = data.result;

        output.textContent = JSON.stringify(data, null, 2);
        sessionStorage.setItem("portfolioResult", JSON.stringify(data));

        // Переходим на страницу дашбордов.
        //window.location.href = "dashboard";

    } catch (error) {
        output.textContent = `Ошибка: ${error.message}`;
    } finally {
        checkConfirmStatus();
    }
});



    // Инициализация первого модуля
  // Восстанавливаем подписи выбранных методов на всех карточках.
  cards.forEach((card, index) => {
    const selection = selections[index];

    if (selection) {
      card.querySelector('.module-status').textContent =
        '✓ ' + selection.methodName;
    }
  });

  // displayModule уже умеет восстанавливать активную точку
  // и описание из selections.
  displayModule(0);
  checkConfirmStatus();

})();
