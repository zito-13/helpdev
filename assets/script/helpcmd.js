/* ═══════════════════════════════════════════════════════════
HELPCMD.JS — HELPDEV Commandes
═══════════════════════════════════════════════════════════ */

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

      card.style.display = visible ? 'block' : 'none';

      if (visible) {
        visibleCount++;
        sectionHasVisibleCard = true;
      }
    });

    section.style.display = sectionHasVisibleCard ? 'block' : 'block';
    if (!sectionHasVisibleCard) {
      section.style.display = 'none';
    }
  });

  resultCount.textContent = `${visibleCount} blocs`;
  heroCount.textContent = visibleCount;
  activeFilterLabel.textContent = `Filtre: ${currentFilter === 'all' ? 'TOUS' : currentFilter.toUpperCase()}`;
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    filterButtons.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');
    currentFilter = button.dataset.filter;
    updateDisplay();
  });
});

searchInput.addEventListener('input', updateDisplay);

updateDisplay();