/* ═══════════════════════════════════════════════════════════
   THEME.JS — Gestion du Mode Clair / Sombre
═══════════════════════════════════════════════════════════ */

const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const themeText = document.getElementById('themeText');

// 1. On vérifie s'il y a déjà un thème sauvegardé dans le navigateur
const savedTheme = localStorage.getItem('helpdev-theme');
if (savedTheme) {
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateButtonUI(savedTheme);
}

// 2. Quand on clique sur le bouton
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    // On regarde le thème actuel
    const currentTheme = document.documentElement.getAttribute('data-theme');
    
    // On bascule vers l'autre
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // On applique le nouveau thème sur la balise <html>
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // On sauvegarde ce choix dans le navigateur
    localStorage.setItem('helpdev-theme', newTheme);
    
    // On met à jour le texte et l'icône du bouton
    updateButtonUI(newTheme);
  });
}

// 3. Fonction pour changer l'apparence du bouton
function updateButtonUI(theme) {
  if (!themeToggle) return;
  
  if (theme === 'light') {
    themeIcon.textContent = '☾'; // Lune
    themeText.textContent = 'Mode Sombre';
  } else {
    themeIcon.textContent = '☼'; // Soleil
    themeText.textContent = 'Mode Clair';
  }
}