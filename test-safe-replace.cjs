function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function safeReplace(html, find, replace) {
  let count = 0;
  const result = html.replace(/>([^<]*)</g, (match, textContent) => {
    const regex = new RegExp(escapeRegExp(find), 'gi');
    const matches = textContent.match(regex);
    if (matches) {
      count += matches.length;
      return '>' + textContent.replace(regex, replace) + '<';
    }
    return match;
  });
  return { html: result, count };
}

const testHtml = '<a href="/villa-agency/test.jpg"><h1>VILLA</h1></a><p class="villa-class">Best VILLA rentals</p>';
const { html, count } = safeReplace(testHtml, 'villa', 'villas');
console.log('Original:', testHtml);
console.log('');
console.log('After:', html);
console.log('');
console.log('Count:', count);
console.log('URL preserved:', html.includes('/villa-agency/'));
console.log('Class preserved:', html.includes('villa-class'));
