// ============================================
// PegasoSkipper - Versione Semplificata
// ============================================

let currentLessonIndex = -1;
let allLessons = [];
let isInitialized = false;

// Simula un clic su un elemento
function click(elemento) {
  if (!elemento) return;
  elemento.dispatchEvent(new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true
  }));
}

// Legge il progresso di una lezione (0-100)
function getProgress(lessonElement) {
  if (!lessonElement) return 0;
  
  const progressBar = lessonElement.querySelector('.absolute.h-1\\.5.rounded-full.bg-platform-green, .absolute.h-1\\.5.rounded-full.bg-platform-primary');
  if (!progressBar) return 0;
  
  const width = progressBar.style.width;
  if (!width) return 0;
  
  const match = width.match(/(\d+(?:\.\d+)?)%/);
  return match ? parseFloat(match[1]) : 0;
}

// Ottiene tutte le lezioni filtrate
function getAllLessons() {
  const all = Array.from(document.querySelectorAll('div[data-v-839a3bcc].cursor-pointer'));
  return all.filter(lesson => {
    const text = lesson.textContent.trim().toLowerCase();
    return !text.includes("obiettivi") &&
           !text.includes("test di fine lezione") &&
           !text.includes("dispensa");
  });
}

// Trova la prima lezione non completata
function findFirstIncompleteLesson() {
  allLessons = getAllLessons();
  
  console.log('[PegasoSkipper] 📊 Analisi lezioni:');
  console.log('[PegasoSkipper] Totale lezioni:', allLessons.length);
  
  for (let i = 0; i < allLessons.length; i++) {
    const progress = getProgress(allLessons[i]);
    if (progress < 100) {
      console.log('[PegasoSkipper] ✅ Trovata lezione', i + 1, 'con progresso', progress + '%');
      return i;
    }
  }
  
  console.log('[PegasoSkipper] 🎉 Tutte le lezioni completate!');
  return -1;
}

// Apre una lezione specifica
function openLesson(index) {
  if (index < 0 || index >= allLessons.length) {
    console.log('[PegasoSkipper] ❌ Indice lezione non valido:', index);
    return;
  }
  
  const lesson = allLessons[index];
  console.log('[PegasoSkipper] 📖 Apertura lezione', index + 1);
  
  click(lesson);
  currentLessonIndex = index;
  
  // Aspetta e cerca di avviare il video
  setTimeout(() => {
    const videos = lesson.querySelectorAll('video, source[data-v-64af934f]');
    if (videos.length > 0) {
      console.log('[PegasoSkipper] ▶️ Avvio video');
      click(videos[0]);
    }
  }, 2000);
}

// Monitora il progresso della lezione corrente
function monitorCurrentLesson() {
  if (currentLessonIndex < 0) return;
  
  // Ricarica la lista (potrebbe essere cambiata)
  allLessons = getAllLessons();
  
  if (currentLessonIndex >= allLessons.length) {
    console.log('[PegasoSkipper] ⚠️ Lezione corrente non più disponibile');
    currentLessonIndex = -1;
    return;
  }
  
  const lesson = allLessons[currentLessonIndex];
  const progress = getProgress(lesson);
  
  // Quando raggiunge 100%, passa alla prossima
  if (progress >= 100) {
    console.log('[PegasoSkipper] ✅ Lezione', currentLessonIndex + 1, 'completata!');
    
    // Cerca la prossima lezione non completata
    const nextIndex = findFirstIncompleteLesson();
    
    if (nextIndex === -1) {
      console.log('[PegasoSkipper] 🎊 Corso completato!');
      currentLessonIndex = -1;
      return;
    }
    
    // Apri la prossima lezione dopo un breve delay
    setTimeout(() => {
      openLesson(nextIndex);
    }, 2000);
  }
}

// Espande tutte le sezioni
function expandAllSections() {
  console.log('[PegasoSkipper] 🔄 Espansione sezioni...');
  
  const sections = Array.from(
    document.querySelectorAll('div.align-left.flex.items-center.h-full.leading-normal.font-medium')
  ).filter(s => !s.textContent.toLowerCase().includes("lezioni"));
  
  let expanded = 0;
  sections.forEach(section => {
    const container = section.closest('.flex.align-middle.leading-none.px-4');
    if (!container) return;
    
    const parent = container.parentElement;
    const next = parent ? parent.nextElementSibling : null;
    const isExpanded = next && next.querySelector('[data-v-839a3bcc].border-t.text-platform-text');
    
    if (!isExpanded) {
      click(section);
      expanded++;
    }
  });
  
  console.log('[PegasoSkipper] ✅ Espanse', expanded, 'sezioni');
}

// Apre tutti gli obiettivi
function openObjectives() {
  const objectives = Array.from(document.querySelectorAll('.cursor-pointer')).filter(el => {
    return el.textContent.toLowerCase().includes('obiettivi') &&
           el.querySelector('.bg-platform-primary-light');
  });
  
  objectives.forEach(obj => click(obj));
  
  if (objectives.length > 0) {
    console.log('[PegasoSkipper] 🎯 Aperti', objectives.length, 'obiettivi');
  }
}

// Inizializza il sistema
function initialize() {
  if (isInitialized) return;
  
  console.log('[PegasoSkipper] 🚀 Inizializzazione...');
  
  // Step 1: Espandi sezioni
  expandAllSections();
  
  // Step 2: Apri obiettivi (dopo 2 secondi)
  setTimeout(() => {
    openObjectives();
    
    // Step 3: Trova e apri prima lezione (dopo altri 3 secondi)
    setTimeout(() => {
      const firstIncomplete = findFirstIncompleteLesson();
      
      if (firstIncomplete !== -1) {
        openLesson(firstIncomplete);
        
        // Step 4: Avvia monitoraggio (dopo 5 secondi)
        setTimeout(() => {
          console.log('[PegasoSkipper] 👀 Monitoraggio attivo');
          setInterval(monitorCurrentLesson, 2000); // Controlla ogni 2 secondi
          isInitialized = true;
        }, 5000);
      }
    }, 3000);
  }, 2000);
}

// Cerca il tab "Lezioni" e inizia
function findLessonsTab() {
  console.log('[PegasoSkipper] 🔍 Ricerca tab Lezioni...');
  
  const checkInterval = setInterval(() => {
    const tabs = Array.from(
      document.querySelectorAll('div.align-left.flex.items-center.h-full.leading-normal.font-medium')
    );
    
    for (const tab of tabs) {
      if (tab.textContent.toLowerCase().includes("lezioni")) {
        console.log('[PegasoSkipper] ✅ Tab Lezioni trovato!');
        clearInterval(checkInterval);
        
        // Inizia dopo 5 secondi
        setTimeout(() => {
          initialize();
        }, 5000);
        
        return;
      }
    }
  }, 1000);
}

// Avvia tutto
findLessonsTab();
