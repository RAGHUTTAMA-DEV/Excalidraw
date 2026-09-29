const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

async function build() {
  console.log('--- Building http-server bundle with esbuild ---');
  
  const rootDir = __dirname;
  const outfile = path.join(rootDir, 'index.js');
  const distDir = path.join(rootDir, 'dist');

  await esbuild.build({
    entryPoints: [path.join(rootDir, 'src/index.ts')],
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'cjs',
    outfile: outfile,
    footer: {
      js: 'module.exports = app;\nmodule.exports.default = app;',
    },
    logLevel: 'info',
  });

  // Keep dist/index.js in sync as well
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  fs.copyFileSync(outfile, path.join(distDir, 'index.js'));
  console.log('Copied bundle to dist/index.js');

  // Copy Prisma engine binaries and schema to runtime location
  const prismaGeneratedDir = path.join(rootDir, '../../packages/db/generated/prisma');
  if (fs.existsSync(prismaGeneratedDir)) {
    const files = fs.readdirSync(prismaGeneratedDir);
    for (const file of files) {
      if (file.endsWith('.node') || file.endsWith('.prisma')) {
        const srcFile = path.join(prismaGeneratedDir, file);
        fs.copyFileSync(srcFile, path.join(rootDir, file));
        fs.copyFileSync(srcFile, path.join(distDir, file));
        console.log(`Copied ${file} to serverless runtime location`);
      }
    }
  }

  console.log('--- http-server build complete! ---');
}

build().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
