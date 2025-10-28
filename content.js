console.log("Video Timer Notifier: Script avviato.");

let notificationSent = false;
let currentInternalVideoIndex = 0;

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
        console.log("Tab 'Lezioni' trovato, avvio espansione...");
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
  // Cerca tutti gli elementi con cursor-pointer che contengono "Obiettivi"
  const tuttiGliElementi = Array.from(document.querySelectorAll('.cursor-pointer'));
  const obiettiviNonAperti = tuttiGliElementi.filter(elemento => {
    const testoObiettivi = elemento.textContent.toLowerCase().includes('obiettivi');
    if (!testoObiettivi) return false;
    
    // Controlla se l'icona è ancora rosa (bg-platform-primary-light) invece di verde
    const iconaNonAperta = elemento.querySelector('.bg-platform-primary-light');
    return iconaNonAperta !== null;
  });
  
  if (obiettiviNonAperti.length > 0) {
    console.log(`Apertura di ${obiettiviNonAperti.length} obiettivi...`);
    obiettiviNonAperti.forEach((obiettivo) => {
      simulaClick(obiettivo);
    });
    console.log("Obiettivi aperti.");
    return true;
  }
  return false;
}

// Cerca e apre gli obiettivi con retry
function cercaEApriObiettivi(tentativi = 0) {
  const maxTentativi = 10;
  
  if (tentativi >= maxTentativi) {
    console.log("Nessun obiettivo da aprire trovato dopo 10 tentativi.");
    return;
  }
  
  const trovati = apriTuttiGliObiettivi();
  
  if (!trovati) {
    // Riprova dopo 1 secondo
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
  
  if (lezioniEspanse > 0) {
    console.log(`Espanse ${lezioniEspanse} lezioni.`);
  }
  
  // Aspetta 2 secondi e poi cerca gli obiettivi con retry
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

// Legge il tempo rimanente usando l'elemento timer
function getRemainingTime() {
  let timeElement = document.querySelector('div[data-v-64af934f]');
  if (!timeElement) return null;
  const timeMatch = timeElement.textContent.match(/\d{2}:\d{2}/);
  return timeMatch ? timeMatch[0].trim() : null;
}

// Controlla il timer per la lezione corrente e gestisce il cambio di video o lezione
function checkVideoTimeForCurrentLesson() {
  let currentTime = getRemainingTime();
  if (!currentTime) return;

  let currentLessonIndex = getActiveLessonIndex();
  let lezioni = getLezioni();
  let currentLesson = lezioni[currentLessonIndex];

  if (currentTime === "00:00" && !notificationSent) {
    console.log("Timer a 00:00. Cambio video/lezione...");
    notificationSent = true;
    let internalVideos = getInternalVideos(currentLesson);
    if (currentInternalVideoIndex < internalVideos.length - 1) {
      currentInternalVideoIndex++;
      simulaClick(internalVideos[currentInternalVideoIndex]);
      console.log("Passaggio al video interno successivo.");
    } else {
      console.log("Passaggio alla prossima lezione...");
      passareAllaProssimaLezione(currentLessonIndex, lezioni);
    }
  } else if (currentTime !== "00:00") {
    notificationSent = false;
  }
}

// Passa alla prossima lezione in base all'indice attuale
function passareAllaProssimaLezione(currentLessonIndex, lezioni) {
  if (currentLessonIndex >= lezioni.length - 1) {
    console.log("Non ci sono altre lezioni.");
    return;
  }
  let prossimaLezione = lezioni[currentLessonIndex + 1];
  console.log("Selezionata lezione:", prossimaLezione.textContent.trim());
  simulaClick(prossimaLezione);
  currentInternalVideoIndex = 0;
  let internalVideos = getInternalVideos(prossimaLezione);
  if (internalVideos.length > 0) {
    setTimeout(() => {
      simulaClick(internalVideos[0]);
      console.log("Avviato il primo video interno della nuova lezione.");
    }, 1000);
  } else {
    console.log("Nessun video interno trovato nella nuova lezione. Continuo...");
  }
}

cercaTabLezioniContinuo();
setInterval(checkVideoTimeForCurrentLesson, 1000);
