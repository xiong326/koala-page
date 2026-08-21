# Webfont deployment

The app self-hosts Chill Round Gothic as an on-demand CJK webfont family.
Production data can introduce new koala names, nicknames, and tags without a
font rebuild or a frontend deployment.

## Runtime layout

- `*-core.woff2` contains all characters currently present in the repository.
- `*-uXXXX.woff2` files cover the remainder of the complete source font cmap in
  256-codepoint windows.
- `font-faces.css` assigns an exact `unicode-range` to every shard, so browsers
  fetch only the files required by text on the current page.
- Vite fingerprints every generated font asset. Cloudflare Pages serves
  `/assets/*` with a one-year immutable browser cache via `public/_headers`.
- `vite.config.js` disables asset inlining so rare, small shards never inflate
  the main CSS bundle.

The generated output contains 27,183 codepoints across Regular, Medium, and
Bold. The three core files total roughly 354 KiB; the complete deployable font
family is roughly 16.24 MiB. Visitors do not download the complete family.

## When to rebuild

Do not rebuild fonts when D1 data changes. Rebuild only when upgrading the
upstream font or when intentionally refreshing the optimized core character
set after a large UI/content change. Missing core characters are still served
by the complete fallback shards.

## Rebuilding from the upstream font

Source: <https://github.com/Warren2060/ChillRoundGothic>

Install the local generation tools:

```bash
python3 -m pip install fonttools==4.63.0 brotli==1.2.0
```

Run:

```bash
python3 scripts/build-font-shards.py \
  --regular /path/to/ChillRoundGothic_Regular.ttf \
  --medium /path/to/ChillRoundGothic_Medium.ttf \
  --bold /path/to/ChillRoundGothic_Bold.ttf
```

Checksums of the source files used for the current generated assets:

```text
Regular b73776f591bae1b64a949ff9b527614919bfff7c6987367e68e57ad0af6468cc
Medium  7aaf168681f168b9f550734d9e25058ffe73213db07d7a50152d5446dd9e7094
Bold    dee7faf4ad8ad99720b3ffd045f3bfe4f22b8168f7cc70812aca6d1d95529dae
```

The font is distributed under the SIL Open Font License. Keep
`public/fonts/OFL-ChillRoundGothic.txt` with every deployment and source
distribution.
