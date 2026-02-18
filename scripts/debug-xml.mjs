import fs from 'fs';

const xml = fs.readFileSync('C:/Users/arikb/Downloads/englishwitharik.WordPress.2026-02-17.xml', 'utf-8');

function extractAll(xml, tag) {
  const results = [];
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'g');
  let m;
  while ((m = re.exec(xml)) !== null) results.push(m[1]);
  return results;
}

function extractOne(str, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`);
  return (str.match(re)?.[1] ?? '').trim();
}

function decodeCDATA(s) {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, (_, inner) => inner).trim();
}

const items = extractAll(xml, 'item');
console.log('Total items:', items.length);

const first5Types = items.slice(0, 5).map(item => {
  const raw = extractOne(item, 'wp:post_type');
  return { raw, decoded: decodeCDATA(raw) };
});
console.log('First 5 wp:post_type values:', JSON.stringify(first5Types, null, 2));

// Count types after decoding
const typeCounts = {};
for (const item of items) {
  const raw = extractOne(item, 'wp:post_type');
  const decoded = decodeCDATA(raw);
  typeCounts[decoded] = (typeCounts[decoded] || 0) + 1;
}
console.log('\nType counts (decoded):', typeCounts);

// Check status values for posts
const postItems = items.filter(item => decodeCDATA(extractOne(item, 'wp:post_type')) === 'post');
console.log('\nPost items count:', postItems.length);
const statusCounts = {};
for (const item of postItems) {
  const status = decodeCDATA(extractOne(item, 'wp:status'));
  statusCounts[status] = (statusCounts[status] || 0) + 1;
}
console.log('Post status counts:', statusCounts);

// Check pages
const pageItems = items.filter(item => decodeCDATA(extractOne(item, 'wp:post_type')) === 'page');
console.log('Page items count:', pageItems.length);
