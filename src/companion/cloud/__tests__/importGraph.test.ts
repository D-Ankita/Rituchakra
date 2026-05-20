import * as fs from 'fs';
import * as path from 'path';

/**
 * Static enforcement of the cloud boundary: no source file outside
 * src/companion/cloud/providers/** may import a network SDK
 * directly. CloudBoundary is the single chokepoint.
 *
 * If this test fails, you've leaked an SDK import into the rest of
 * the codebase — move the call behind a provider in
 * cloud/providers/.
 */

const SDK_IMPORT_PATTERNS = [
  /from\s+['"]@anthropic-ai\/sdk['"]/,
  /from\s+['"]@google\/(genai|generative-ai)['"]/,
  /from\s+['"]elevenlabs['"]/,
  /require\(['"]@anthropic-ai\/sdk['"]\)/,
  /require\(['"]@google\/(genai|generative-ai)['"]\)/,
  /require\(['"]elevenlabs['"]\)/,
];

const ROOT = path.resolve(__dirname, '..', '..', '..');
const PROVIDERS_DIR = path.join(ROOT, 'companion', 'cloud', 'providers');

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '__tests__') continue;
      walk(p, acc);
    } else if (entry.isFile()) {
      if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) acc.push(p);
    }
  }
  return acc;
}

describe('cloud boundary — static import graph', () => {
  it('no file outside cloud/providers/** imports an LLM SDK', () => {
    const files = walk(ROOT);
    const offenders: string[] = [];

    for (const file of files) {
      if (file.startsWith(PROVIDERS_DIR)) continue;
      const text = fs.readFileSync(file, 'utf8');
      for (const re of SDK_IMPORT_PATTERNS) {
        if (re.test(text)) {
          offenders.push(`${path.relative(ROOT, file)} matches ${re}`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});
