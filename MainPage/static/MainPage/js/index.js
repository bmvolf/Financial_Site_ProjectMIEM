(() => {
// Хранилище выбора для 5 модулей: [null, null, null, null, null]
    const selections = new Array(modulesData.length).fill(null);
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
    confirmBtn.addEventListener('click', () => {
      if (confirmBtn.disabled) return;

      console.clear();
      console.log('%c======================================================', 'color: #344a32; font-weight: bold;');
      console.log('%c ПАРАМЕТРЫ РАСЧЕТА ИНВЕСТИЦИОННОГО ПОРТФЕЛЯ (ВЫБРАННЫЕ МЕТОДЫ) ', 'background: #344a32; color: #fffef0; font-weight: bold; padding: 4px;');
      console.log('%c======================================================', 'color: #344a32; font-weight: bold;');

      selections.forEach(sel => {
        console.log(`%c[Модуль 0${sel.moduleId}: ${sel.moduleName}]`, 'color: #80674e; font-weight: bold;');
        console.log(`  -> Метод: ${sel.methodName}`);
        console.log(`  -> Описание: ${sel.desc}`);
      });

      console.log('%c------------------------------------------------------', 'color: #77776d;');
      console.table(selections.map(s => ({
        Модуль: s.moduleName,
        Выбранный_метод: s.methodName,
        Идентификатор: s.methodId
      })));

      alert('Выбранные методы выведены в консоль браузера (F12 → Console). Вычисления пока не подключены.');
    });



    // Инициализация первого модуля
    displayModule(0);
    checkConfirmStatus();

})();
