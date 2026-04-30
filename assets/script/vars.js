/* ═══════════════════════════════════════════════════════════
   VARS.JS — Recherche, Filtres et Copie des Snippets
═══════════════════════════════════════════════════════════ */

/* 1. RECHERCHE ET FILTRES */
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.cmd-filter');
const sections = document.querySelectorAll('.cmd-section');
const resultCount = document.getElementById('resultCount');
const activeFilterLabel = document.getElementById('activeFilter');
const heroCount = document.getElementById('heroCount');

let currentFilter = 'all';

function updateDisplay() {
  const term = searchInput.value.toLowerCase().trim();
  let visibleCount = 0;

  sections.forEach((section) => {
    const sectionCategory = section.dataset.category;
    const sectionAllowed = currentFilter === 'all' || currentFilter === sectionCategory;
    let sectionHasVisibleCard = false;

    const cards = section.querySelectorAll('.cmd-card');

    cards.forEach((card) => {
      const searchData = card.dataset.search || '';
      const haystack = (searchData + ' ' + card.innerText).toLowerCase();
      const matchesSearch = term === '' || haystack.includes(term);
      const visible = sectionAllowed && matchesSearch;

      card.style.display = visible ? 'flex' : 'none';

      if (visible) {
        visibleCount++;
        sectionHasVisibleCard = true;
      }
    });

    section.style.display = sectionHasVisibleCard ? 'block' : 'none';
  });

  if (resultCount) resultCount.textContent = `${visibleCount} snippets`;
  if (heroCount) heroCount.textContent = visibleCount;
  if (activeFilterLabel) activeFilterLabel.textContent = `Filtre: ${currentFilter === 'all' ? 'TOUS' : currentFilter.toUpperCase()}`;
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    filterButtons.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');
    currentFilter = button.dataset.filter;
    updateDisplay();
  });
});

if (searchInput) {
  searchInput.addEventListener('input', updateDisplay);
}
updateDisplay();

/* 2. FONCTION COPIER */
const copyButtons = document.querySelectorAll('.copy-btn');
copyButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const pre = btn.parentElement.querySelector('pre');
    if (!pre) return;
    
    navigator.clipboard.writeText(pre.innerText).then(() => {
      const originalText = btn.innerText;
      btn.innerText = 'Copié ✓';
      btn.style.color = 'var(--green)';
      btn.style.borderColor = 'var(--green)';
      
      setTimeout(() => {
        btn.innerText = originalText;
        btn.style.color = '';
        btn.style.borderColor = '';
      }, 2000);
    });
  });
});