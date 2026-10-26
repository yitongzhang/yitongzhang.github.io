/* Hover/focus for a quick look; click/tap to pin. Escape, a second tap or outside closes. */
(() => {
  const tips = [...document.querySelectorAll('.training-tip')];
  const closeAll = (except) => tips.forEach(tip => { if (tip !== except) tip.closeTip(); });
  tips.forEach(tip => {
    const button = tip.querySelector('button');
    const panel = tip.querySelector('[role="tooltip"]');
    let pinned = false;
    const show = () => {
      closeAll(tip); panel.hidden = false; button.setAttribute('aria-expanded', 'true');
      const rect = button.getBoundingClientRect();
      const width = panel.getBoundingClientRect().width;
      panel.style.left = `${Math.max(24, Math.min(rect.left - 12, window.innerWidth - width - 24))}px`;
      const height = panel.getBoundingClientRect().height;
      panel.style.top = `${Math.max(8, Math.min(rect.bottom + 8, window.innerHeight - height - 8))}px`;
    };
    tip.closeTip = () => { pinned = false; panel.hidden = true; button.setAttribute('aria-expanded', 'false'); };
    tip.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') show(); });
    let hideTimer;
    tip.addEventListener('pointerleave', () => { hideTimer = setTimeout(() => { if (!pinned && document.activeElement !== button) tip.closeTip(); }, 150); });
    tip.addEventListener('pointerenter', () => clearTimeout(hideTimer));
    button.addEventListener('focus', show);
    button.addEventListener('blur', () => { if (!pinned) tip.closeTip(); });
    button.addEventListener('click', () => { if (pinned) tip.closeTip(); else { pinned = true; show(); } });
  });
  window.addEventListener('resize', () => closeAll());
  document.addEventListener('scroll', () => closeAll(), true);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeAll(); });
  document.addEventListener('pointerdown', event => { if (!event.target.closest('.training-tip')) closeAll(); });
})();
