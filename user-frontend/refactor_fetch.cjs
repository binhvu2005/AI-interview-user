const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/PC/Desktop/AI-interview/user/user-frontend/src';

function walkDir(currentPath) {
  const files = fs.readdirSync(currentPath);
  for (const file of files) {
    const fullPath = path.join(currentPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      if (fullPath.includes('fetchClient') || fullPath.includes('api.config')) continue;
      
      let content = fs.readFileSync(fullPath, 'utf8');
      
      if (content.includes('fetch(API_ENDPOINTS') || content.includes('fetch(`${API_ENDPOINTS')) {
        // We shouldn't replace in Auth pages because login/register use normal fetch (no auth needed),
        // but fetchWithAuth is fine for login/register too (it just won't add auth header if token is null).
        // Wait, for login, we don't want to use fetchWithAuth if it intercepts 401 and redirects to login!
        // But login returns 401 if wrong password. We don't want fetchWithAuth to redirect to login on wrong password.
        // So let's NOT replace in Auth pages.
        if (fullPath.includes('LoginPage') || fullPath.includes('RegisterPage')) continue;

        // Calculate relative path to fetchClient
        let depth = fullPath.replace(dir, '').split(path.sep).length - 2;
        let relativePath = '';
        if (depth <= 0) relativePath = './services/fetchClient';
        else relativePath = '../'.repeat(depth) + 'services/fetchClient';

        // Add import if not exists
        if (!content.includes('fetchWithAuth')) {
          const importStmt = `import { fetchWithAuth } from '${relativePath}';\n`;
          const lines = content.split('\n');
          let importIndex = 0;
          for(let i=0; i<lines.length; i++) {
             if(lines[i].startsWith('import ')) {
                 importIndex = i + 1;
             }
          }
          lines.splice(importIndex, 0, importStmt);
          content = lines.join('\n');
        }

        content = content.replace(/fetch\(API_ENDPOINTS/g, 'fetchWithAuth(API_ENDPOINTS');
        content = content.replace(/fetch\(`\$\{API_ENDPOINTS/g, 'fetchWithAuth(`${API_ENDPOINTS');
        
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

walkDir(dir);
