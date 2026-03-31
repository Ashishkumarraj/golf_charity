const fs = require('fs');
const path = require('path');

const patterns = [
  ['âš ï¸', '⚠️'],
  ['â ¤ï¸', '❤️'],
  ['â„¹ï¸', 'ℹ️'],
  ['ðŸ Œï¸', '🏌️'],
  ['âœ ï¸', '✏️'],
  ['â­ ', '⭐'],
  ['â›³', '⛳'],
  ['âœ…', '✅'],
  ['â ³', '⏳'],
  ['â—”', '—'],
  ['âž•', '➕'],
  ['â€“', '–'],
  ['ðŸ †', '🏆'],
  ['ðŸ” ', '🔍'],
  ['ðŸ‘‘', '👑'],
  ['â— ', '●'],
  ['â—‹', '○'],
  ['âš¡', '⚡'],
  ['â Œ', '❌'],
  ['âšª', '⚪'],
  ['â€¦', '...'],
  ['â†’', '→']
];

function walkAndReplace(dir) {
  const files = fs.readdirSync(dir);
  let changed = 0;
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      changed += walkAndReplace(fullPath);
    } else if (/\.(tsx|ts|js|jsx|css)$/.test(file)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let orig = content;

      for (const [garbled, emoji] of patterns) {
        // the garbled text might have trailing spaces or slight variations
        // we use a simple split/join on the exact substring
        content = content.split(garbled).join(emoji);
        // Also try with trailing space removal
        content = content.split(garbled + ' ').join(emoji + ' ');
      }

      if (content !== orig) {
        fs.writeFileSync(fullPath, content, 'utf8');
        changed++;
        console.log('Fixed', fullPath);
      }
    }
  });
  return changed;
}

const num = walkAndReplace(path.join(__dirname, 'app'));
console.log('Done fixing files:', num);
