"""Trace the supplied monochrome mark into native SVG assets.

Usage: python tools/trace-logo.py path/to/PROFILE.png
The dark ink is traced directly; the photograph's paper is excluded.
"""

import sys
from pathlib import Path

import numpy as np
from PIL import Image


def normalize(vector):
    return vector / max(np.linalg.norm(vector), 1e-12)


def smooth_contour(points):
    """Remove pixel stair steps at uniform arc-length intervals, not image scale."""
    closed = np.array(points + [points[0]], dtype=float)
    distance = np.r_[0, np.cumsum(np.linalg.norm(np.diff(closed, axis=0), axis=1))]
    count = max(16, int(np.ceil(distance[-1] / 0.75)))
    sample = np.linspace(0, distance[-1], count, endpoint=False)
    curve = np.column_stack([np.interp(sample, distance, closed[:, axis]) for axis in range(2)])
    sigma = 2.0 / (distance[-1] / count)
    radius = int(np.ceil(3 * sigma))
    offsets = np.arange(-radius, radius + 1)
    weights = np.exp(-0.5 * (offsets / sigma) ** 2)
    weights /= weights.sum()
    return sum(weight * np.roll(curve, int(offset), axis=0) for offset, weight in zip(offsets, weights))


def fit_cubics(points, tangent_start, tangent_end, tolerance=0.28):
    """Fit smooth cubic Beziers to the silhouette with subpixel accuracy."""
    if len(points) == 2:
        length = np.linalg.norm(points[1] - points[0]) / 3
        return [np.array([points[0], points[0] + length * tangent_start,
                          points[1] + length * tangent_end, points[1]])]
    distance = np.r_[0, np.cumsum(np.linalg.norm(np.diff(points, axis=0), axis=1))]
    t = distance / distance[-1]
    b = np.column_stack([(1 - t) ** 3, 3 * t * (1 - t) ** 2, 3 * t ** 2 * (1 - t), t ** 3])
    a = np.stack([b[:, 1, None] * tangent_start, b[:, 2, None] * tangent_end], axis=2).reshape(-1, 2)
    base = (b[:, 0] + b[:, 1])[:, None] * points[0] + (b[:, 2] + b[:, 3])[:, None] * points[-1]
    alpha = np.linalg.lstsq(a, (points - base).reshape(-1), rcond=None)[0]
    if np.any(alpha < distance[-1] * 1e-6):
        alpha[:] = np.linalg.norm(points[-1] - points[0]) / 3
    cubic = np.array([points[0], points[0] + alpha[0] * tangent_start,
                      points[-1] + alpha[1] * tangent_end, points[-1]])
    error = np.linalg.norm(b @ cubic - points, axis=1)
    split = int(np.argmax(error))
    if error[split] <= tolerance:
        return [cubic]
    split = min(max(split, 1), len(points) - 2)
    middle = normalize(points[split - 1] - points[split + 1])
    return (fit_cubics(points[:split + 1], tangent_start, middle, tolerance)
            + fit_cubics(points[split:], -middle, tangent_end, tolerance))


def svg_point(point):
    return ','.join(f'{value:.2f}'.rstrip('0').rstrip('.') for value in point)


image = np.array(Image.open(sys.argv[1]).convert('RGB'))
ink = image.max(axis=2) < 100
y, x = np.where(ink)
left, top, right, bottom = x.min(), y.min(), x.max() + 1, y.max() + 1
ink = ink[top:bottom, left:right]
height, width = ink.shape
edges = {}
for y, x in zip(*np.where(ink)):
    if y == 0 or not ink[y - 1, x]:
        edges[(x, y)] = (x + 1, y)
    if x == width - 1 or not ink[y, x + 1]:
        edges[(x + 1, y)] = (x + 1, y + 1)
    if y == height - 1 or not ink[y + 1, x]:
        edges[(x + 1, y + 1)] = (x, y + 1)
    if x == 0 or not ink[y, x - 1]:
        edges[(x, y + 1)] = (x, y)

contours = []
while edges:
    start = next(iter(edges))
    points = [start]
    current = edges.pop(start)
    while current != start and current in edges:
        points.append(current)
        current = edges.pop(current)
    if len(points) < 12:
        continue
    points = smooth_contour(points)
    split = int(np.argmax(np.linalg.norm(points - points[0], axis=1)))
    first_tangent = normalize(points[1] - points[-1])
    middle_tangent = normalize(points[split + 1] - points[split - 1])
    cubics = (fit_cubics(points[:split + 1], first_tangent, -middle_tangent)
              + fit_cubics(np.vstack([points[split:], points[0]]), middle_tangent, -first_tangent))
    contour = 'M' + svg_point(points[0])
    for cubic in cubics:
        contour += 'C' + ' '.join(svg_point(point) for point in cubic[1:])
    contours.append(contour + 'Z')

art = f'<path id="logo-art" fill-rule="evenodd" d="{"".join(contours)}"/>'
root = Path(__file__).resolve().parents[1] / 'assets'
viewbox = f'-8 -8 {width + 16} {height + 16}'
(root / 'logo.svg').write_text(
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{viewbox}" shape-rendering="geometricPrecision">{art}</svg>\n', encoding='utf-8')

# A pen follows the original flourishes and loops, revealing the traced ink.
pen = ('M5 49 C-2 6 143 42 192 45 C222 46 245 37 257 28 '
       'L248 65 Q246 102 280 44 C268 95 290 134 315 85 '
       'C340 44 347 -11 324 6 C307 22 306 82 332 71 '
       'C354 69 376 39 385 20 C399 -9 359 -3 356 27 '
       'C354 50 398 95 375 116 C341 148 318 99 367 85 '
       'C404 69 407 27 446 23 C517 16 662 65 663 25')
(root / 'logo-animated.svg').write_text(f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{viewbox}" shape-rendering="geometricPrecision">
  <style>
    .pen {{ stroke-dasharray: 1; stroke-dashoffset: 1; animation: write 2s linear .1s forwards; }}
    .finish {{ opacity: 0; animation: finish .35s ease-in-out 1.75s forwards; }}
    @keyframes write {{ to {{ stroke-dashoffset: 0; }} }}
    @keyframes finish {{ to {{ opacity: 1; }} }}
    @media (prefers-reduced-motion: reduce) {{ .pen {{ animation: none; }} .finish {{ animation: none; opacity: 1; }} }}
  </style>
  <defs>
    <mask id="handwriting" maskUnits="userSpaceOnUse" x="-8" y="-8" width="{width + 16}" height="{height + 16}">
      <path class="pen" d="{pen}" pathLength="1" fill="none" stroke="white" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
      <rect class="finish" x="-8" y="-8" width="{width + 16}" height="{height + 16}" fill="white"/>
    </mask>
  </defs>
  <g fill="white" mask="url(#handwriting)">{art}</g>
</svg>
''', encoding='utf-8')

# Use the entire signature, including both flourishes, for the favicon.
(root / 'favicon.svg').write_text(f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" shape-rendering="geometricPrecision">
  <rect width="160" height="160" rx="34" fill="#26141b"/>
  <svg x="6" y="8" width="148" height="144" viewBox="{viewbox}" fill="white">{art}</svg>
</svg>
''', encoding='utf-8')
print(f'Traced {len(contours)} contours from {width} x {height} ink bounds.')
