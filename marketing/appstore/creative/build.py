"""Render the App Store creative assets (product page header and search results) for every language.

    python3 marketing/appstore/creative/build.py [lang ...]

Output: <lang>/universal-5244x2950.png and <lang>/header-3840x1646.png next to this file.
App Store Connect rejects images with an alpha channel, so every PNG is flattened to RGB.
"""
import subprocess
import sys
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
LANGS = ['it', 'en', 'es', 'fr', 'de', 'pt', 'nl', 'pl', 'ja', 'ko']
FORMATS = {'universal': (5244, 2950), 'header': (3840, 1646)}


def render(lang: str, fmt: str) -> Path:
    w, h = FORMATS[fmt]
    out = HERE / lang / f'{fmt}-{w}x{h}.png'
    out.parent.mkdir(exist_ok=True)
    url = f'{(HERE / "template.html").as_uri()}?lang={lang}&fmt={fmt}'
    subprocess.run([
        CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
        '--allow-file-access-from-files', '--virtual-time-budget=4000',
        f'--window-size={w},{h}', f'--screenshot={out}', url,
    ], check=True, capture_output=True)
    img = Image.open(out)
    assert img.size == (w, h), f'{out.name}: got {img.size}'
    img.convert('RGB').save(out, optimize=True)
    return out


if __name__ == '__main__':
    for lang in sys.argv[1:] or LANGS:
        for fmt in FORMATS:
            print(render(lang, fmt).relative_to(HERE))
