const data = window.ARCHIVE;
const root = document.getElementById('main');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
const link = (url, label) => url && /^https:\/\//.test(url) ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>` : '';
const ev = id => data.events.find(e => e.id === id);
const eventVisuals = {
  massacre: {file: 'barbershop.jpg', alt: 'The interior of Alonzo Herndon’s barbershop in 1903', type: 'An archival view', caption: 'Herndon’s barbershop, 1903. A place of work and ambition, photographed before the 1906 violence.', credit: 'Kenan Research Center · Digital Library of Georgia', url: 'https://dlg.usg.edu/record/geh_athpc_1190'},
  children: {file: 'remembrance.svg', alt: 'An original remembrance illustration of a candle surrounded by seven points of light', type: 'A space for remembrance', caption: 'A light for the young lives remembered here. Each point in this chapter opens an individual story.', credit: 'Original commemorative illustration'},
  civil: {file: 'selma.jpg', alt: 'Civil rights marchers on the Selma to Montgomery march in 1965', type: 'An archival view', caption: 'Selma to Montgomery, 1965. The broader voting-rights march, photographed after Bloody Sunday.', credit: 'Peter Pettus · Library of Congress, via National Park Service', url: 'https://home.nps.gov/articles/selmatomongtomerymarch.htm'}
};
function eventArt(e) {
  const visual = eventVisuals[e.id];
  const visualIndex = e.visuals.findIndex(item => item.file === visual.file);
  return `<figure class="event-visual ${e.id === 'children' ? 'illustrated-event' : 'archival-event'}"><button class="event-image-frame" data-visual-event="${esc(e.id)}" data-visual-index="${visualIndex}" aria-label="Enlarge image: ${esc(visual.alt)}" aria-haspopup="dialog"><span class="visual-corner-label">${esc(visual.type)}</span><img src="assets/${visual.file}" alt="${esc(visual.alt)}" fetchpriority="high"><span class="visual-orbit" aria-hidden="true"></span></button><figcaption><p>${esc(visual.caption)}</p><span>${visual.url ? link(visual.url, visual.credit + ' ↗') : esc(visual.credit)}</span></figcaption></figure>`;
}
const pic = p => `<div class="portrait">${p.image ? `<img src="assets/${encodeURIComponent(p.image)}" alt="Portrait of ${esc(p.name)}" loading="lazy">` : `<span aria-hidden="true">${esc(p.name.split(' ').map(s => s[0]).slice(0, 2).join(''))}</span>`}</div>`;
const sourceName = source => source.tag || source.author || source.organization || source.name.split(' — ')[0];
const citation = source => source ? `<span class="citation">(${source.url ? link(source.url, sourceName(source)) : esc(sourceName(source))})</span>` : '';
const findSource = (url, list = []) => list.find(s => s.url === url) || data.sources.find(s => s.url === url);
function cited(text, source, extra = []) {
  if (!text) return '';
  const sentences = new Intl.Segmenter('en', {granularity: 'sentence'}).segment(text);
  const parts = [...sentences];
  return parts.map((part, index) => {
    const sentence = part.segment.trim();
    const needsTag = index === parts.length - 1 || /\d|\b(one|two|three|four|five|six|seven|eight|nine|ten|first|only|differ|disagree)\b|[“”"]/iu.test(sentence);
    return `${esc(sentence)}${needsTag ? ` ${citation(source)} ${extra.map(citation).join(' ')}` : ''}`;
  }).join(' ');
}
function sources(list, note = '') {
  const unique = [...new Map(list.filter(Boolean).map(s => [s.url || s.name, s])).values()];
  return `<section class="sources" aria-labelledby="sources-title"><h2 id="sources-title">Sources</h2><ul>${unique.map(s => `<li>${esc(s.author || s.organization || sourceName(s))}. ${s.type === 'book' ? `<em>${esc(s.title)}</em>` : esc(s.title || s.name.split(' — ').slice(1).join(' — ') || s.name)}. ${esc(s.site || '')}${s.year ? `, ${esc(s.year)}` : ''}${s.url ? ` · ${link(s.url, 'Read source ↗')}` : ''}</li>`).join('')}</ul>${note ? `<p>${esc(note)}</p>` : ''}</section>`;
}
const editorialMeta = () => `<div class="editorial-meta"><p>Prepared for Group C2: Grant, Matthew, Pranavkrishna (Krishna), Lucas · LMC 3403 · Fall 2026</p><p>Last updated: <time datetime="2026-11-17">November 17, 2026</time></p></div>`;
const timeline = e => e.timeline?.length ? `<section class="event-timeline" aria-label="${esc(e.title)} timeline"><div class="eyebrow">Follow the history</div><h2>A few defining moments</h2><ol>${e.timeline.map(t => `<li><div class="eyebrow">${esc(t.date)}</div><h3>${esc(t.title)}</h3><p>${cited(t.text, findSource(t.url, e.sources))}</p></li>`).join('')}</ol></section>` : '';

function visualFigure(visual, eventId, index, className = '') {
  return `<figure class="archive-figure ${className}"><button class="archive-image ${visual.fit === 'contain' ? 'image-contained' : ''}" data-visual-event="${esc(eventId)}" data-visual-index="${index}" aria-label="Enlarge image: ${esc(visual.title)}" aria-haspopup="dialog" aria-controls="image-dialog"><img src="assets/${encodeURIComponent(visual.file)}" alt="${esc(visual.alt)}" loading="lazy" style="object-position:${esc(visual.position || 'center')}"><span class="image-type">${esc(visual.type || 'From the archive')}</span><span class="image-expand" aria-hidden="true">↗</span></button><figcaption><div class="eyebrow">${esc(visual.date || '')}</div><h3>${esc(visual.title)}</h3><p>${esc(visual.caption)}</p><span class="archive-credit">${visual.url ? link(visual.url, visual.credit + ' ↗') : esc(visual.credit)}</span></figcaption></figure>`;
}

function visualArchive(e) {
  if (!e.visuals?.length) return '';
  return `<section class="visual-archive" id="visuals" aria-labelledby="visual-archive-title"><div class="section-head"><div class="eyebrow">Look closer · Visual archive</div><h2 id="visual-archive-title">${esc(e.visualTitle || 'History, held in images.')}</h2><p>${esc(e.visualIntro || 'Look beyond the headline. Explore the places, people, and objects that help us understand this chapter.')}</p></div><div class="visual-gallery-grid">${e.visuals.map((v, i) => visualFigure(v, e.id, i)).join('')}</div></section>`;
}

function homePortraits() {
  const people = ['alonzoherndon', 'johnlewis', 'annielmcpheeters', 'gracetownshamilton', 'jeanchildsyoung', 'johnwdobbs'];
  return `<div class="home-portraits"><svg viewBox="0 0 500 520" fill="none" aria-hidden="true"><ellipse cx="250" cy="260" rx="182" ry="215" transform="rotate(28 250 260)"/><ellipse cx="250" cy="260" rx="182" ry="215" transform="rotate(-28 250 260)"/><path d="M40 380C190 560 450 400 406 196S60 13 110 212"/></svg>${people.map((id, i) => `<button class="home-portrait portrait-${i}" data-person="${id}" aria-haspopup="dialog" aria-controls="story-dialog" aria-expanded="false" aria-label="Discover ${esc(data.people[id].name)}: ${esc(data.people[id].role)}"><img src="assets/${data.people[id].image}" alt="" loading="${i < 3 ? 'eager' : 'lazy'}"><span>${esc(data.people[id].name)}</span></button>`).join('')}<div class="portrait-garden-caption"><span class="living-dot" aria-hidden="true"></span>Many lives. A shared history.</div><details class="collage-credits"><summary>Portrait credits</summary><ul>${people.map(id => `<li>${esc(data.people[id].name)}: ${link(data.people[id].imageSource, data.people[id].imageCredit)}</li>`).join('')}</ul></details></div>`;
}

function home() {
  root.innerHTML = `<div class="hero"><div class="wrap home-hero-grid"><div class="home-intro"><div class="eyebrow"><span class="living-dot" aria-hidden="true"></span>South-View Cemetery · Atlanta, Georgia</div><h1>Every life tells<br>a bigger <em>story.</em></h1><p class="lead">Explore Atlanta's Black history through the lives of people connected to South-View Cemetery. The chapters connect individual lives with work, education, civil rights, and remembrance.</p><a class="btn" href="#events">Explore the stories ↓</a></div>${homePortraits()}</div></div><section class="section" id="events"><div class="wrap"><div class="section-head"><div class="eyebrow">Choose a chapter</div><h2>Three chapters of Atlanta history.</h2><p>Follow the lives behind the history: the 1906 massacre, the children Atlanta remembers, and generations of work for civil rights.</p></div><div class="cards">${[...data.events].sort((a,b) => ({massacre:0,civil:1,children:2}[a.id] ?? 9)-({massacre:0,civil:1,children:2}[b.id] ?? 9)).map(e => `<article class="card"><div class="card-art"><img class="event-card-image" src="assets/${eventVisuals[e.id].file}" alt="" loading="lazy"><span class="event-card-number">0${({massacre:1,civil:2,children:3}[e.id] ?? 0)}</span><span class="event-card-orbit" aria-hidden="true"></span><span class="event-card-date">${esc(e.date)}</span></div><div class="card-body"><h3><a href="#/event/${esc(e.id)}">${esc(e.title)}</a></h3><p>${esc(e.subtitle)}</p><p class="card-source">Source: ${citation(findSource(e.introSource, e.sources))}</p><p class="card-credit">Image: ${eventVisuals[e.id].url ? link(eventVisuals[e.id].url, eventVisuals[e.id].credit) : esc(eventVisuals[e.id].credit)}</p><a class="linkline" href="#/event/${esc(e.id)}">Explore event →</a></div></article>`).join('')}</div></div></section><div class="band"><div class="wrap"><div class="eyebrow">Why South-View?</div><h2>A place of dignity. An archive of lives.</h2><p class="prose">${cited('Black Atlantans founded South-View in 1886 in response to segregated burial practices.', findSource(data.cemeterySource))}</p><p>This student archive connects historical events to the lives of people associated with South-View.</p><a class="btn" href="#/about">About this project →</a></div></div>`;
}

function constellation(group, index) {
  const count = group.people.length;
  const topCount = Math.ceil(count / 2);
  const points = group.people.map((id, i) => {
    const top = i < topCount;
    const col = top ? i : i - topCount;
    const columns = top ? topCount : count - topCount;
    const x = count === 1 ? 50 : columns === 1 ? (top ? 35 : 68) : 14 + col * 72 / (columns - 1) + (top ? 0 : -2);
    const y = count === 1 ? 50 : count === 2 ? (top ? 34 : 62) : (top ? 29 : 69) + [0, -9, 6, -3, 8][col % 5];
    const person = data.people[id];
    return `<button class="person-node" data-person="${esc(id)}" style="--node-x:${x}%;--node-y:${y}%;--node-delay:${i * 65}ms" aria-haspopup="dialog" aria-controls="story-dialog" aria-expanded="false" aria-label="Discover ${esc(person.name)}: ${esc(person.role)}"><span class="node-orb" aria-hidden="true">${person.image ? `<img src="assets/${encodeURIComponent(person.image)}" alt="" loading="lazy">` : `<span>${esc(person.name.split(' ').map(s => s[0]).slice(0, 2).join(''))}</span>`}</span><span class="node-name">${esc(person.name)}</span><span class="node-invitation" aria-hidden="true">Open their story <span>↗</span></span></button>`;
  });
  return `<div class="constellation ${count === 1 ? 'single-story' : ''}" data-constellation="${index}"><svg class="constellation-thread" viewBox="0 0 1000 440" preserveAspectRatio="none" fill="none" aria-hidden="true"><path d="M-20 360C160 420 145 30 380 85S685 420 790 260 930 130 1020 170"/><path d="M-20 374C160 434 145 44 380 99S685 434 790 274 930 144 1020 184"/></svg><span class="constellation-coordinate" aria-hidden="true">${String(index + 1).padStart(2, '0')} / LIVES IN THE LANDSCAPE</span><div class="constellation-nodes">${points.join('')}</div><span class="constellation-caption">Each point holds a life. Choose a name to unfold their story.</span></div>`;
}

function eventPage(e) {
  const groups = e.groups || [{title: 'Lives connected to this history', description: 'Choose a person to learn about their documented connection, wider life, and contributions.', people: e.people}];
  const number = {massacre: 1, civil: 2, children: 3}[e.id];
  root.innerHTML = `<div class="page-hero event-hero"><div class="wrap"><div class="breadcrumbs"><a href="#/">Home</a><span>/</span> Chapter ${String(number).padStart(2, '0')}</div><div class="hero-grid"><div class="event-introduction"><div class="eyebrow"><span class="living-dot" aria-hidden="true"></span>${esc(e.date)} · Atlanta history</div><h1>${esc(e.title)}</h1><p class="lead">${esc(e.subtitle)}</p><nav class="chapter-nav" aria-label="Explore this chapter"><a href="#/event/${esc(e.id)}/history">The history <span>↓</span></a>${e.visuals?.length ? `<a href="#/event/${esc(e.id)}/visuals">Visual archive <span>↓</span></a>` : ''}${groups.map((g, i) => `<a href="#/event/${esc(e.id)}/people-${i}">${esc(g.nav || g.title)} <span>↓</span></a>`).join('')}</nav></div>${eventArt(e)}</div><div class="hero-footnote"><span>Many lives. One living history.</span><span aria-hidden="true">SCROLL TO DISCOVER <span class="scroll-stem">↓</span></span></div></div></div><section class="section event-body"><div class="wrap"><div id="history" class="history-flow"><div class="eyebrow">The history</div><h2>What happened?</h2><p class="prose">${cited(e.intro, findSource(e.introSource, e.sources))}</p>${(e.overview || []).map(s => `<div class="history-block"><h3>${esc(s.title)}</h3><p class="prose">${cited(s.text, findSource(s.url, e.sources))}</p></div>`).join('')}</div>${e.notice ? `<aside class="notice">${esc(e.notice)}</aside>` : ''}${visualArchive(e)}${timeline(e)}${groups.map((g, i) => `<section class="people-section" id="people-${i}" aria-labelledby="group-${i}"><div class="section-head constellation-heading"><div><div class="eyebrow">People and perspectives · ${String(g.people.length).padStart(2, '0')} ${g.people.length === 1 ? 'story' : 'stories'}</div><h2 id="group-${i}">${esc(g.title)}</h2><p>${esc(g.description)}</p></div><button class="map-toggle" data-toggle-map="${i}" aria-pressed="false">View as list <span aria-hidden="true">☷</span></button></div>${constellation(g, i)}</section>`).join('')}${editorialMeta()}${sources(e.sources, e.sourceNote)}<nav class="other-chapters" aria-label="Other chapters">${data.events.filter(x => x.id !== e.id).map(x => `<a class="btn" href="#/event/${esc(x.id)}">${esc(x.title)} →</a>`).join('')}</nav></div></section>`;
}

function personPage(p) {
  const e = data.events.find(x => x.people.includes(p.id));
  const src = p.sources;
  const overviewSource = findSource(p.introSource, src);
  const burialSource = p.burial.url ? findSource(p.burial.url, src) : p.sources.find(s => s.type === 'book');
  const headings = p.format === 'short' ? ['Remembrance', 'Documented events', 'Atlanta and South-View Connection'] : ['Overview', 'Life and Contributions', 'Atlanta and South-View Connection'];
  root.innerHTML = `<div class="page-hero"><div class="wrap"><div class="breadcrumbs"><a href="#/">Home</a> / <a href="#/event/${e.id}">${esc(e.title)}</a> / ${esc(p.name)}</div><div class="eyebrow">${esc(p.format === 'short' ? 'Short-form remembrance' : p.connection)}</div><h1>${esc(p.name)}</h1><p class="lead">${esc(p.role)}</p>${editorialMeta()}</div></div><article class="story"><section aria-labelledby="overview-title"><div class="feature">${pic(p)}<div><h2 id="overview-title">${headings[0]}</h2><p class="prose">${cited(p.intro, overviewSource)}</p></div></div>${p.imageCredit ? `<p class="image-credit">Portrait credit: ${esc(p.imageCredit)}${p.imageSource ? ` · ${link(p.imageSource, 'Image source ↗')}` : ''}</p>` : ''}</section><section class="biography-section" aria-labelledby="life-title"><h2 id="life-title">${headings[1]}</h2>${p.chapters.map(c => `<div class="chapter"><div class="eyebrow">${esc(c.date)}</div><h3>${esc(c.title)}</h3><p>${cited(c.text, findSource(c.url, src), (c.additionalSources || []).map(u => findSource(u, src)))}</p></div>`).join('')}</section><section class="biography-section" aria-labelledby="connection-title"><h2 id="connection-title">${headings[2]}</h2>${(p.localConnection || []).map(c => `<p>${cited(c.text, findSource(c.url, src), (c.additionalSources || []).map(u => findSource(u, src)))}</p>`).join('')}<p>${cited(p.burial.text, burialSource)}</p></section>${p.note ? `<aside class="notice">${esc(p.note)}</aside>` : ''}${sources(src, p.sourceNote)}<nav class="related-stories" aria-label="Related South-View pages"><h2>See also</h2><p><a href="#/event/${e.id}">${esc(e.title)}</a> · ${e.people.filter(id => id !== p.id).slice(0, 2).map(id => `<a href="#/person/${id}">${esc(data.people[id].name)}</a>`).join(' · ')}</p><div class="story-tags" aria-label="Tags">${p.tags.map(t => `<a href="${esc(t.href)}">${esc(t.label)}</a>`).join('')}</div></nav>${e.visuals?.length ? `<section class="story-context-visual"><div class="eyebrow">Contextual image · ${esc(e.title)}</div>${visualFigure(e.visuals[p.visualIndex || 0], e.id, p.visualIndex || 0)}</section>` : ''}<a class="btn" href="#/event/${e.id}">← Back to ${esc(e.title)}</a></article>`;
}

function about() {
  const cemetery = findSource(data.cemeterySource);
  root.innerHTML = `<div class="page-hero"><div class="wrap"><div class="breadcrumbs"><a href="#/">Home</a> / About the project</div><div class="eyebrow">About the archive</div><h1>History through individual lives.</h1><p class="lead">A student research archive connecting Atlanta history with people associated with South-View Cemetery.</p>${editorialMeta()}</div></div><article class="story"><h2>Purpose</h2><p>The archive connects historical events with individual lives, work, education, and civic activity. The biographies follow the South-View Website House Style. Brief remembrances use the short form where the available evidence does not support a full biography.</p><h2>About South-View</h2><p>${cited('Black Atlantans established South-View in 1886 in response to segregated burial practices. Its residents included educators, workers, civic leaders, and victims of racial violence.', cemetery)}</p><h2>Research and records</h2><p>Group C2 supplied research for this archive. The website combines that material with linked institutional, archival, and published sources. Short-form entries identify the date supported by the source. Biographies include an overview, life and contributions, and an Atlanta and South-View connection.</p><p>The reported child-victim burial connections follow the supplied research citing D. L. Henderson’s cemetery history, page six. The project has not independently inspected that page or the cemetery registers. Foundation profile pages identify connections to South-View’s neighborhood archive; they are not treated as individual burial certificates.</p><p>The educators in the Atlanta Child Murders chapter provide context about educational opportunity. Their inclusion does not establish participation in the investigations. Benjamin Elijah Mays’s former burial at South-View is distinguished from his later reinterment at Morehouse.</p><h2>Images and credits</h2><p>Captions identify image credits and link to source records. Chapter images used beside an individual remembrance provide historical context; they are not portraits of that person. Initials appear where a verified portrait is unavailable. Existing image permissions and outstanding documentation are recorded in the <a href="asset-ledger.json" target="_blank" rel="noopener">asset ledger</a>.</p>${sources([cemetery])}</article>`;
}

const personDialog = document.createElement('dialog');
personDialog.id = 'story-dialog';
personDialog.className = 'person-dialog';
personDialog.setAttribute('aria-labelledby', 'dialog-person-name');
personDialog.setAttribute('aria-describedby', 'dialog-person-role');
document.body.append(personDialog);
let selectedPerson;
let selectedTrigger;
let closingDialog = false;

function renderPreview(id) {
  const p = data.people[id];
  const e = data.events.find(item => item.people.includes(id));
  const index = e.people.indexOf(id);
  selectedPerson = id;
  document.querySelectorAll('[data-person]').forEach(node => node.setAttribute('aria-expanded', String(node.dataset.person === id)));
  const moment = p.chapters[0];
  personDialog.innerHTML = `<button class="dialog-close" aria-label="Close story" autofocus>×</button><div class="dialog-layout"><aside class="dialog-visual">${pic(p)}<span class="eyebrow">A LIFE IN THE ARCHIVE</span><span class="dialog-chapter-name">${esc(e.title)}</span><span class="dialog-petal" aria-hidden="true"></span></aside><article class="dialog-content"><div class="eyebrow">${esc(p.connection || 'A life connected to this history')}</div><h2 id="dialog-person-name">${esc(p.name)}</h2><p class="dialog-role" id="dialog-person-role">${esc(p.role)}</p><p class="dialog-intro">${cited(p.intro, findSource(p.introSource, p.sources))}</p><div class="dialog-moment"><div class="eyebrow">${esc(moment.date)}</div><h3>${esc(moment.title)}</h3><p>${cited(moment.text, findSource(moment.url, p.sources))}</p></div><div class="dialog-actions"><a class="btn" data-full-story href="#/person/${esc(id)}">${p.format === 'short' ? 'Read the remembrance' : 'Read the full story'} <span aria-hidden="true">↗</span></a><span>Life, cemetery connection and sources</span></div></article></div><div class="dialog-footer"><span>${String(index + 1).padStart(2, '0')} <span class="dialog-counter-divider">/</span> ${String(e.people.length).padStart(2, '0')} <span class="dialog-footer-label">lives in this chapter</span></span><div><button class="person-step" data-person-step="-1" aria-label="Previous person">←</button><button class="person-step" data-person-step="1" aria-label="Next person">→</button></div></div>`;
  personDialog.scrollTop = 0;
}

async function openPerson(trigger) {
  selectedTrigger = trigger;
  closingDialog = false;
  personDialog.classList.remove('is-closing');
  renderPreview(trigger.dataset.person);
  personDialog.querySelectorAll('.person-step').forEach(button => button.disabled = true);
  const fullStory = personDialog.querySelector('[data-full-story]');
  fullStory.setAttribute('aria-disabled', 'true');
  fullStory.tabIndex = -1;
  personDialog.showModal();
  document.body.classList.add('has-story-open');
  await window.archiveMotion.bloom(personDialog, trigger.querySelector('.node-orb') || trigger);
  if (personDialog.open && !closingDialog) {
    personDialog.querySelectorAll('.person-step').forEach(button => button.disabled = false);
    fullStory.removeAttribute('aria-disabled');
    fullStory.removeAttribute('tabindex');
  }
}

async function closePerson(instant = false) {
  if (!personDialog.open || closingDialog) return;
  closingDialog = true;
  personDialog.classList.add('is-closing');
  if (!instant) await window.archiveMotion.bloom(personDialog, selectedTrigger?.querySelector('.node-orb') || selectedTrigger, true);
  personDialog.close();
  document.body.classList.remove('has-story-open');
  document.querySelectorAll('[data-person]').forEach(node => node.setAttribute('aria-expanded', 'false'));
  if (!instant && selectedTrigger?.isConnected) selectedTrigger.focus({preventScroll: true});
  closingDialog = false;
}

root.addEventListener('click', event => {
  const node = event.target.closest('[data-person]');
  if (node) { openPerson(node); return; }
  const toggle = event.target.closest('[data-toggle-map]');
  if (!toggle) return;
  const map = root.querySelector(`[data-constellation="${toggle.dataset.toggleMap}"]`);
  const asList = map.classList.toggle('is-list');
  toggle.setAttribute('aria-pressed', String(asList));
  toggle.innerHTML = asList ? 'View as constellation <span aria-hidden="true">✧</span>' : 'View as list <span aria-hidden="true">☷</span>';
});
personDialog.addEventListener('cancel', event => { event.preventDefault(); closePerson(); });
personDialog.addEventListener('click', event => {
  if (event.target.closest('.dialog-close')) { closePerson(); return; }
  const fullStory = event.target.closest('[data-full-story]');
  if (fullStory) {
    if (fullStory.getAttribute('aria-disabled') === 'true') { event.preventDefault(); return; }
    closePerson(true);
    return;
  }
  const step = event.target.closest('[data-person-step]');
  if (step && !closingDialog) {
    const e = data.events.find(item => item.people.includes(selectedPerson));
    const next = (e.people.indexOf(selectedPerson) + Number(step.dataset.personStep) + e.people.length) % e.people.length;
    renderPreview(e.people[next]);
    if (!window.archiveMotion.reduced.matches) personDialog.querySelector('.dialog-layout').animate([{opacity: .25, transform: 'translateY(10px)'}, {opacity: 1, transform: 'translateY(0)'}], {duration: 380, easing: 'ease-out'});
    // Keep keyboard focus on the corresponding navigation control after its replacement.
    personDialog.querySelector(`[data-person-step="${step.dataset.personStep}"]`).focus({preventScroll: true});
    return;
  }
  const bounds = personDialog.getBoundingClientRect();
  if (event.target === personDialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) closePerson();
});

const imageDialog = document.createElement('dialog');
imageDialog.id = 'image-dialog';
imageDialog.className = 'image-dialog';
imageDialog.setAttribute('aria-labelledby', 'image-dialog-title');
document.body.append(imageDialog);
let imageTrigger;
let imageEvent;
let imageIndex = 0;
let closingImage = false;

function renderImage() {
  const e = ev(imageEvent);
  const visual = e.visuals[imageIndex];
  imageDialog.innerHTML = `<button class="dialog-close" aria-label="Close image" autofocus>×</button><div class="image-lightbox-content"><div class="image-stage"><img src="assets/${encodeURIComponent(visual.file)}" alt="${esc(visual.alt)}"></div><div class="image-dialog-caption"><div class="eyebrow">${esc(visual.type || 'Visual archive')} · ${esc(visual.date || '')}</div><h2 id="image-dialog-title">${esc(visual.title)}</h2><p>${esc(visual.caption)}</p><span class="archive-credit">${visual.url ? link(visual.url, visual.credit + ' · View source ↗') : esc(visual.credit)}</span></div></div><div class="dialog-footer"><span>${String(imageIndex + 1).padStart(2, '0')} <span class="dialog-counter-divider">/</span> ${String(e.visuals.length).padStart(2, '0')} <span class="dialog-footer-label">${esc(e.title)}</span></span><div><button class="person-step" data-image-step="-1" aria-label="Previous image">←</button><button class="person-step" data-image-step="1" aria-label="Next image">→</button></div></div>`;
}

async function openImage(trigger) {
  imageTrigger = trigger;
  imageEvent = trigger.dataset.visualEvent;
  imageIndex = Number(trigger.dataset.visualIndex);
  closingImage = false;
  imageDialog.classList.remove('is-closing');
  renderImage();
  imageDialog.querySelectorAll('.person-step').forEach(button => button.disabled = true);
  imageDialog.showModal();
  document.body.classList.add('has-story-open');
  await window.archiveMotion.bloom(imageDialog, trigger);
  if (imageDialog.open && !closingImage) imageDialog.querySelectorAll('.person-step').forEach(button => button.disabled = false);
}

async function closeImage(instant = false) {
  if (!imageDialog.open || closingImage) return;
  closingImage = true;
  imageDialog.classList.add('is-closing');
  if (!instant) await window.archiveMotion.bloom(imageDialog, imageTrigger, true);
  imageDialog.close();
  document.body.classList.remove('has-story-open');
  if (!instant && imageTrigger?.isConnected) imageTrigger.focus({preventScroll: true});
  closingImage = false;
}

function stepImage(step) {
  if (closingImage) return;
  const total = ev(imageEvent).visuals.length;
  imageIndex = (imageIndex + step + total) % total;
  renderImage();
  if (!window.archiveMotion.reduced.matches) imageDialog.querySelector('.image-lightbox-content').animate([{opacity: .2, transform: 'translateY(8px)'}, {opacity: 1, transform: 'translateY(0)'}], {duration: 420, easing: 'ease-out'});
  imageDialog.querySelector(`[data-image-step="${step}"]`).focus({preventScroll: true});
}

root.addEventListener('click', event => {
  const image = event.target.closest('[data-visual-event]');
  if (image) openImage(image);
});
imageDialog.addEventListener('cancel', event => { event.preventDefault(); closeImage(); });
imageDialog.addEventListener('click', event => {
  if (event.target.closest('.dialog-close')) { closeImage(); return; }
  const step = event.target.closest('[data-image-step]');
  if (step && !step.disabled) { stepImage(Number(step.dataset.imageStep)); return; }
  const bounds = imageDialog.getBoundingClientRect();
  if (event.target === imageDialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) closeImage();
});
imageDialog.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey || imageDialog.querySelector('.person-step:disabled')) return;
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault();
    stepImage(event.key === 'ArrowRight' ? 1 : -1);
  }
});

let currentPage;
let navigation = 0;
function route() {
  const bits = location.hash.replace(/^#\/?/, '').split('/');
  if (bits[0] === 'main') { root.focus(); return; }
  const e = bits[0] === 'event' ? ev(bits[1]) : null;
  const p = bits[0] === 'person' ? data.people[bits[1]] : null;
  const key = e ? `event/${e.id}` : p ? `person/${p.id}` : bits[0] === 'about' ? 'about' : 'home';
  const anchor = bits[0] === 'events' ? 'events' : e ? bits[2] : null;
  if (key === currentPage) {
    if (anchor) document.getElementById(anchor)?.scrollIntoView({behavior: window.archiveMotion.reduced.matches ? 'instant' : 'smooth', block: 'start'});
    else window.scrollTo({top: 0, behavior: window.archiveMotion.reduced.matches ? 'instant' : 'smooth'});
    return;
  }
  closePerson(true);
  closeImage(true);
  const visit = ++navigation;
  const animate = currentPage !== undefined;
  window.archiveMotion.transition(() => {
    if (visit !== navigation) return;
    if (e) eventPage(e);
    else if (p) personPage(p);
    else if (key === 'about') about();
    else home();
    currentPage = key;
    document.title = 'South-View | ' + (e ? e.title : p ? p.name : 'Stories That Shape Atlanta');
    if (anchor && document.getElementById(anchor)) document.getElementById(anchor).scrollIntoView({behavior: 'instant'});
    else window.scrollTo({top: 0, behavior: 'instant'});
    root.focus({preventScroll: true});
    window.archiveMotion.mount(e?.id || (p ? data.events.find(item => item.people.includes(p.id)).id : key));
  }, animate);
}
window.addEventListener('hashchange', route);
route();
