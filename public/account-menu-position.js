(() => {
  const menu = document.getElementById("sidebarAccountMenu");
  const button = document.getElementById("settingsMenuBtn");
  if (!menu || !button) return;

  function positionAccountMenu() {
    if (menu.hidden) return;
    const trigger = button.getBoundingClientRect();
    const bounds = menu.getBoundingClientRect();
    const edge = 12;
    const left = Math.max(edge, Math.min(trigger.left, window.innerWidth - bounds.width - edge));
    let top = trigger.top - bounds.height - 10;
    if (top < edge) top = trigger.bottom + 10;
    top = Math.max(edge, Math.min(top, window.innerHeight - bounds.height - edge));
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
  }

  // admin-php.js toggles the menu first; this later listener anchors it before paint.
  document.addEventListener("click", event => {
    if (event.target.closest("#settingsMenuBtn")) positionAccountMenu();
  });
  window.addEventListener("resize", positionAccountMenu, { passive: true });
  window.addEventListener("scroll", positionAccountMenu, { capture: true, passive: true });
})();