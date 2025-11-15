async function loadCatalog(){
  const res = await fetch('/api/movies');
  const movies = await res.json();
  const grid = document.getElementById('catalog');
  if (!movies.length) {
    grid.innerHTML = '<p>Aucun film pour le moment. Connecte-toi en admin pour en ajouter.</p>';
    return;
  }
  grid.innerHTML = movies.map(m => `
    <div class="card" data-id="${m._id}">
      <img src="${m.poster || '/assets/placeholder.jpg'}" />
      <h3>${m.title}</h3>
      <p>${m.year || ''}</p>
      <button class="playBtn" onclick="openViewer('${m._id}')">Regarder</button>
    </div>
  `).join('');
}

async function openViewer(id){
  const res = await fetch('/api/movies/' + id);
  const m = await res.json();
  document.getElementById('vTitle').innerText = m.title;
  document.getElementById('vDesc').innerText = m.description || '';
  const player = document.getElementById('vPlayer');
  player.innerHTML = `<source src="${m.sources[0].src}" type="${m.sources[0].type}">`;
  if (window.vjs) window.vjs.dispose();
  window.vjs = videojs('vPlayer');
  document.getElementById('viewer').classList.remove('hidden');
}

document.getElementById('closeViewer').addEventListener('click', ()=> {
  if (window.vjs) { window.vjs.dispose(); window.vjs = null; }
  document.getElementById('viewer').classList.add('hidden');
});

loadCatalog();
