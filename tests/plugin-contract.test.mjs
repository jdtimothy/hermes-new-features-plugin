import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('plugin provides a theme-native new-features pane with persistent exploration state', async () => {
  const source = await readFile(new URL('../plugin.js', import.meta.url), 'utf8');

  assert.match(source, /const ID\s*=\s*'hermes-new-features'/);
  assert.match(source, /area:\s*ROUTES_AREA/);
  assert.match(source, /storage\.get/);
  assert.match(source, /storage\.set/);
  assert.match(source, /--ui-/);
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

test('plugin uses a compact native dashboard card system instead of inline card styling', async () => {
  const source = await readFile(new URL('../plugin.js', import.meta.url), 'utf8');

  assert.match(source, /Codicon/);
  assert.match(source, /Badge/);
  assert.match(source, /rounded-lg/);
  assert.match(source, /grid-cols-1/);
  assert.match(source, /hover:bg-\(--ui-bg-tertiary\)/);
  assert.doesNotMatch(source, /const styles\s*=/);
});

test('plugin is plain ESM with only supported runtime imports', async () => {
  const source = await readFile(new URL('../plugin.js', import.meta.url), 'utf8');

  assert.match(source, /from '@hermes\/plugin-sdk'/);
  assert.match(source, /from 'react'/);
  assert.match(source, /from 'react\/jsx-runtime'/);
  assert.doesNotMatch(source, /from ['"](?!@hermes\/plugin-sdk|react|react\/jsx-runtime)[^'"]+['"]/);
  assert.doesNotMatch(source, /<\/?[A-Za-z]/);
});
