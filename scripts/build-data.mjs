import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const source = new URL('../dist/content.json', import.meta.url);
const archive = JSON.parse(readFileSync(source, 'utf8'));
const ids = new Set();
for (const event of archive.events) {
  if (ids.has(event.id)) throw new Error(`Duplicate event: ${event.id}`);
  ids.add(event.id);
  if (!event.people.length) throw new Error(`Empty event: ${event.id}`);
  for (const id of event.people) {
    if (!archive.people[id]) throw new Error(`Missing profile: ${id}`);
  }
  for (const visual of event.visuals || []) {
    if (!visual.title || !visual.alt || !visual.caption || !visual.credit) throw new Error(`Incomplete visual: ${event.id}`);
    if (!existsSync(new URL(`../dist/assets/${visual.file}`, import.meta.url))) throw new Error(`Missing visual asset: ${visual.file}`);
    if (visual.url && !visual.url.startsWith('https://')) throw new Error(`Invalid visual source: ${event.id}`);
  }
  if (event.groups) {
    const grouped = event.groups.flatMap(g => g.people);
    if (grouped.length !== new Set(grouped).size || grouped.length !== event.people.length || grouped.some(id => !event.people.includes(id))) {
      throw new Error(`Profile groups disagree with event list: ${event.id}`);
    }
  }
}
for (const [id, person] of Object.entries(archive.people)) {
  if (id !== person.id || !person.chapters.length || !person.intro) throw new Error(`Incomplete profile: ${id}`);
  if (archive.events.filter(e => e.people.includes(id)).length !== 1) throw new Error(`Profile needs one parent event: ${id}`);
  const parent = archive.events.find(e => e.people.includes(id));
  if (person.visualIndex !== undefined && (!Number.isInteger(person.visualIndex) || !parent.visuals?.[person.visualIndex])) throw new Error(`Invalid contextual image: ${id}`);
  if (person.image && !existsSync(new URL(`../dist/assets/${person.image}`, import.meta.url))) throw new Error(`Missing portrait: ${id}`);
  const sourceList = person.sources || [];
  const sourceURLs = new Set(sourceList.map(s => s.url).filter(Boolean));
  const sections = [...person.chapters, ...(person.localConnection || [])];
  const urls = [...sourceList, ...sections, person.burial || {}].map(s => s.url).filter(Boolean);
  if (urls.some(url => !url.startsWith('https://') || /wikipedia\.org|google\.com\/search/i.test(url))) throw new Error(`Invalid final source URL: ${id}`);
  for (const section of sections) {
    if (!section.text || !sourceURLs.has(section.url)) throw new Error(`Unsourced paragraph: ${id}`);
    for (const url of section.additionalSources || []) if (!sourceURLs.has(url)) throw new Error(`Missing additional source: ${id}`);
  }
  if (!sourceURLs.has(person.introSource)) throw new Error(`Unsourced overview: ${id}`);
  if (!person.burial?.text || (person.burial.url ? !sourceURLs.has(person.burial.url) : !sourceList.some(s => s.type === 'book' && s.page))) throw new Error(`Unsourced cemetery connection: ${id}`);
  for (const source of sourceList) if (!(source.author || source.organization) || !source.title || !source.site) throw new Error(`Incomplete source metadata: ${id}`);
  if (!person.tags || person.tags.length < 3 || person.tags.length > 4 || person.tags.some(t => !t.href?.startsWith('#/'))) throw new Error(`Invalid internal tags: ${id}`);
  const words = text => text.trim().split(/\s+/u).length;
  if (person.format === 'long') {
    const overview = words(person.intro);
    const life = person.chapters.reduce((sum, c) => sum + words(c.text), 0);
    const connection = words(person.burial.text) + (person.localConnection || []).reduce((sum, c) => sum + words(c.text), 0);
    if (overview < 50 || overview > 80 || life < 250 || life > 400 || connection < 80 || connection > 150) throw new Error(`House-style word ranges: ${id} (${overview}/${life}/${connection})`);
    if (new Set(sourceList.map(s => s.url || s.title)).size < 4 || !sourceList.some(s => ['archive', 'primary', 'scholarly', 'book'].includes(s.type))) throw new Error(`Biography requires four sources including archival or primary evidence: ${id}`);
  } else if (person.format === 'short') {
    const segmenter = new Intl.Segmenter('en', {granularity: 'sentence'});
    if (person.chapters.some(c => !/\d/.test(c.date) || [...segmenter.segment(c.text)].length > 3) || [...segmenter.segment(person.intro)].length > 3) throw new Error(`Invalid short-form entry: ${id}`);
  } else throw new Error(`Unknown content format: ${id}`);
}
for (const event of archive.events) {
  const urls = new Set(event.sources.map(s => s.url));
  for (const entry of [...event.timeline, ...event.overview]) if (!entry.text || !urls.has(entry.url)) throw new Error(`Unsourced event entry: ${event.id}`);
  if (!urls.has(event.introSource)) throw new Error(`Unsourced chapter overview: ${event.id}`);
}
const ledger = JSON.parse(readFileSync(new URL('../dist/asset-ledger.json', import.meta.url), 'utf8'));
const assets = new Map(ledger.assets.map(item => [item.file, item]));
for (const person of Object.values(archive.people)) if (person.image && (!assets.get(person.image)?.credit || !assets.get(person.image)?.sourceUrl)) throw new Error(`Portrait missing from ledger: ${person.id}`);
for (const event of archive.events) for (const visual of event.visuals) if (!assets.has(visual.file) || (visual.file !== 'remembrance.svg' && !assets.get(visual.file).sourceUrl)) throw new Error(`Visual missing from ledger: ${visual.file}`);
if (!archive.editorial?.updated || !archive.editorial?.members?.length) throw new Error('Missing editorial attribution');
writeFileSync(new URL('../dist/data.js', import.meta.url), `// Generated from content.json by node scripts/build-data.mjs\nwindow.ARCHIVE=${JSON.stringify(archive)};\n`);
console.log(`Validated ${archive.events.length} chapters and ${Object.keys(archive.people).length} profiles; regenerated dist/data.js.`);
