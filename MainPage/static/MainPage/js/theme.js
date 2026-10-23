(() => {
    const themeBtn = document.querySelector('.theme');
    if (!themeBtn) return;

    function applyTheme(dark) {
        document.documentElement.classList.toggle('dark', dark);
        themeBtn.setAttribute('aria-pressed', String(dark));
        themeBtn.textContent = dark ? '☀ Светлая' : '☾ Тёмная';
    }

    applyTheme(document.documentElement.classList.contains('dark'));
    themeBtn.addEventListener('click', () => {
        const dark = !document.documentElement.classList.contains('dark');
        applyTheme(dark);
        try {
            localStorage.setItem('theme', dark ? 'dark' : 'light');
        } catch (error) { /* Переключение работает и без сохранения. */ }
    });
})();
