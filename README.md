# PegasoSkipper

Estensione per browser che automatizza la riproduzione delle lezioni sulla piattaforma Pegaso.

## Descrizione

Questo strumento permette di gestire in modo automatico la visualizzazione dei contenuti didattici su Pegaso. L'estensione monitora lo stato di avanzamento delle lezioni e procede automaticamente a quella successiva quando quella in corso raggiunge il completamento.

## Funzionalità principali

### Navigazione automatica
Il sistema identifica la tab "Lezioni" nella piattaforma e attende il suo caricamento completo prima di iniziare. Una volta individuata, espande automaticamente tutte le sezioni delle lezioni dopo un breve intervallo, permettendo l'accesso completo ai contenuti.

### Gestione degli obiettivi
L'estensione rileva e apre automaticamente tutti gli elementi "Obiettivi" che non sono stati ancora visualizzati. Questa operazione viene eseguita con un meccanismo di retry per garantire che tutti gli elementi vengano processati correttamente, anche in caso di caricamento lento della pagina.

### Filtraggio dei contenuti
Non tutte le voci presenti nella lista vengono considerate come lezioni vere e proprie. Il sistema esclude automaticamente elementi come obiettivi, test di fine lezione e dispense, concentrandosi esclusivamente sui contenuti video didattici.

### Monitoraggio del progresso
Ogni lezione viene monitorata attraverso la lettura della barra di progresso presente nell'interfaccia. Quando il completamento supera il 90%, il sistema procede automaticamente alla lezione successiva. Questo meccanismo evita che vengano saltate lezioni già completate, verificando lo stato prima di ogni transizione.

### Gestione video multipli
Nel caso in cui una singola lezione contenga più video, l'estensione è in grado di riconoscerli e gestirli sequenzialmente, partendo sempre dal primo disponibile quando si accede a una nuova lezione.

### Prevenzione duplicati
Per evitare elaborazioni ripetute della stessa lezione, viene mantenuto un tracciamento dell'ultima lezione processata. Questo garantisce che le azioni vengano eseguite solo quando necessario, ottimizzando le prestazioni e prevenendo comportamenti indesiderati.

## Utilizzo

Una volta installata l'estensione, basta aprire una pagina di lezioni su Pegaso. Il sistema si attiverà automaticamente e gestirà la progressione attraverso i contenuti disponibili senza necessità di intervento manuale.

## Note tecniche

L'estensione utilizza un approccio basato su observer del DOM per rilevare gli elementi della pagina. I controlli vengono eseguiti a intervalli regolari per garantire un funzionamento fluido anche con connessioni lente o pagine con caricamento asincrono.
