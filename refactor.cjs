const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf-8');

// Safe replacements for index.css
css = css.replace(/background-color: var\(--accent-color\);\s*color: white;/g, 'background-color: var(--accent-color);\n  color: var(--accent-text);');
css = css.replace(/#333/g, 'var(--accent-hover)');
css = css.replace(/#000/g, 'var(--accent-color)');
css = css.replace(/#f5f3ef/g, 'var(--panel-bg)');
css = css.replace(/rgba\(0,0,0,0\.03\)/g, 'var(--hover-bg)');
css = css.replace(/rgba\(0,0,0,0\.04\)/g, 'var(--icon-bg)');
css = css.replace(/rgba\(0,0,0,0\.08\)/g, 'var(--icon-hover)');
css = css.replace(/rgba\(0,0,0,0\.05\)/g, 'var(--border-color)');
css = css.replace(/rgba\(0,0,0,0\.06\)/g, 'var(--border-color)');
css = css.replace(/#10b981/g, 'var(--success-color)'); 
css = css.replace(/#fff/g, 'var(--bg-color)');

fs.writeFileSync('src/index.css', css);

console.log('CSS refactored successfully.');
