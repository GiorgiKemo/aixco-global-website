"""Add a stable dollar glyph to the site's bundled Gilroy Regular font.

Gilroy omits U+0024, so browsers otherwise substitute a platform-dependent
dollar even while the surrounding figures remain Gilroy.
"""

from pathlib import Path

from fontTools.misc.transform import Transform
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src/assets/fonts/gilroy/Gilroy-Regular.woff2"
OUTPUT = ROOT / "src/assets/fonts/gilroy/Gilroy-Currency-Regular.woff2"

# Normalize the S body to the same 700-unit cap height as Gilroy's figures.
BODY_SCALE_Y = 700 / 724
BODY_Y_OFFSET = 12 * BODY_SCALE_Y

# This 20-unit center rule is exactly 20% lighter than the former 25-unit rule.
STROKE_WIDTH = 20
GLYPH_CENTER_X = 290
STROKE_BOTTOM = -45
STROKE_TOP = 745


def build() -> None:
    font = TTFont(SOURCE)
    glyph_set = font.getGlyphSet()
    glyph_order = [name for name in font.getGlyphOrder() if name != "dollar"]
    glyph_order.append("dollar")
    font.setGlyphOrder(glyph_order)

    pen = TTGlyphPen(glyph_set)
    transform = Transform(1, 0, 0, BODY_SCALE_Y, 0, BODY_Y_OFFSET)
    glyph_set["S"].draw(TransformPen(pen, transform))

    left = GLYPH_CENTER_X - STROKE_WIDTH / 2
    right = GLYPH_CENTER_X + STROKE_WIDTH / 2
    pen.moveTo((left, STROKE_BOTTOM))
    pen.lineTo((right, STROKE_BOTTOM))
    pen.lineTo((right, STROKE_TOP))
    pen.lineTo((left, STROKE_TOP))
    pen.closePath()

    font["glyf"]["dollar"] = pen.glyph()
    font["hmtx"]["dollar"] = (580, 25)
    for table in font["cmap"].tables:
        if table.isUnicode():
            table.cmap[0x24] = "dollar"

    font.flavor = "woff2"
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    font.save(OUTPUT)
    print(f"Built {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    build()
