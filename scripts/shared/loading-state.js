(function () {
  const ids = {
    loading: 'loading-message',
    reveal: 'reveal-container',
    error: 'error-message',
  };

  function getEl(id) {
    return document.getElementById(id);
  }

  function setDisplay(el, display) {
    if (el) {
      el.style.display = display;
    }
  }

  function showLoading() {
    setDisplay(getEl(ids.loading), 'flex');
    setDisplay(getEl(ids.reveal), 'none');
    setDisplay(getEl(ids.error), 'none');
  }

  function showReveal() {
    setDisplay(getEl(ids.reveal), 'block');
  }

  function hideLoading() {
    setDisplay(getEl(ids.loading), 'none');
  }

  function showError(message) {
    const loadingEl = getEl(ids.loading);
    const revealEl = getEl(ids.reveal);
    const errorEl = getEl(ids.error);

    setDisplay(loadingEl, 'none');
    setDisplay(revealEl, 'none');

    if (errorEl) {
      const paragraph = errorEl.querySelector('p');
      if (paragraph) {
        paragraph.innerHTML = message;
      }
      setDisplay(errorEl, 'flex');
    }
  }

  window.lessonLoadingState = {
    showLoading,
    showReveal,
    hideLoading,
    showError,
  };

  window.showError = showError;
})();
