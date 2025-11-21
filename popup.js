// Configurazione GitHub
const GITHUB_OWNER = 'BuldiDev';
const GITHUB_REPO = 'PegasoSkipper';
const GITHUB_BRANCH = 'main';
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/commits/${GITHUB_BRANCH}`;
const GITHUB_ZIP_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/archive/refs/heads/${GITHUB_BRANCH}.zip`;

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
    // Ottieni l'ultimo commit da GitHub
    const response = await fetch(GITHUB_API_URL, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!response.ok) {
      // Se c'è un errore, apri semplicemente la pagina del repository
      chrome.tabs.create({ url: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}` });
      showMessage('Aperta pagina GitHub', 'info');
      return;
    }
    
    const commit = await response.json();
    
    if (!commit.sha) {
      chrome.tabs.create({ url: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}` });
      showMessage('Aperta pagina GitHub', 'info');
      return;
    }
    
    // Ottieni l'hash del commit (primi 7 caratteri)
    const latestCommitHash = commit.sha.substring(0, 7);
    const commitDate = new Date(commit.commit.author.date).toLocaleDateString('it-IT');
    const commitMessage = commit.commit.message.split('\n')[0]; // Prima riga del messaggio
    
    console.log('Ultimo commit:', latestCommitHash);
    console.log('Data:', commitDate);
    console.log('Messaggio:', commitMessage);
    
    // Verifica se c'è un nuovo commit controllando localStorage
    const lastKnownCommit = localStorage.getItem('lastCommitHash');
    
    if (lastKnownCommit !== latestCommitHash) {
      showMessage(`Nuovo aggiornamento disponibile! (${commitDate})`, 'info');
      
      // Salva il nuovo commit
      localStorage.setItem('lastCommitHash', latestCommitHash);
      
      // Scarica lo zip del branch
      setTimeout(() => {
        chrome.tabs.create({ url: GITHUB_ZIP_URL });
        showMessage('Download avviato. Estrai e installa l\'estensione.', 'success');
      }, 1000);
    } else {
      showMessage('✓ Hai già l\'ultima versione!', 'success');
    }
    
  } catch (error) {
    console.error('Errore durante il controllo aggiornamenti:', error);
    // In caso di errore, apri semplicemente la pagina del repository
    chrome.tabs.create({ url: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}` });
    showMessage('Aperta pagina GitHub', 'info');
  } finally {
    updateBtn.disabled = false;
    updateBtn.textContent = '🔄 Verifica Aggiornamenti';
  }
}

// Event listener per il pulsante
document.getElementById('update-btn').addEventListener('click', checkForUpdates);
