#!/usr/bin/env python3
"""Build self-hosted, on-demand Chill Round Gothic webfont shards.

The generated font family has two layers:
1. A small core shard containing every character currently used by the app.
2. Complete fallback shards grouped into 256-codepoint Unicode windows.

Browsers download only the shards needed by text on the current page. Because
the fallback shards cover the complete source font cmap, production data can
introduce new names without requiring another frontend deployment.

Dependencies:
    python3 -m pip install fonttools brotli

Example:
    python3 scripts/build-font-shards.py \
      --regular /path/to/ChillRoundGothic_Regular.ttf \
      --medium /path/to/ChillRoundGothic_Medium.ttf \
      --bold /path/to/ChillRoundGothic_Bold.ttf
"""

from __future__ import annotations

import argparse
import shutil
from collections import defaultdict
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / "src" / "assets" / "fonts" / "chill-round-gothic"
TEXT_EXTENSIONS = {".css", ".html", ".js", ".jsx", ".json", ".md", ".txt"}
SHARD_SPAN = 0x100
WEIGHTS = {
    "regular": (400, "400"),
    "medium": (500, "500 600"),
    "bold": (700, "700"),
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--regular", type=Path, required=True)
    parser.add_argument("--medium", type=Path, required=True)
    parser.add_argument("--bold", type=Path, required=True)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    return parser.parse_args()


def collect_core_codepoints() -> set[int]:
    characters = {chr(codepoint) for codepoint in range(0x20, 0x100)}
    for base in (ROOT / "src", ROOT / "public"):
        for path in base.rglob("*"):
            if (
                path.is_file()
                and path.suffix.lower() in TEXT_EXTENSIONS
                and "assets/fonts/chill-round-gothic" not in path.as_posix()
            ):
                characters.update(path.read_text(encoding="utf-8", errors="ignore"))
    return {ord(character) for character in characters}


def unicode_cmap(font_path: Path) -> set[int]:
    font = TTFont(font_path, lazy=True)
    try:
        codepoints: set[int] = set()
        for table in font["cmap"].tables:
            if table.isUnicode():
                codepoints.update(table.cmap)
        return codepoints
    finally:
        font.close()


def compress_unicode_ranges(codepoints: set[int]) -> str:
    if not codepoints:
        raise ValueError("Cannot create unicode-range for an empty shard")

    ranges: list[str] = []
    start = previous = None
    for codepoint in sorted(codepoints):
        if start is None:
            start = previous = codepoint
            continue
        if codepoint == previous + 1:
            previous = codepoint
            continue
        ranges.append(format_range(start, previous))
        start = previous = codepoint
    ranges.append(format_range(start, previous))
    return ", ".join(ranges)


def format_range(start: int, end: int) -> str:
    return f"U+{start:X}" if start == end else f"U+{start:X}-{end:X}"


def subset_font(source: Path, destination: Path, codepoints: set[int]) -> None:
    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = ["*"]
    options.name_IDs = [0, 1, 2, 3, 4, 5, 6, 13, 14]
    options.name_legacy = True
    options.name_languages = [0x409, 0x804]
    options.notdef_glyph = True
    options.recommended_glyphs = True

    font = subset.load_font(str(source), options)
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(unicodes=codepoints)
    subsetter.subset(font)
    subset.save_font(font, str(destination), options)


def font_face(filename: str, css_weight: str, codepoints: set[int]) -> str:
    return "\n".join([
        "@font-face {",
        '  font-family: "Chill Round Gothic";',
        f'  src: url("./{filename}") format("woff2");',
        "  font-style: normal;",
        f"  font-weight: {css_weight};",
        "  font-display: swap;",
        f"  unicode-range: {compress_unicode_ranges(codepoints)};",
        "}",
    ])


def main() -> None:
    args = parse_args()
    sources = {
        "regular": args.regular.resolve(),
        "medium": args.medium.resolve(),
        "bold": args.bold.resolve(),
    }
    for source in sources.values():
        if not source.is_file():
            raise SystemExit(f"Font source not found: {source}")

    output = args.output.resolve()
    staging = output.with_name(f"{output.name}.staging")
    if staging.exists():
        shutil.rmtree(staging)
    staging.mkdir(parents=True)

    cmaps = {name: unicode_cmap(path) for name, path in sources.items()}
    complete_cmap = set.intersection(*cmaps.values())
    core = collect_core_codepoints() & complete_cmap
    remainder = complete_cmap - core
    shards: dict[int, set[int]] = defaultdict(set)
    for codepoint in remainder:
        shards[codepoint // SHARD_SPAN].add(codepoint)

    css: list[str] = [
        "/* Generated by scripts/build-font-shards.py. Do not edit manually. */",
        "",
    ]
    manifest_lines = [
        f"core_codepoints={len(core)}",
        f"complete_codepoints={len(complete_cmap)}",
        f"fallback_shards={len(shards)}",
        f"shard_span={SHARD_SPAN}",
    ]

    for name, source in sources.items():
        _, css_weight = WEIGHTS[name]
        core_filename = f"chill-round-gothic-{name}-core.woff2"
        print(f"Building {core_filename} ({len(core)} codepoints)", flush=True)
        subset_font(source, staging / core_filename, core)
        css.append(font_face(core_filename, css_weight, core))
        css.append("")

        for index, shard_id in enumerate(sorted(shards), start=1):
            codepoints = shards[shard_id] & cmaps[name]
            if not codepoints:
                continue
            filename = f"chill-round-gothic-{name}-u{shard_id:04x}.woff2"
            print(
                f"Building {name} fallback {index}/{len(shards)}: {filename}",
                flush=True,
            )
            subset_font(source, staging / filename, codepoints)
            css.append(font_face(filename, css_weight, codepoints))
            css.append("")

    (staging / "font-faces.css").write_text("\n".join(css), encoding="utf-8")
    (staging / "manifest.txt").write_text("\n".join(manifest_lines) + "\n", encoding="utf-8")

    if output.exists():
        shutil.rmtree(output)
    staging.rename(output)

    total_bytes = sum(path.stat().st_size for path in output.glob("*.woff2"))
    print(
        f"Done: {len(list(output.glob('*.woff2')))} files, "
        f"{total_bytes / 1024 / 1024:.2f} MiB total",
        flush=True,
    )


if __name__ == "__main__":
    main()
