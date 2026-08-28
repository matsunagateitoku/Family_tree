function yearOf(dateStr) {
  return dateStr ? dateStr.split('-')[0] : '';
}

function relationLinks(ids, byId) {
  if (!ids || ids.length === 0) return '<span>&mdash;</span>';
  return ids
    .map(id => {
      const p = byId[id];
      const label = p ? p.name : id;
      return `<a href="person.html?id=${encodeURIComponent(id)}">${label}</a>`;
    })
    .join(', ');
}

async function renderPerson() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const container = document.getElementById('person-container');

  if (!id) {
    container.innerHTML = '<p>No person specified.</p>';
    return;
  }

  try {
    const manifest = await fetch('data/manifest.json').then(r => r.json());
    const people = await Promise.all(
      manifest.map(pid => fetch(`data/people/${pid}.json`).then(r => r.json()))
    );
    const byId = {};
    people.forEach(p => { byId[p.id] = p; });

    const person = byId[id];
    if (!person) {
      container.innerHTML = '<p>Person not found.</p>';
      return;
    }

    document.title = `${person.name} \u2014 Family Tree`;

    const years = `${person.birth ? new Date(person.birth).toLocaleDateString(undefined, {year:'numeric', month:'long', day:'numeric'}) : 'unknown'}${person.death ? ' \u2013 ' + new Date(person.death).toLocaleDateString(undefined, {year:'numeric', month:'long', day:'numeric'}) : ''}`;

    const storiesHTML = (person.stories && person.stories.length)
      ? `<div class="stories"><h2>Stories</h2><ul>${person.stories.map(s => `<li>${s}</li>`).join('')}</ul></div>`
      : '';

    container.innerHTML = `
      <a class="back-link" href="index.html">&larr; Back to tree</a>
      <div class="profile">
        <div>
          <img class="portrait" src="${person.photo || ''}" alt="${person.name}" onerror="this.style.visibility='hidden'">
        </div>
        <div>
          <h1>${person.name}</h1>
          <div class="meta">${years}${person.birthplace ? ' &middot; ' + person.birthplace : ''}</div>
          <p>${person.bio || ''}</p>

          <dl class="relations">
            <dt>Parents</dt>
            <dd>${relationLinks(person.parents, byId)}</dd>
            <dt>Spouse(s)</dt>
            <dd>${relationLinks(person.spouses, byId)}</dd>
            <dt>Children</dt>
            <dd>${relationLinks(person.children, byId)}</dd>
          </dl>

          ${storiesHTML}
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<p>Could not load this person: ${err.message}</p>`;
    console.error(err);
  }
}

renderPerson();
