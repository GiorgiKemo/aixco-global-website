from pathlib import Path

from fontTools.misc.transform import Transform
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.recordingPen import RecordingPen, replayRecording
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIRECTORY = PROJECT_ROOT / "src" / "assets" / "fonts" / "gilroy"
OUTPUT_DIRECTORY = SOURCE_DIRECTORY / "german"
REGULAR_FALLBACK = Path("C:/Windows/Fonts/GOTHIC.TTF")
BOLD_FALLBACK = Path("C:/Windows/Fonts/GOTHICB.TTF")


def cmap_for(font: TTFont) -> dict[int, str]:
    return {
        codepoint: glyph_name
        for table in font["cmap"].tables
        for codepoint, glyph_name in table.cmap.items()
    }


def recording_contours(glyph_set, glyph_name: str):
    recording = RecordingPen()
    glyph_set[glyph_name].draw(recording)
    contours = []
    current = []

    for operation in recording.value:
        current.append(operation)
        if operation[0] in {"closePath", "endPath"}:
            contours.append(current)
            current = []

    return contours


def contour_bounds(glyph_set, contour):
    pen = BoundsPen(glyph_set)
    replayRecording(contour, pen)
    return pen.bounds


def build_umlaut_glyph(font: TTFont, base_glyph_name: str, uppercase: bool):
    glyph_set = font.getGlyphSet()
    base = font["glyf"][base_glyph_name]
    i_glyph_name = cmap_for(font)[ord("i")]
    dot_contour = max(
        recording_contours(glyph_set, i_glyph_name),
        key=lambda contour: contour_bounds(glyph_set, contour)[1],
    )
    dot_bounds = contour_bounds(glyph_set, dot_contour)
    dot_width = dot_bounds[2] - dot_bounds[0]
    dot_y = dot_bounds[1]
    base_center = (base.xMin + base.xMax) / 2
    dot_gap = max(36, round(dot_width * 0.42))
    left_x = base_center - dot_gap / 2 - dot_width
    right_x = base_center + dot_gap / 2
    desired_y = 730 if uppercase else 606

    pen = TTGlyphPen(glyph_set)
    glyph_set[base_glyph_name].draw(pen)

    for desired_x in (left_x, right_x):
        transformed_pen = TransformPen(
            pen,
            Transform(1, 0, 0, 1, desired_x - dot_bounds[0], desired_y - dot_y),
        )
        replayRecording(dot_contour, transformed_pen)

    return pen.glyph()


def build_sharp_s_glyph(target_font: TTFont, fallback_font: TTFont):
    fallback_cmap = cmap_for(fallback_font)
    fallback_name = fallback_cmap[0x00DF]
    fallback_glyph = fallback_font["glyf"][fallback_name]
    fallback_height = fallback_glyph.yMax - fallback_glyph.yMin
    target_height = 716
    scale = target_height / fallback_height
    left = 24
    baseline_shift = -fallback_glyph.yMin * scale - 12

    pen = TTGlyphPen(None)
    transformed_pen = TransformPen(
        pen,
        Transform(scale, 0, 0, scale, left - fallback_glyph.xMin * scale, baseline_shift),
    )
    fallback_font.getGlyphSet()[fallback_name].draw(transformed_pen)
    glyph = pen.glyph()
    advance = round(fallback_font["hmtx"][fallback_name][0] * scale)
    return glyph, advance


def build_dieresis_mark(font: TTFont):
    glyph_set = font.getGlyphSet()
    i_glyph_name = cmap_for(font)[ord("i")]
    dot_contour = max(
        recording_contours(glyph_set, i_glyph_name),
        key=lambda contour: contour_bounds(glyph_set, contour)[1],
    )
    dot_bounds = contour_bounds(glyph_set, dot_contour)
    dot_width = dot_bounds[2] - dot_bounds[0]
    dot_gap = max(36, round(dot_width * 0.42))
    pen = TTGlyphPen(None)

    for desired_x in (-dot_gap / 2 - dot_width, dot_gap / 2):
        transformed_pen = TransformPen(
            pen,
            Transform(1, 0, 0, 1, desired_x - dot_bounds[0], -dot_bounds[1]),
        )
        replayRecording(dot_contour, transformed_pen)

    return pen.glyph()


def install_new_glyph(font: TTFont, glyph_name: str, glyph, metrics):
    if glyph_name not in font.getGlyphOrder():
        font.setGlyphOrder([*font.getGlyphOrder(), glyph_name])
    font["glyf"][glyph_name] = glyph
    font["hmtx"][glyph_name] = metrics


def write_extended_font(source_path: Path):
    font = TTFont(source_path)
    cmap = cmap_for(font)
    is_bold = any(weight in source_path.stem for weight in ("SemiBold", "ExtraBold", "Black"))
    fallback_font = TTFont(BOLD_FALLBACK if is_bold else REGULAR_FALLBACK)

    for codepoint, base_character in {
        0x00E4: "a",
        0x00C4: "A",
        0x00F6: "o",
        0x00D6: "O",
        0x00FC: "u",
        0x00DC: "U",
    }.items():
        target_name = cmap[codepoint]
        base_name = cmap[ord(base_character)]
        glyph = build_umlaut_glyph(font, base_name, base_character.isupper())
        font["glyf"][target_name] = glyph
        font["hmtx"][target_name] = font["hmtx"][base_name]
        for table in font["cmap"].tables:
            if table.platformID == 3:
                table.cmap[codepoint] = target_name

    sharp_s, sharp_s_advance = build_sharp_s_glyph(font, fallback_font)
    for codepoint in (0x00DF, 0x1E9E):
        target_name = cmap.get(codepoint, "brandSharpS" if codepoint == 0x00DF else "brandCapitalSharpS")
        install_new_glyph(font, target_name, sharp_s, (sharp_s_advance, 24))
        for table in font["cmap"].tables:
            if table.platformID == 3:
                table.cmap[codepoint] = target_name

    dieresis_name = cmap.get(0x0308, "brandCombiningDieresis")
    install_new_glyph(font, dieresis_name, build_dieresis_mark(font), (0, 0))
    for table in font["cmap"].tables:
        if table.platformID == 3:
            table.cmap[0x0308] = dieresis_name

    font["hhea"].ascent = max(font["hhea"].ascent, 850)
    font["OS/2"].usWinAscent = max(font["OS/2"].usWinAscent, 850)
    font.flavor = "woff2"
    OUTPUT_DIRECTORY.mkdir(parents=True, exist_ok=True)
    output_path = OUTPUT_DIRECTORY / source_path.name.replace(".woff2", "-German.woff2")
    font.save(output_path)
    print(output_path.relative_to(PROJECT_ROOT))


for source_font in sorted(SOURCE_DIRECTORY.glob("Gilroy-*.woff2")):
    write_extended_font(source_font)
