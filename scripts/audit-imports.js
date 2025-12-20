import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Patterns to match imports
const importPatterns = [
  /from\s+['"]([^'"]+)['"]/g,
  /require\(['"]([^'"]+)['"]\)/g,
  /import\s+['"]([^'"]+)['"]/g
];

// Node.js built-in modules
const nodeBuiltIns = new Set([
  'fs', 'path', 'http', 'https', 'crypto', 'util', 'stream', 'events',
  'child_process', 'module', 'os', 'url', 'querystring', 'buffer',
  'process', 'assert', 'cluster', 'dgram', 'dns', 'net', 'perf_hooks',
  'readline', 'repl', 'string_decoder', 'tls', 'tty', 'vm', 'zlib',
  'worker_threads', 'timers', 'punycode', 'v8', 'inspector'
]);

// Exclude patterns
const excludePatterns = [
  /^\./,           // Relative imports
  /^@\//,          // Path aliases
  /^@shared/,       // Shared path alias
  /^@assets/,       // Assets path alias
  /^node:/,         // Node built-ins
  /^http:/,         // HTTP URLs
  /^https:/,        // HTTPS URLs
  /^data:/,         // Data URLs
];

function extractImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const imports = new Set();
  
  for (const pattern of importPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const importPath = match[1];
      // Check if should be excluded
      if (!excludePatterns.some(exclude => exclude.test(importPath))) {
        // Extract package name
        let packageName;
        if (importPath.startsWith('@')) {
          // Scoped package: @scope/package or @scope/package/path
          const parts = importPath.split('/');
          packageName = parts.length >= 2 ? `${parts[0]}/${parts[1]}` : parts[0];
        } else {
          // Regular package: package or package/path
          packageName = importPath.split('/')[0];
        }
        
        // Skip Node.js built-ins
        if (!nodeBuiltIns.has(packageName) && packageName && !packageName.startsWith('.')) {
          // Filter out false positives (phrases with spaces, single common words)
          const hasSpace = packageName.includes(' ');
          const isCommonWord = ['strategic', 'jaw', 'dropping', 'AI'].some(word => 
            packageName.toLowerCase().includes(word.toLowerCase())
          );
          
          if (!hasSpace && !isCommonWord) {
            imports.add(packageName);
          }
        }
      }
    }
  }
  
  return imports;
}

function scanDirectory(dir, extensions) {
  const imports = new Set();
  
  function scan(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      
      // Skip node_modules, dist, build, etc.
      if (entry.name === 'node_modules' || 
          entry.name === 'dist' || 
          entry.name === 'build' ||
          entry.name === '.git' ||
          entry.name.startsWith('.')) {
        continue;
      }
      
      if (entry.isDirectory()) {
        scan(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (extensions.includes(ext)) {
          try {
            const fileImports = extractImports(fullPath);
            fileImports.forEach(imp => imports.add(imp));
          } catch (err) {
            // Skip files that can't be read
          }
        }
      }
    }
  }
  
  scan(dir);
  return imports;
}

// Scan directories
console.log('Scanning server imports...');
const serverImports = scanDirectory(path.join(projectRoot, 'server'), ['.ts', '.js']);

console.log('Scanning client imports...');
const clientImports = scanDirectory(path.join(projectRoot, 'client/src'), ['.ts', '.tsx', '.js', '.jsx']);

console.log('Scanning shared imports...');
const sharedImports = scanDirectory(path.join(projectRoot, 'shared'), ['.ts', '.js']);

// Combine all imports
const allImports = new Set([...serverImports, ...clientImports, ...sharedImports]);

// Read package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
const installedDeps = new Set([
  ...Object.keys(packageJson.dependencies || {}),
  ...Object.keys(packageJson.devDependencies || {}),
  ...Object.keys(packageJson.optionalDependencies || {})
]);

// Find missing - check if package or any scoped variant is installed
const missing = [];
const installed = [];

for (const imp of allImports) {
  let found = false;
  
  // Check exact match
  if (installedDeps.has(imp)) {
    found = true;
  } else if (imp.startsWith('@')) {
    // For scoped packages, check if any package with same scope is installed
    const scope = imp.split('/')[0];
    for (const dep of installedDeps) {
      if (dep.startsWith(scope + '/')) {
        found = true;
        break;
      }
    }
  }
  
  if (found) {
    installed.push(imp);
  } else {
    missing.push(imp);
  }
}

// Generate report
const report = {
  summary: {
    totalImports: allImports.size,
    installed: installed.length,
    missing: missing.length
  },
  missing: Array.from(missing).sort(),
  installed: Array.from(installed).sort(),
  allImports: Array.from(allImports).sort()
};

fs.writeFileSync(
  path.join(projectRoot, 'DEPENDENCY_AUDIT_REPORT.json'),
  JSON.stringify(report, null, 2)
);

console.log('\n=== AUDIT COMPLETE ===');
console.log(`Total unique imports: ${allImports.size}`);
console.log(`Installed: ${installed.length}`);
console.log(`Missing: ${missing.length}`);
console.log('\nMissing packages:');
missing.forEach(pkg => console.log(`  - ${pkg}`));
console.log(`\nReport saved to: DEPENDENCY_AUDIT_REPORT.json`);

