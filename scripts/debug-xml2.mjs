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
const postItems = items.filter(item => decodeCDATA(extractOne(item, 'wp:post_type')) === 'post');

console.log('Post items found:', postItems.length);

// Check first post's date field
const first = postItems[0];
const rawDate = extractOne(first, 'wp:post_date');
console.log('\nRaw wp:post_date:', JSON.stringify(rawDate));
console.log('Decoded wp:post_date:', decodeCDATA(rawDate));

// Check meta keys for thumbnail
const metaBlocks = extractAll(first, 'wp:postmeta');
console.log('\nMeta keys in first post:');
for (const meta of metaBlocks) {
  const key = decodeCDATA(extractOne(meta, 'wp:meta_key'));
  const value = decodeCDATA(extractOne(meta, 'wp:meta_value'));
  console.log(' -', key, '=', value.substring(0, 80));
}

// Check categories in first post
console.log('\nCategory tags in first post:');
// The category tags are inline attributes, not child elements the same way
// Let's get the raw category lines
const catLines = first.match(/<category[^>]*>[\s\S]*?<\/category>/g) || [];
console.log('Raw category lines:');
for (const c of catLines) {
  console.log(' ', c.substring(0, 200));
}

// Check posts with actual featured images via postmeta
let thumbCount = 0;
for (const item of postItems) {
  const metas = extractAll(item, 'wp:postmeta');
  for (const meta of metas) {
    const key = decodeCDATA(extractOne(meta, 'wp:meta_key'));
    if (key === '_thumbnail_url' || key === '_thumbnail_id') {
      thumbCount++;
      break;
    }
  }
}
console.log('\nPosts with _thumbnail_url or _thumbnail_id meta:', thumbCount);

// Check all unique meta keys across all posts
const allMetaKeys = new Set();
for (const item of postItems) {
  const metas = extractAll(item, 'wp:postmeta');
  for (const meta of metas) {
    const key = decodeCDATA(extractOne(meta, 'wp:meta_key'));
    allMetaKeys.add(key);
  }
}
console.log('\nAll meta keys found in posts:');
console.log([...allMetaKeys].sort().join('\n'));
