#!/usr/bin/env python3
"""Render RituChakra app icons from the brand mark.

Usage: python3 scripts/build-app-icons.py

Outputs (overwrites):
  assets/images/icon.png            1024x1024  cream bg, full mark      (iOS / general)
  assets/images/adaptive-icon.png   1024x1024  transparent, 0.74x mark  (Android adaptive fg)
  assets/images/splash-icon.png     1024x1024  transparent, 0.55x mark  (Expo splash)
  assets/images/favicon.png         48x48      cream bg, full mark      (web)
"""
from __future__ import annotations

from pathlib import Path

import cairosvg

CREAM = "#FFF8F5"
ROSE = "#D49DAB"
PETAL = "M 0,0 A 400 400 0 0 1 0,-480 A 400 400 0 0 1 0,0 Z"
SIDE_ANGLE = 62

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "images"


def _mark(scale: float) -> str:
    inner = (
        f'<g transform="translate(512,752)" fill="{ROSE}">'
        f'<path id="petal" d="{PETAL}"/>'
        f'<use href="#petal" transform="rotate(-{SIDE_ANGLE})"/>'
        f'<use href="#petal" transform="rotate({SIDE_ANGLE})"/>'
        f'</g>'
    )
    if scale == 1.0:
        return inner
    return f'<g transform="translate(512,512) scale({scale}) translate(-512,-512)">{inner}</g>'


def _svg(scale: float, bg: str | None) -> str:
    bg_rect = f'<rect width="1024" height="1024" fill="{bg}"/>' if bg else ""
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">'
        f"{bg_rect}{_mark(scale)}</svg>"
    )


def _render(svg: str, name: str, size: int) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    target = OUT / name
    cairosvg.svg2png(
        bytestring=svg.encode(),
        write_to=str(target),
        output_width=size,
        output_height=size,
    )
    print(f"  {target.relative_to(ROOT)}  {size}x{size}")


def main() -> None:
    print("Rendering RituChakra app icons:")
    _render(_svg(1.0, CREAM), "icon.png", 1024)
    _render(_svg(0.74, None), "adaptive-icon.png", 1024)
    _render(_svg(0.55, None), "splash-icon.png", 1024)
    _render(_svg(1.0, CREAM), "favicon.png", 48)
    print("Done.")


if __name__ == "__main__":
    main()
