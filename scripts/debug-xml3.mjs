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

function extractAttr(str, tag, attr) {
  const re = new RegExp(`<${tag}[^>]*${attr}="([^"]*)"[^>]*>`);
  return str.match(re)?.[1] ?? '';
}

function decodeCDATA(s) {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, (_, inner) => inner).trim();
}

const items = extractAll(xml, 'item');

// Check an attachment item - print it fully
const attachments = items.filter(item => decodeCDATA(extractOne(item, 'wp:post_type')) === 'attachment');
console.log('Sample attachment item:');
console.log(attachments[5].substring(0, 1500));

// Build attachment ID → URL map
console.log('\n--- Building attachment map ---');
const attachmentIdToUrl = new Map();
for (const item of attachments) {
  const postId = decodeCDATA(extractOne(item, 'wp:post_id'));
  const url = decodeCDATA(extractOne(item, 'wp:attachment_url'));
  if (postId && url) {
    attachmentIdToUrl.set(postId, url);
  }
}
console.log('Attachment map size:', attachmentIdToUrl.size);
console.log('Sample entries:');
let i = 0;
for (const [k, v] of attachmentIdToUrl) {
  if (i++ > 3) break;
  console.log(' ', k, '->', v);
}

// Now check what post items' _thumbnail_id looks like and if it matches
const postItems = items.filter(item => decodeCDATA(extractOne(item, 'wp:post_type')) === 'post');
console.log('\n--- Checking thumbnail IDs ---');
let matched = 0, unmatched = 0;
for (const item of postItems) {
  const metas = extractAll(item, 'wp:postmeta');
  for (const meta of metas) {
    const key = decodeCDATA(extractOne(meta, 'wp:meta_key'));
    if (key === '_thumbnail_id') {
      const thumbId = decodeCDATA(extractOne(meta, 'wp:meta_value'));
      const url = attachmentIdToUrl.get(thumbId);
      if (url) matched++;
      else { unmatched++; console.log('  No URL for thumbnail_id:', thumbId); }
    }
  }
}
console.log('Matched thumbnail IDs:', matched, '/ Unmatched:', unmatched);

// Check how category nicenames work in items
const firstPost = postItems[0];
const catRaw = firstPost.match(/<category[^>]*>[\s\S]*?<\/category>/g) || [];
console.log('\n--- Category attributes in first post ---');
for (const c of catRaw) {
  // Extract nicename attribute
  const nicename = c.match(/nicename="([^"]+)"/)?.[1] ?? '';
  const domain = c.match(/domain="([^"]+)"/)?.[1] ?? '';
  const cdata = decodeCDATA(c.match(/<category[^>]*>([\s\S]*?)<\/category>/)?.[1] ?? '');
  console.log(`  domain="${domain}" nicename="${nicename}" cdata="${cdata}"`);
}
