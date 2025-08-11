document.addEventListener('DOMContentLoaded', () => {
  const LoadingOverlay = (() => {
    const overlay = document.getElementById('loading-overlay');
    let startTime = 0;
    const MIN_DURATION = 400;

    function show() {
      if (!overlay) return;
      startTime = Date.now();
      overlay.classList.add('show');
    }

    function hide() {
      if (!overlay) return;
      const elapsed = Date.now() - startTime;
      const delay = Math.max(0, MIN_DURATION - elapsed);
      setTimeout(() => overlay.classList.remove('show'), delay);
    }

    return { show, hide };
  })();

  window.LoadingOverlay = LoadingOverlay;
});
