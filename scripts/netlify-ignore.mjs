import { execFileSync } from 'node:child_process';

const base = process.env.CACHED_COMMIT_REF;
const head = process.env.COMMIT_REF;

if (!base || !head) {
  process.exit(1);
}

try {
  const changed = execFileSync('git', ['diff', '--name-only', `${base}...${head}`], {
    encoding: 'utf8',
  })
    .split(/\r?\n/)
    .filter(Boolean);

  const onlyPriceListChanged = changed.length > 0 && changed.every((file) => file === 'src/data/arlista.json');
  if (onlyPriceListChanged) {
    console.log('Skipping build: the site reads the latest price list from GitHub at request time.');
    process.exit(0);
  }
} catch (error) {
  console.error('Could not determine changed files; continuing with the build.', error);
}

process.exit(1);
