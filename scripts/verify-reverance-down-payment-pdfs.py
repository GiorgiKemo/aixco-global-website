"""Validate exported payment values, assumptions, and page bounds after PDF QA tests."""
from pathlib import Path
import fitz

directory = Path('output/pdf/down-payment')
for lang in ['en', 'de', 'pl', 'sl', 'ru']:
    doc = fitz.open(directory / f'down-payment-30-{lang}.pdf')
    assert len(doc) == 6
    payment = doc[1].get_text()
    assert payment.count('(30%)') == 2, lang
    assert '30%' in doc[5].get_text(), lang
    assert '216' in payment, lang
    for page in doc:
        for x0, y0, x1, y1, *word in page.get_text('words'):
            assert 0 <= x0 < x1 <= page.rect.width and 0 <= y0 < y1 <= page.rect.height, (lang, page.number, word)

doc = fitz.open(directory / 'down-payment-30-en.pdf')
payment = doc[1].get_text()
for expected in ['15,552', '216', '31,104', '20,736', '1,512', '135,248', '182,529']:
    assert expected in payment, expected
for percent in [0, 50, 100]:
    doc = fitz.open(directory / f'down-payment-{percent}-en.pdf')
    assert doc[1].get_text().count(f'Down payment ({percent}%)') == 2
    assert f'{percent}%' in doc[5].get_text()
    if percent == 100:
        assert 'Selected financing (0%)' in doc[1].get_text()
        assert doc[1].get_text().count('€0 × 24') == 2
print('PASS: five translated 30% offers and 0/50/100% boundaries have matching payments and assumptions; no out-of-page text.')
