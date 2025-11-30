// ============================================
// PegasoSkipper - Versione Semplificata
// ============================================

// Configurazione Selettori DOM
const SELECTORS = {
  // Contenitori principali
  lessonContainer: 'div[data-v-5c42503f].cursor-pointer',
  sectionContainer: 'div.align-left.flex.items-center.h-full.leading-normal.font-medium',
  lessonsStructure: 'div[data-v-5c42503f].flex.flex-col',
  
  // Progresso lezione
  progressText: '.w-1\\/12.text-xs',
  progressBar: '.absolute.h-1\\.5.rounded-full.bg-platform-primary',
  progressBarGreen: '.absolute.h-1\\.5.rounded-full.bg-platform-green',
  
  // Video
  videoElements: 'video, source[data-v-64af934f]',
  
  // Elementi da filtrare
  objectivesIcon: '.bg-platform-primary-light',
  
  // Sezioni e tab
  sectionHeader: '.flex.align-middle.leading-none.px-4',
  expandedContent: '[data-v-5c42503f].border-t.text-platform-text'
};

// Parole chiave da escludere/includere
const KEYWORDS = {
  exclude: ['obiettivi', 'test di fine lezione', 'dispensa'],
  lessonsTab: 'lezioni'
};

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
  
  // Prova a leggere dal testo "100%" (più affidabile)
  const progressText = lessonElement.querySelector(SELECTORS.progressText);
  if (progressText) {
    const textMatch = progressText.textContent.match(/(\d+(?:\.\d+)?)%/);
    if (textMatch) {
      return parseFloat(textMatch[1]);
    }
  }
  
  // Fallback: leggi dalla barra di progresso (verde per completate)
  const progressBarGreen = lessonElement.querySelector(SELECTORS.progressBarGreen);
  if (progressBarGreen) {
    const width = progressBarGreen.style.width;
    if (width) {
      const match = width.match(/(\d+(?:\.\d+)?)%/);
      if (match) return parseFloat(match[1]);
    }
  }
  
  // Fallback: leggi dalla barra di progresso (primaria)
  const progressBar = lessonElement.querySelector(SELECTORS.progressBar);
  if (progressBar) {
    const width = progressBar.style.width;
    if (width) {
      const match = width.match(/(\d+(?:\.\d+)?)%/);
      if (match) return parseFloat(match[1]);
    }
  }
  
  return 0;
}

// Ottiene tutte le lezioni filtrate
function getAllLessons() {
  const all = Array.from(document.querySelectorAll(SELECTORS.lessonContainer));
  return all.filter(lesson => {
    const text = lesson.textContent.trim().toLowerCase();
    return !KEYWORDS.exclude.some(keyword => text.includes(keyword));
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
    const videos = lesson.querySelectorAll(SELECTORS.videoElements);
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
    document.querySelectorAll(SELECTORS.sectionContainer)
  ).filter(s => !s.textContent.toLowerCase().includes(KEYWORDS.lessonsTab));
  
  let expanded = 0;
  sections.forEach(section => {
    const container = section.closest(SELECTORS.sectionHeader);
    if (!container) return;
    
    const parent = container.parentElement;
    const next = parent ? parent.nextElementSibling : null;
    const isExpanded = next && next.querySelector(SELECTORS.expandedContent);
    
    if (!isExpanded) {
      click(section);
      expanded++;
    }
  });
  
  console.log('[PegasoSkipper] ✅ Espanse', expanded, 'sezioni');
}

// Apre tutti gli obiettivi
function openObjectives() {
  const objectives = Array.from(document.querySelectorAll(SELECTORS.lessonContainer)).filter(el => {
    return el.textContent.toLowerCase().includes('obiettivi') &&
           el.querySelector(SELECTORS.objectivesIcon);
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

// Cerca la struttura delle lezioni e inizia
function findLessonsTab() {
  console.log('[PegasoSkipper] 🔍 Ricerca struttura lezioni...');
  
  const checkInterval = setInterval(() => {
    // Cerca il contenitore principale delle lezioni
    const lessonsStructure = document.querySelector(SELECTORS.lessonsStructure);
    
    if (lessonsStructure) {
      // Verifica che contenga effettivamente delle lezioni
      const lessons = lessonsStructure.querySelectorAll(SELECTORS.lessonContainer);
      
      if (lessons.length > 0) {
        console.log('[PegasoSkipper] ✅ Struttura lezioni trovata! (' + lessons.length + ' elementi)');
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
