"""sources_img/ + raw/maps/ → assets/ (cropped, scaled; the page applies the grade). Run from the film folder."""
from PIL import Image
Image.MAX_IMAGE_PIXELS = None
import os
os.makedirs('assets', exist_ok=True)
def save(im, name, maxw=1920):
    im = im.convert('RGB')
    if im.width > maxw: im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
    im.save(f'assets/{name}.jpg', quality=90); print(name, im.size)
S = 'sources_img/'
for n in ['hirasawa_1951', 'hirasawa_c1920', 'hirasawa_trial_1948', 'horisaki', 'ikii', 'interrogation', 'kanda_extra', 'matsui', 'reenact', 'takagi', 'yamada']:
    save(Image.open(S + n + '.jpg'), n, 2400 if n == 'hirasawa_trial_1948' else 1920)
for n in ['awm_daiichi_a', 'awm_daiichi_b', 'awm_ddt_a', 'awm_ddt_b', 'awm_ddt_c']:   # crop the archive caption strip
    im = Image.open(S + n + '.jpg'); save(im.crop((0, 0, im.width, int(im.height * .955))), n)
M = Image.open('raw/maps/ams_tokyo_08.jpg')
save(M.crop((172, 212, 4806, 3884)), 'ams_sheet', 2600)          # inside the neatline
save(M.crop((172, 1300, 1772, 2380)), 'ams_toshima', 1600)        # Shiinamachi / Ikebukuro at 1:1
save(M.crop((170, 4195, 490, 4255)).resize((800, 150)), 'ams_legend', 800)          # "Built-up area, Bombed area"
# bombed vs built-up: the sheet colours built-up areas yellow and leaves bombed areas white (hatched);
# in greyscale they look alike, so darken the yellow → the bombed districts read light
import numpy as np
a = np.asarray(Image.open('assets/ams_sheet.jpg').convert('RGB')).astype(np.float32)
yel = np.clip(((a[..., 0] + a[..., 1]) / 2 - a[..., 2] - 40) / 60, 0, 1)
g = (a[..., 0] * .3 + a[..., 1] * .59 + a[..., 2] * .11)
out = g * (1 - .62 * yel)
Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save('assets/ams_bombed.jpg', quality=90); print('ams_bombed')
