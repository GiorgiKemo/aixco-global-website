"""Inspect real AIXCO browser downloads, including live-production offers."""
from pathlib import Path
import fitz

folder = Path('output/pdf/dual-site-audit')
files = list(folder.glob('*.pdf'))
assert len(files) >= 11
for source in files:
    doc = fitz.open(source)
    assert len(doc) == 6, source
    assert source.stat().st_size < 4_000_000, source
    assert 'AIXCO.Global' in doc[0].get_text()
    assert len(doc[0].get_images()) >= 2
    assert len(doc[2].get_images()) >= 2
    assert len(doc[3].get_images()) >= 1
    for page in doc:
        for x0, y0, x1, y1, *word in page.get_text('words'):
            assert 0 <= x0 < x1 <= page.rect.width and 0 <= y0 < y1 <= page.rect.height, (source, page.number, word)
    if source.stem.endswith('-30'):
        assert 'A1305' in doc[0].get_text()
        assert 'Łukasz' in doc[0].get_text() and 'Šmartinska' in doc[0].get_text()
        assert doc[1].get_text().count('(30%)') == 2
        assert '216' in doc[1].get_text()
        assert '30%' in doc[5].get_text()
    if source.stem == 'en-30':
        for number in ['15,552', '216', '31,104', '20,736', '1,512', '135,248', '182,529']:
            assert number in doc[1].get_text()
    if source.stem == 'webkit-100':
        assert doc[1].get_text().count('Down payment (100%)') == 2
        assert 'Selected financing (0%)' in doc[1].get_text()
        assert doc[1].get_text().count('€0 × 24') == 2
    if source.stem.startswith('live-'):
        assert 'A1401' in doc[0].get_text() and 'A1401' in doc[3].get_text()
        assert doc[1].get_text().count('(10%)') == 2
print(f'PASS: {len(files)} six-page browser offers, including live A1401 downloads; correct down payments, plans, room examples, private-client text and page bounds.')
