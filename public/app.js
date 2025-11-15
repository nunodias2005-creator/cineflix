let movies = [];
let heroMovie = null;
let vjsInstance = null;

async function loadMovies() {
  const res = await fetch('/api/movies');
  movies = await res.json();

  if (!Array.isArray(movies) || movies.length === 0) {
    document.getElementById('row-trending').innerHTML =
      '<p>Aucun film pour le moment. Connecte-toi à ton admin ou vérifie MongoDB.</p>';
    return;
  }

  // choix du film hero : le premier
  heroMovie = movies[0];
  renderHero(heroMovie);

  // répartir les films dans 3 rangées (fake logique Netflix)
  renderRow('row-trending', movies);
  renderRow('row-new', movies.slice().reverse());
  renderRow('row-reco', shuffle([...movies]));
}

function renderHero(movie) {
  const hero = document.getElementById('hero');
  hero.style.backgroundImage = `url('${movie.poster || '/assets/placeholder.jpg'}')`;

  document.getElementById('hero-title').textContent = movie.title;
  document.getElementById('hero-desc').textContent =
    movie.description || 'Film démo fictif.';

  const btn = document.getElementById('hero-watch');
  btn.onclick = () => openViewer(movie);
}

function renderRow(rowId, items) {
  const row = document.getElementById(rowId);
  row.innerHTML = items
    .map(
      (m) => `
    <div class="card" onclick="openViewerById('${m._id}')">
      <img src="${m.poster || '/assets/placeholder.jpg'}" alt="${m.title}">
      <div class="card-body">
        <div class="card-title">${m.title}</div>
        <div class="card-meta">${m.year || ''}</div>
      </div>
    </div>
  `
    )
    .join('');
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

window.openViewerById = function (id) {
  const m = movies.find((x) => x._id === id);
  if (m) openViewer(m);
};

function openViewer(movie) {
  const modal = document.getElementById('viewer');
  const title = document.getElementById('vTitle');
  const desc = document.getElementById('vDesc');
  const video = document.getElementById('vPlayer');

  title.textContent = movie.title;
  desc.textContent = movie.description || '';

  if (vjsInstance) {
    vjsInstance.dispose();
    vjsInstance = null;
  }

  video.innerHTML = '';
  if (movie.sources && movie.sources.length > 0) {
    const source = document.createElement('source');
    source.src = movie.sources[0].src;
    source.type = movie.sources[0].type || 'video/mp4';
    video.appendChild(source);
  }

  vjsInstance = videojs('vPlayer', { controls: true, autoplay: false, preload: 'auto' });

  modal.classList.remove('hidden');
}

document.getElementById('closeViewer').addEventListener('click', () => {
  const modal = document.getElementById('viewer');
  modal.classList.add('hidden');
  if (vjsInstance) {
    vjsInstance.dispose();
    vjsInstance = null;
  }
});

loadMovies();
