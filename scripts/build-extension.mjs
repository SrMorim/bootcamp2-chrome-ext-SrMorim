#!/usr/bin/env node
/**
 * Script para build da extensão Chrome
 * Copia arquivos necessários para dist/ e gera extension.zip
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import archiver from 'archiver';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

console.log('🔨 Iniciando build da extensão...\n');

// Limpar pasta dist
console.log('🗑️  Limpando pasta dist/...');
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir);

// Arquivos e pastas para copiar
const filesToCopy = [
  { src: 'manifest.json', dest: 'manifest.json' },
];

const dirsToCopy = [
  { src: 'src', dest: 'src' },
  { src: 'icons', dest: 'icons' },
];

// Copiar arquivos
console.log('📁 Copiando arquivos...');
filesToCopy.forEach(({ src, dest }) => {
  const srcPath = path.join(rootDir, src);
  const destPath = path.join(distDir, dest);

  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`  ✓ ${src}`);
  } else {
    console.warn(`  ⚠️  ${src} não encontrado`);
  }
});

// Copiar diretórios
console.log('📂 Copiando diretórios...');
dirsToCopy.forEach(({ src, dest }) => {
  const srcPath = path.join(rootDir, src);
  const destPath = path.join(distDir, dest);

  if (fs.existsSync(srcPath)) {
    fs.cpSync(srcPath, destPath, { recursive: true });
    console.log(`  ✓ ${src}/`);
  } else {
    console.warn(`  ⚠️  ${src}/ não encontrado`);
  }
});

// Gerar ZIP
console.log('\n📦 Gerando extension.zip...');
const zipPath = path.join(distDir, 'extension.zip');
const output = fs.createWriteStream(zipPath);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
  console.log(`  ✓ extension.zip criado (${sizeInMB} MB)`);
  console.log(`\n✅ Build completo!`);
  console.log(`📍 Arquivos em: ${distDir}`);
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);

// Adicionar conteúdo de dist/ ao ZIP (exceto o próprio ZIP)
archive.glob('**/*', {
  cwd: distDir,
  ignore: ['extension.zip']
});

await archive.finalize();
