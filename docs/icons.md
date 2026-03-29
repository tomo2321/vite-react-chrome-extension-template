# Icons

The extension supports PNG icons at multiple sizes. Icons are placed in `public/icons/` and
automatically detected by the manifest at build time.

## Supported Sizes

| Size   | Used for                              |
| ------ | ------------------------------------- |
| 16 px  | App icon (small), action icon (small) |
| 32 px  | Action icon (medium)                  |
| 48 px  | App icon (medium), Extensions page    |
| 128 px | App icon (large), Chrome Web Store    |

Files must be named `icon16.png`, `icon32.png`, `icon48.png`, and `icon128.png`.

## Generating Icons with the Built-in Script

The `generate-icon` script renders short text (1–4 characters) to a PNG file using
[sharp](https://sharp.pixelplumbing.com/).

```bash
pnpm generate-icon <text> <output> [options]
```

### Options

| Option                     | Default       | Description                        |
| -------------------------- | ------------- | ---------------------------------- |
| `-s, --size <px>`          | `16`          | Icon size: `16`, `32`, `48`, `128` |
| `-c, --color <color>`      | `red`         | Text color (any CSS color value)   |
| `-b, --background <color>` | `transparent` | Background color or `transparent`  |

### Example — Generate a Full Icon Set

```bash
pnpm generate-icon "EX" public/icons/icon16.png  -s 16  -c white -b "#1a73e8"
pnpm generate-icon "EX" public/icons/icon32.png  -s 32  -c white -b "#1a73e8"
pnpm generate-icon "EX" public/icons/icon48.png  -s 48  -c white -b "#1a73e8"
pnpm generate-icon "EX" public/icons/icon128.png -s 128 -c white -b "#1a73e8"
```

Text longer than two characters is split into two rows of two characters each (e.g. `"ABCD"` → `"AB"` / `"CD"`).

## Using Custom Icons

Replace the generated PNGs with your own artwork. The manifest picks up any combination of
sizes automatically — you do not need to provide all four sizes.
