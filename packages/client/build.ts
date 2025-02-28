import { existsSync } from 'fs';
import { watch, rmdir } from 'fs/promises';

const shouldWatch = Bun.argv.includes('--watch');

if (shouldWatch) {
  await build();
  const watcher = watch('./src', { recursive: true });
  for await (const event of watcher) {
    if (event.filename?.endsWith('~')) {
      continue;
    }
    await build();
  }
} else {
  await build();
}

async function build() {
  console.log('Building...');
  console.time('Built successfully');
  if (existsSync('./dist')) {
    await rmdir('./dist', { recursive: true });
  }

  await Bun.spawn({
    cmd: ['tsc'],
    cwd: __dirname,
    stdout: 'inherit',
    stderr: 'inherit',
    stdin: 'inherit',
  }).exited;
  await Bun.build({
    entrypoints: ['./src/index.ts'],
    outdir: './dist/esm',
    format: 'esm',
  });
  await Bun.build({
    entrypoints: ['./src/index.ts'],
    outdir: './dist/cjs',
    format: 'cjs',
  });
  console.timeEnd('Built successfully');
}
