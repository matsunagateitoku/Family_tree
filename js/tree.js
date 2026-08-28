async function loadAllPeople() {
  const manifest = await fetch('data/manifest.json').then(r => r.json());
  const people = await Promise.all(
    manifest.map(id => fetch(`data/people/${id}.json`).then(r => r.json()))
  );
  const byId = {};
  people.forEach(p => { byId[p.id] = p; });
  return { people, byId };
}

// Compute a generation number for each person: people with no known
// parents in the dataset are generation 0, everyone else is one more
// than the deepest of their parents' generations.
function computeGenerations(people, byId) {
  const gen = {};

  function resolve(id, seen = new Set()) {
    if (gen[id] !== undefined) return gen[id];
    if (seen.has(id)) return 0; // guard against accidental cycles
    seen.add(id);

    const person = byId[id];
    const knownParents = (person.parents || []).filter(pid => byId[pid]);
    if (knownParents.length === 0) {
      gen[id] = 0;
    } else {
      gen[id] = 1 + Math.max(...knownParents.map(pid => resolve(pid, seen)));
    }
    return gen[id];
  }

  people.forEach(p => resolve(p.id));
  return gen;
}

function yearOf(dateStr) {
  return dateStr ? dateStr.split('-')[0] : '';
}

function personCardHTML(person) {
  const years = `${yearOf(person.birth)}${person.death ? ' \u2013 ' + yearOf(person.death) : person.birth ? ' \u2013 present' : ''}`;
  const photo = person.photo || '';
  return `
    <a class="person-card" href="person.html?id=${encodeURIComponent(person.id)}">
      <img src="${photo}" alt="${person.name}" onerror="this.style.visibility='hidden'">
      <span class="name">${person.name}</span>
      <span class="years">${years}</span>
    </a>
  `;
}

async function renderTree() {
  const container = document.getElementById('tree-container');
  try {
    const { people, byId } = await loadAllPeople();
    const gen = computeGenerations(people, byId);

    const maxGen = Math.max(...Object.values(gen));
    let html = '';
    for (let g = 0; g <= maxGen; g++) {
      const inGen = people
        .filter(p => gen[p.id] === g)
        .sort((a, b) => (a.birth || '').localeCompare(b.birth || ''));
      if (inGen.length === 0) continue;
      html += `
        <section class="generation">
          <h2>Generation ${g + 1}</h2>
          <div class="card-grid">
            ${inGen.map(personCardHTML).join('')}
          </div>
        </section>
      `;
    }
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<p>Could not load family data: ${err.message}</p>`;
    console.error(err);
  }
}

renderTree();
