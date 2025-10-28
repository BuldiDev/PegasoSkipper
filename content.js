let notificationSent = false;
let currentInternalVideoIndex = 0;
let lastProcessedLessonIndex = -1; // Tiene traccia dell'ultima lezione processata

// Simula un clic su un elemento
function simulaClick(elemento) {
  if (!elemento) return;
  const event = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true
  });
  elemento.dispatchEvent(event);
}

// Restituisce tutte le lezioni escludendo quelle indesiderate
function getLezioni() {
  let tutteLezioni = Array.from(document.querySelectorAll('div[data-v-839a3bcc].cursor-pointer'));
  return tutteLezioni.filter(lezione => {
    let testo = lezione.textContent.trim().toLowerCase();
    return !testo.includes("obiettivi") &&
           !testo.includes("test di fine lezione") &&
           !testo.includes("dispensa");
  });
}

// Determina l'indice della lezione attiva leggendo il cursore già presente nel DOM
function getActiveLessonIndex() {
  const lezioni = getLezioni();
  for (let i = 0; i < lezioni.length; i++) {
    if (lezioni[i].querySelector('div[data-v-839a3bcc].visible.bg-platform-primary.rounded-r-lg.w-2.h-11.mr-2')) {
      return i;
    }
  }
  return 0;
}

// Cerca "Lezioni" in un ciclo finché non lo trova e poi espande le lezioni
function cercaTabLezioniContinuo() {
  const intervalId = setInterval(() => {
    const elementi = Array.from(document.querySelectorAll('div.align-left.flex.items-center.h-full.leading-normal.font-medium'));
    for (const elemento of elementi) {
      if (elemento.textContent.toLowerCase().includes("lezioni")) {
        setTimeout(() => {
          espandiTutteLezioni();
        }, 5000);
        clearInterval(intervalId);
        return;
      }
    }
  }, 1000);
}

// Apre tutti gli obiettivi non ancora visualizzati
function apriTuttiGliObiettivi() {
  const tuttiGliElementi = Array.from(document.querySelectorAll('.cursor-pointer'));
  const obiettiviNonAperti = tuttiGliElementi.filter(elemento => {
    const testoObiettivi = elemento.textContent.toLowerCase().includes('obiettivi');
    if (!testoObiettivi) return false;
    
    const iconaNonAperta = elemento.querySelector('.bg-platform-primary-light');
    return iconaNonAperta !== null;
  });
  
  if (obiettiviNonAperti.length > 0) {
    obiettiviNonAperti.forEach((obiettivo) => {
      simulaClick(obiettivo);
    });
    return true;
  }
  return false;
}

// Cerca e apre gli obiettivi con retry
function cercaEApriObiettivi(tentativi = 0) {
  const maxTentativi = 10;
  
  if (tentativi >= maxTentativi) {
    return;
  }
  
  const trovati = apriTuttiGliObiettivi();
  
  if (!trovati) {
    setTimeout(() => {
      cercaEApriObiettivi(tentativi + 1);
    }, 1000);
  }
}

// Espande tutte le lezioni, escludendo il tab "Lezioni"
function espandiTutteLezioni() {
  let lezioniDaEspandere = Array.from(
    document.querySelectorAll('div.align-left.flex.items-center.h-full.leading-normal.font-medium')
  ).filter((lezione) => !lezione.textContent.toLowerCase().includes("lezioni"));

  if (lezioniDaEspandere.length === 0) return;

  let lezioniEspanse = 0;
  lezioniDaEspandere.forEach((lezione) => {
    const containerPadre = lezione.closest('.flex.align-middle.leading-none.px-4');
    if (!containerPadre) return;
    
    const clickableParent = containerPadre.parentElement;
    const nextSibling = clickableParent ? clickableParent.nextElementSibling : null;
    const isExpanded = nextSibling && nextSibling.querySelector('[data-v-839a3bcc].border-t.text-platform-text');
    
    if (!isExpanded) {
      simulaClick(lezione);
      lezioniEspanse++;
    }
  });
  
  setTimeout(() => {
    cercaEApriObiettivi();
  }, 2000);
}

// Ottiene i video interni all'interno di una lezione
function getInternalVideos(lessonElement) {
  let videos = Array.from(lessonElement.querySelectorAll('video'));
  if (videos.length === 0) {
    videos = Array.from(lessonElement.querySelectorAll('source[data-v-64af934f]'));
  }
  return videos;
}

// Legge la percentuale di completamento dalla barra di progresso della lezione
function getLessonProgress(lessonElement) {
  if (!lessonElement) return 0;
  
  const progressBar = lessonElement.querySelector('.absolute.h-1\\.5.rounded-full.bg-platform-green, .absolute.h-1\\.5.rounded-full.bg-platform-primary');
  if (!progressBar) return 0;
  
  const widthStyle = progressBar.style.width;
  if (!widthStyle) return 0;
  
  const percentMatch = widthStyle.match(/(\d+(?:\.\d+)?)%/);
  if (percentMatch) {
    return parseFloat(percentMatch[1]);
  }
  
  return 0;
}

// Controlla la percentuale di completamento per la lezione corrente
function checkVideoTimeForCurrentLesson() {
  let currentLessonIndex = getActiveLessonIndex();
  let lezioni = getLezioni();
  
  if (!lezioni || lezioni.length === 0) return;
  if (currentLessonIndex < 0 || currentLessonIndex >= lezioni.length) return;
  
  let currentLesson = lezioni[currentLessonIndex];
  if (!currentLesson) return;
  
  let progressPercentage = getLessonProgress(currentLesson);
  
  // Se la lezione è cambiata, resetta lo stato
  if (currentLessonIndex !== lastProcessedLessonIndex) {
    notificationSent = false;
    lastProcessedLessonIndex = currentLessonIndex;
  }
  
  // Controlla se la lezione corrente è completata e non è ancora stata processata
  if (progressPercentage > 90 && !notificationSent) {
    notificationSent = true;
    passareAllaProssimaLezione(currentLessonIndex, lezioni);
  }
}

// Passa alla prossima lezione in base all'indice attuale
function passareAllaProssimaLezione(currentLessonIndex, lezioni) {
  if (!lezioni || lezioni.length === 0) {
    return;
  }
  
  if (currentLessonIndex >= lezioni.length - 1) {
    return;
  }
  
  let prossimaLezione = lezioni[currentLessonIndex + 1];
  if (!prossimaLezione) {
    return;
  }
  
  simulaClick(prossimaLezione);
  currentInternalVideoIndex = 0;
  notificationSent = false;
  
  setTimeout(() => {
    let progressPercentage = getLessonProgress(prossimaLezione);
    if (progressPercentage > 90) {
      passareAllaProssimaLezione(currentLessonIndex + 1, lezioni);
    } else {
      lastProcessedLessonIndex = currentLessonIndex + 1;
      let internalVideos = getInternalVideos(prossimaLezione);
      if (internalVideos.length > 0) {
        simulaClick(internalVideos[0]);
      }
    }
  }, 1500);
}

cercaTabLezioniContinuo();

setTimeout(() => {
  setInterval(checkVideoTimeForCurrentLesson, 1000);
}, 10000);
