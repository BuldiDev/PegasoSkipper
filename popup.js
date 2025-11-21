// Configurazione GitHub
const GITHUB_OWNER = 'BuldiDev';
const GITHUB_REPO = 'PegasoSkipper';
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;

// Mostra la versione corrente
document.getElementById('current-version').textContent = chrome.runtime.getManifest().version;

// Funzione per mostrare messaggi
function showMessage(text, type) {
  const messageEl = document.getElementById('message');
  messageEl.textContent = text;
  messageEl.className = `message ${type}`;
}

// Funzione per verificare e scaricare aggiornamenti
async function checkForUpdates() {
  const updateBtn = document.getElementById('update-btn');
  updateBtn.disabled = true;
  updateBtn.textContent = '⏳ Controllo...';
  
  try {
    // Ottieni l'ultima release da GitHub
    const response = await fetch(GITHUB_API_URL, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (response.status === 404) {
      // Nessuna release trovata
      showMessage('Nessuna release disponibile su GitHub', 'info');
      chrome.tabs.create({ url: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases` });
      return;
    }
    
    if (!response.ok) {
      // Se c'è un errore, apri semplicemente la pagina delle release
      chrome.tabs.create({ url: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases` });
      showMessage('Aperta pagina release GitHub', 'info');
      return;
    }
    
    const release = await response.json();
    
    // Verifica che ci sia un tag_name
    if (!release.tag_name) {
      chrome.tabs.create({ url: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases` });
      showMessage('Aperta pagina release GitHub', 'info');
      return;
    }
    
    const latestVersion = release.tag_name.replace('v', ''); // Rimuovi 'v' se presente
    const currentVersion = chrome.runtime.getManifest().version;
    
    console.log('Versione corrente:', currentVersion);
    console.log('Versione su GitHub:', latestVersion);
    
    // Confronta le versioni
    if (compareVersions(latestVersion, currentVersion) > 0) {
      showMessage(`Nuova versione ${latestVersion} disponibile!`, 'info');
      
      // Trova il file .zip dell'estensione negli assets
      const asset = release.assets.find(a => a.name.endsWith('.zip'));
      
      if (asset) {
        // Apri la pagina di download in una nuova tab
        chrome.tabs.create({ url: asset.browser_download_url });
        showMessage('Download avviato. Installa manualmente l\'estensione.', 'success');
      } else {
        // Se non c'è un file .zip, apri la pagina della release
        chrome.tabs.create({ url: release.html_url });
        showMessage('Aperta pagina release su GitHub', 'info');
      }
    } else {
      showMessage('✓ Hai già l\'ultima versione!', 'success');
    }
    
  } catch (error) {
    console.error('Errore durante il controllo aggiornamenti:', error);
    // In caso di errore, apri semplicemente la pagina delle release
    chrome.tabs.create({ url: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases` });
    showMessage('Aperta pagina release GitHub', 'info');
  } finally {
    updateBtn.disabled = false;
    updateBtn.textContent = '🔄 Verifica Aggiornamenti';
  }
}

// Funzione per confrontare versioni (es: "1.2.0" vs "1.1.0")
function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  
  return 0;
}

// Event listener per il pulsante
document.getElementById('update-btn').addEventListener('click', checkForUpdates);
