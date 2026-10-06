"""Turns the iPhone 6.9" screenshots into iPad 13" ones (2064x2752).

The iPhone shot is centred at full height on a blurred, cropped copy of itself.

Usage: python3 marketing/appstore/ipad.py [lang ...]
"""
import os
import sys
from PIL import Image, ImageFilter, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'iphone-6.9')
OUT = os.path.join(HERE, 'ipad-13')
SIZE = (2064, 2752)


def convert(path, dest):
    with Image.open(path) as img:
        img = img.convert('RGB')
        # Background: fill the canvas without stretching, then blur
        bg = ImageOps.fit(img, SIZE, Image.Resampling.LANCZOS)
        bg = bg.filter(ImageFilter.GaussianBlur(radius=40))
        fg = img.copy()
        fg.thumbnail(SIZE, Image.Resampling.LANCZOS)
        bg.paste(fg, ((SIZE[0] - fg.width) // 2, (SIZE[1] - fg.height) // 2))
        bg.save(dest, optimize=True)


langs = sys.argv[1:] or sorted(d for d in os.listdir(SRC) if os.path.isdir(os.path.join(SRC, d)))
for lang in langs:
    os.makedirs(os.path.join(OUT, lang), exist_ok=True)
    for name in sorted(os.listdir(os.path.join(SRC, lang))):
        if name.lower().endswith('.png'):
            convert(os.path.join(SRC, lang, name), os.path.join(OUT, lang, name))
    print(lang, 'done')
