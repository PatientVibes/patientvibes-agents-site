// Extracts the first paragraph after the h1 from a README.
// Returns '' if no h1 or no paragraph.
export function extractShortDescription(markdown) {
  const lines = markdown.split('\n');
  let i = 0;
  // Find the h1 line
  while (i < lines.length && !/^#\s+/.test(lines[i])) i++;
  if (i >= lines.length) return '';
  i++;
  // Skip blank lines
  while (i < lines.length && lines[i].trim() === '') i++;
  // Collect paragraph lines until blank or another heading
  const paraLines = [];
  while (i < lines.length && lines[i].trim() !== '' && !/^#{1,6}\s+/.test(lines[i])) {
    paraLines.push(lines[i].trim());
    i++;
  }
  return paraLines.join(' ').trim();
}
