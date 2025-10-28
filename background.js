console.log("Lezioni Automation: Background script attivo.");

chrome.runtime.onInstalled.addListener(() => {
  console.log("Estensione installata.");
});
