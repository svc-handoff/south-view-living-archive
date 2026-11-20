import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';

// Exercise the same helpers the browser uses, without opening a page.
const code = readFileSync(new URL('../dist/app.js', import.meta.url), 'utf8').split('const timeline =')[0];
const context = createContext({ window: { ARCHIVE: { sources: [] } }, document: { getElementById: () => null }, Intl });
runInContext(code, context);
const { citation, cited, sources } = runInContext('({ citation, cited, sources })', context);
const plain = html => html.replace(/<[^>]*>/gu, '');
const article = { author: 'Dana Robinson', title: 'An Atlanta history', site: 'History Review', year: 2020, url: 'https://example.org/history' };
const website = { organization: 'BlackPast', title: 'Community history', site: 'BlackPast', url: 'https://example.org/community' };
const book = { type: 'book', author: 'Benjamin Elijah Mays', title: 'Born to Rebel: An Autobiography', shortTitle: 'Born to Rebel', site: 'Charles Scribner’s Sons', year: 1971, page: 14 };

assert.equal(plain(cited('A historical statement.', article)), 'A historical statement (Robinson).');
assert.equal(plain(cited('A historical statement', website)), 'A historical statement (BlackPast).');
assert.equal(plain(cited('It happened in 1906. A later event followed.', article)), 'It happened in 1906 (Robinson). A later event followed (Robinson).');
assert.equal(plain(cited('Accounts differ.', article, [website, article])), 'Accounts differ (Robinson; BlackPast).');
assert.equal(plain(cited('He lived in the U.S.', article)), 'He lived in the U.S. (Robinson).');
assert.equal(plain(cited('She wrote “remember.”', article)), 'She wrote “remember” (Robinson).');
assert.match(cited('An autobiographical account.', book), /\(Mays, <em>Born to Rebel<\/em>, 14\)<\/span>\.$/u);
assert.match(citation({ title: 'An archival account' }), /<em>An archival account<\/em>/u);
assert.match(citation(article), /href="https:\/\/example\.org\/history"/u);
const bibliography = sources([article, { ...article }, book, { ...book, page: 22 }]);
assert.equal((bibliography.match(/<li>/gu) || []).length, 2);
assert.ok(plain(bibliography).includes('Dana Robinson · An Atlanta history · History Review · 2020 · Read source'));
assert.match(bibliography, /<em>Born to Rebel: An Autobiography<\/em>/u);
assert.equal(cited('A sentence without an assigned source.', undefined), 'A sentence without an assigned source.');
console.log('Citation regression checks passed: punctuation, labels, book italics/pages, multiple sources, and source-list deduplication.');
