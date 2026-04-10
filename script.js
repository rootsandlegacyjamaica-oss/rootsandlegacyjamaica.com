
document.addEventListener('click', (e) => {
  const btn = document.querySelector('[data-mobile-toggle]');
  const menu = document.querySelector('[data-mobile-links]');
  if (btn && btn.contains(e.target)) menu.classList.toggle('open');
});
