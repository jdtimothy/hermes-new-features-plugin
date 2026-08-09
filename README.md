# Hermes New Features Plugin

A theme-native Hermes Desktop plugin that keeps a compact, release-organized guide to notable Hermes capabilities.

## Current behavior

- Groups feature cards by release, with **Prerelease** cards first.
- Lets a user mark a card as explored; exploration state is saved locally through `ctx.storage`.
- Dims explored cards, while restoring full visibility on hover for easy rereading.
- Uses Hermes theme variables only—no hard-coded colors.
- Ships opt-in (`defaultEnabled: false`), so it appears under **Settings → Plugins** without forcing itself on.

## Add or promote feature cards

Edit the `FEATURE_GROUPS` constant near the top of `plugin.js`:

1. Add unreleased items to the `Prerelease` group.
2. On a stable Hermes release, move its prerelease cards into that release’s group.
3. Add fresh preview items to `Prerelease`.

This keeps the catalog versioned with the plugin source while each user’s explored state remains local.

## Install for local development

Copy `plugin.js` into the **desktop app machine’s** plugin directory:

```bash
mkdir -p "$HERMES_HOME/desktop-plugins/hermes-new-features"
cp plugin.js "$HERMES_HOME/desktop-plugins/hermes-new-features/plugin.js"
```

Hermes Desktop hot-reloads desktop plugins. If it does not appear, use **⌘K → Reload desktop plugins**, then enable it in **Settings → Plugins**.

> When the desktop app uses a remote gateway, the plugin must be copied to the computer running the Electron desktop app—not the gateway host.

## Validate

```bash
npm test
node --check plugin.js
```

## License

MIT
