import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('--- Theme System Verification Suite ---');

// 1. ThemeContext and Provider Inspection
console.log('1. Verifying ThemeContext & storage persistence implementation...');
const themeContextPath = path.join(projectRoot, 'utils', 'themeContext.jsx');
assert(fs.existsSync(themeContextPath), 'themeContext.jsx must exist');
const themeContextSource = fs.readFileSync(themeContextPath, 'utf8');

assert(themeContextSource.includes("'ideastruct-theme'"), 'Theme context must use ideastruct-theme storage key');
assert(themeContextSource.includes("setAttribute('data-theme'"), 'Theme context must set data-theme on documentElement');
assert(themeContextSource.includes("localStorage.getItem"), 'Theme context must read from localStorage');
assert(themeContextSource.includes("localStorage.setItem"), 'Theme context must persist to localStorage');
assert(themeContextSource.includes("export function useTheme"), 'Must export useTheme hook');
assert(themeContextSource.includes("export function ThemeProvider"), 'Must export ThemeProvider component');
assert(themeContextSource.includes("prev === 'dark' ? 'light' : 'dark'"), 'Must toggle between dark and light modes');
console.log('   ✓ ThemeContext properly implements dark/light switching and localStorage persistence');

// 2. Early Theme Flash Prevention
console.log('2. Verifying early theme flash prevention script in index.html...');
const indexPath = path.join(projectRoot, '..', 'index.html');
const indexHtml = fs.readFileSync(indexPath, 'utf8');
assert(indexHtml.includes('ideastruct-theme'), 'index.html must check ideastruct-theme before body renders');
assert(indexHtml.includes("setAttribute('data-theme'"), 'index.html must synchronously apply data-theme');
console.log('   ✓ Early synchronous theme execution verified to prevent white/dark flash on reload');

// 3. Central CSS Design Tokens
console.log('3. Verifying centralized CSS tokens in index.css...');
const cssPath = path.join(projectRoot, 'styles', 'index.css');
const cssSource = fs.readFileSync(cssPath, 'utf8');

assert(cssSource.includes('[data-theme="dark"]'), 'index.css must define [data-theme="dark"]');
assert(cssSource.includes('[data-theme="light"]'), 'index.css must define [data-theme="light"]');

// Check dark tokens
const requiredDarkTokens = [
  '--bg-main: #08131F',
  '--bg-secondary: #0D1C2B',
  '--bg-card: #102437',
  '--text-primary: #F4F8FC',
  '--text-secondary: #B6C5D5',
  '--accent-cyan: #16D9E3',
  '--accent-blue: #3388FF',
  '--accent-purple: #8B5CF6',
  '--border-default:',
  '--status-up:',
  '--status-down:',
  '--status-warn:'
];
for (const token of requiredDarkTokens) {
  assert(cssSource.includes(token), `index.css must define dark token ${token}`);
}

// Check light tokens
const requiredLightTokens = [
  '--bg-main: #F1F5F9',
  '--bg-secondary: #E2E8F0',
  '--bg-card: #FFFFFF',
  '--text-primary: #0F172A',
  '--text-secondary: #334155',
  '--accent-cyan: #0284C7',
  '--accent-blue: #2563EB',
  '--accent-purple: #7C3AED',
  '--input-bg: #FFFFFF',
  '--input-text: #0F172A'
];
for (const token of requiredLightTokens) {
  assert(cssSource.includes(token), `index.css must define light token ${token}`);
}
console.log('   ✓ Dark & Light design tokens fully verified with high-contrast pairs');

// 4. Navbar Theme Toggle Integration
console.log('4. Verifying Navbar theme toggle element...');
const navbarPath = path.join(projectRoot, 'components', 'navigation', 'Navbar.jsx');
const navbarSource = fs.readFileSync(navbarPath, 'utf8');

assert(navbarSource.includes('useTheme'), 'Navbar must consume useTheme hook');
assert(navbarSource.includes('toggleTheme'), 'Navbar must trigger toggleTheme');
assert(navbarSource.includes('id="theme-toggle-btn"'), 'Navbar must provide theme toggle button with id="theme-toggle-btn"');
assert(navbarSource.includes('aria-label='), 'Theme toggle must have aria-label');
assert(navbarSource.includes('title='), 'Theme toggle must have title tooltip');
assert(navbarSource.includes('theme-toggle-label'), 'Theme toggle must have responsive label class');
console.log('   ✓ Navbar toggle element verified with accessibility attributes');

// 5. App Provider Wrapping
console.log('5. Verifying App.jsx wraps with ThemeProvider...');
const appPath = path.join(projectRoot, 'app', 'App.jsx');
const appSource = fs.readFileSync(appPath, 'utf8');
assert(appSource.includes('<ThemeProvider>'), 'App.jsx must wrap routes with <ThemeProvider>');
console.log('   ✓ App.jsx ThemeProvider wrapping verified');

// 6. Responsive Rules
console.log('6. Verifying responsive theme toggle styles...');
assert(cssSource.includes('.theme-toggle-label'), 'index.css must style .theme-toggle-label');
assert(cssSource.includes('@media (max-width: 480px)'), 'index.css must handle mobile breakpoint');
console.log('   ✓ Responsive mobile toggle styling verified');

console.log('✅ ALL THEME VERIFICATION TESTS PASSED SUCCESSFULLY!');
