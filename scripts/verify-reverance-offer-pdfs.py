"""Check the six-page offer QA matrix, including real browser downloads."""
from pathlib import Path
import fitz

files = list(Path('output/pdf/offer-redesign').glob('*.pdf'))
assert len(files) >= 18, 'Run PDF tests with PDF_QA_DIR=output/pdf/offer-redesign first.'
for source in files:
    assert source.stat().st_size < 4_000_000, source
    doc = fitz.open(source)
    assert len(doc) == 6, source
    assert 'AIXCO.Global' in doc[0].get_text(), source
    assert len(doc[0].get_images()) >= 2, source
    assert len(doc[2].get_images()) >= 2, source
    assert len(doc[3].get_images()) >= 1, source
    for page in doc:
        for x0, y0, x1, y1, *rest in page.get_text('words'):
            assert x0 >= 0 and y0 >= 0 and x1 <= page.rect.width and y1 <= page.rect.height, (source, page.number, rest)
    if source.stem.startswith('A'):
        assert source.stem in doc[0].get_text(), source
    if source.stem == 'long-ru':
        assert sum(word[4].count('Ж') for word in doc[0].get_text('words') if set(word[4]) == {'Ж'}) == 400
    if source.stem == 'en':
        assert 'Room examples' in doc[3].get_text()
        assert 'Gold = cash purchase' in doc[4].get_text()
        assert '135,248' in doc[1].get_text() and '182,529' in doc[1].get_text()
print(f'PASS: {len(files)} six-page offers, embedded plans and rooms, matching unit IDs, no out-of-page text, under 4 MB.')
