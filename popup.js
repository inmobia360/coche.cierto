const defaults = { maxKm: 220000, maxAge: 15 }; const km = document.querySelector('#maxKm'); const age = document.querySelector('#maxAge'); const status = document.querySelector('#status');
chrome.storage.sync.get(defaults).then((v) => { km.value = v.maxKm; age.value = v.maxAge; });
document.querySelector('#save').onclick = async () => { await chrome.storage.sync.set({ maxKm: Number(km.value) || defaults.maxKm, maxAge: Number(age.value) || defaults.maxAge }); status.textContent = 'Guardado. Recarga Auto1.'; };
