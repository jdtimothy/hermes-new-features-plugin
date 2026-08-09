import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('plugin provides a theme-native new-features pane with persistent exploration state', async () => {
  const source = await readFile(new URL('../plugin.js', import.meta.url), 'utf8');

  assert.match(source, /id:\s*'hermes-new-features'/);
  assert.match(source, /area:\s*'panes'/);
  assert.match(source, /ctx\.storage\.get/);
  assert.match(source, /ctx\.storage\.set/);
  assert.match(source, /var\(--ui-/);
  assert.match(source, /Prerelease/);
  assert.match(source, /explored/);
});

test('plugin registers a sidebar navigation item that opens its full page', async () => {
  const source = await readFile(new URL('../plugin.js', import.meta.url), 'utf8');

  assert.match(source, /SIDEBAR_NAV_AREA/);
  assert.match(source, /ROUTES_AREA/);
  assert.match(source, /path:\s*'\/hermes-new-features'/);
  assert.match(source, /label:\s*'What’s new'/);
});

test('plugin is plain ESM with only supported runtime imports', async () => {
  const source = await readFile(new URL('../plugin.js', import.meta.url), 'utf8');
  const imports = [...source.matchAll(/^import\s+.*?from\s+['"]([^'"]+)['"];?$/gm)].map((match) => match[1]);

  assert.deepEqual(imports.sort(), ['@hermes/plugin-sdk', 'react', 'react/jsx-runtime']);
  assert.doesNotMatch(source, /<\/?[A-Za-z]/);
});
