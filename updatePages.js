const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));
files.push('../index.html');

for (let file of files) {
    let filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    let updated = false;

    // Add theme.js to head
    if (!content.includes('theme.js')) {
        content = content.replace('</head>', '    <script src="' + (file.includes('index.html') ? '' : '../') + 'js/theme.js"></script>\n</head>');
        updated = true;
    }
    
    // Add dark-mode.css to head
    if (!content.includes('dark-mode.css')) {
        content = content.replace('</head>', '    <link rel="stylesheet" href="' + (file.includes('index.html') ? '' : '../') + 'css/dark-mode.css">\n</head>');
        updated = true;
    }

    // Wrap navAvatar in profile link
    if (!content.includes('id="themeToggleBtn"')) {
        const avatarRegex = /<div[^>]*id="navAvatar"[^>]*>.*?<\/div>/;
        
        let profilePath = file.includes('index.html') ? 'profile.html' : '../profile.html';
        
        let newAvatarHTML = `
        <div style="display: flex; align-items: center; gap: 12px; margin-left: auto;">
            <button class="theme-toggle-btn" id="themeToggleBtn" onclick="window.toggleTheme()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            </button>
            <a href="${profilePath}" style="text-decoration:none;">
                <div class="nav-avatar" id="navAvatar">U</div>
            </a>
        </div>`;

        if (content.includes('<div class="nav-right">')) {
            content = content.replace(/<div class="nav-right">[\s\S]*?<\/div>\s*(?:<\/nav>|<\/header>)/, newAvatarHTML + '\n    </nav>');
            updated = true;
        } else if (content.match(avatarRegex)) {
            content = content.replace(avatarRegex, newAvatarHTML);
            updated = true;
        }
    } else {
        if (!content.includes('profile.html')) {
             const avatarRegex = /<div[^>]*id="navAvatar"[^>]*>[\s\S]*?<\/div>/;
             const match = content.match(avatarRegex);
             if (match) {
                 let profilePath = file.includes('index.html') ? 'profile.html' : '../profile.html';
                 content = content.replace(avatarRegex, `<a href="${profilePath}" style="text-decoration:none;">${match[0]}</a>`);
                 updated = true;
             }
        }
    }

    if (updated) {
        fs.writeFileSync(filePath, content);
        console.log('Updated ' + file);
    }
}
