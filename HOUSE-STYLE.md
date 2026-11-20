# South-View website house style

The website follows the supplied South-View Website House Style. These rules apply to the published writing and the content data.

## Writing and citations

Use plain, specific sentences in the third person and past tense for a person's life. Use the full name on first mention and the surname thereafter. Write South-View with the hyphen, African American without one, and Black with a capital B. Spell out numbers under 10 and write dates as August 1, 1894.

Every date, number, quotation, and disputed fact needs a source. Every factual paragraph needs at least one citation. Cut claims that cannot be traced. Attribute praise. Explain disagreements and cite both sources.

The renderer places linked surname or organization tags after dated, numbered, quoted, or disputed sentences and at the end of each factual paragraph. A source URL must identify the actual supporting page. Sentence-ending punctuation follows the tag: `Historical statement (Robinson).` Multiple sources share a tag separated by semicolons. Books use an unlinked surname, italic short title, and page number: `(Mays, Born to Rebel, 14).` The book title is italicized in the rendered citation.

List each source once under Sources, giving author or organization, title, site or publisher, year if known, and a permanent link. Source-list fields are separated by centered dots rather than MLA-style punctuation. Book titles are italicized. Do not use Wikipedia, search results, or access dates in the finished source lists.

## Full biographies

The 13 full biographies use this order:

1. Overview: 50–80 words.
2. Life and Contributions: 250–400 words, in chronological order.
3. Atlanta and South-View Connection: 80–150 words, including a specific cemetery connection.
4. Sources: at least four, including an archive, primary source, scholarly source, or book.

Each biography has three internal tags and internal See also links. Public pages omit the group byline, course and term credit, and last-updated date as requested. Editorial metadata remains in the content file for maintenance.

## Short remembrances and timeline entries

The 12 short remembrances retain the available evidence rather than inventing full life histories. Entries give a title, sourced date or year, one to three sentences, and a linked source. Their separate cemetery-connection notes identify reported evidence and uncertainty. They are labeled as short-form remembrances rather than full biographies.

## Images and records

Each displayed image has a credit and a row in dist/asset-ledger.json. Contextual chapter images must not be represented as portraits of a person. The ledger distinguishes used and unused legacy files and records missing rights documentation. Source attribution does not establish publication permission.

The child-victim burial connections are reported from the supplied Group C2 research citing Henderson, page six. That page and the cemetery registers have not been independently inspected. Foundation neighborhood profiles establish an archive connection but are not burial certificates.

## Maintenance

Edit dist/content.json and run `node scripts/build-data.mjs`. It validates paragraph sources, source metadata, biography lengths, source counts and types, internal tags, event relationships, and image-ledger coverage, then regenerates dist/data.js.

The validator cannot establish that a source supports every claim or that copyright permission exists. Check those manually. source-link-checks.json records the latest HTTP check; protected or unavailable links need a manual check and are not automatically classified as missing pages.
