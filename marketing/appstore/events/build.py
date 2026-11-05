"""Render the in-app event artwork (event card 1920x1080 and details page 1080x1920) for every event.

    python3 marketing/appstore/events/build.py [scene ...]

Output: <scene>/card-1920x1080.png and <scene>/details-1080x1920.png next to this file.
The art has no text, so one pair of images serves every language. PNGs are flattened to RGB
because App Store Connect rejects an alpha channel.
"""
import subprocess
import sys
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
SCENES = ['zerowaste', 'feste', 'gennaio']
FORMATS = {'card': (1920, 1080), 'details': (1080, 1920)}


def render(scene: str, fmt: str) -> Path:
    w, h = FORMATS[fmt]
    out = HERE / scene / f'{fmt}-{w}x{h}.png'
    out.parent.mkdir(exist_ok=True)
    url = f'{(HERE / "event.html").as_uri()}?scene={scene}&fmt={fmt}'
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
    for scene in sys.argv[1:] or SCENES:
        for fmt in FORMATS:
            print(render(scene, fmt).relative_to(HERE))
