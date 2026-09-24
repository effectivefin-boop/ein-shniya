#!/usr/bin/env python3
"""Generate Soft Sketch (נייר ועיפרון) illustration family for עין שנייה.

GenerateImage cursor tool was unavailable in this agent session — this script
produces a consistent soft-sketch family matching design/style-soft-sketch.png:
warm paper grain, imperfect teal strokes, coral ONLY on the gap mark, no text.
"""
from __future__ import annotations

import math
import os
import random
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

TEAL = (13, 92, 99)          # #0d5c63
CORAL = (224, 122, 95)       # #e07a5f
PAPER = (250, 246, 239)      # warm off-white
PAPER_DEEP = (245, 239, 228)

ROOT = Path("/workspace/checkup-site")
OUT_PUBLIC = ROOT / "public" / "illustrations"
OUT_DESIGN = ROOT / "design" / "illustrations"
OUT_PUBLIC.mkdir(parents=True, exist_ok=True)
OUT_DESIGN.mkdir(parents=True, exist_ok=True)


def paper_bg(w: int, h: int, seed: int = 42) -> Image.Image:
    rng = np.random.default_rng(seed)
    base = np.zeros((h, w, 3), dtype=np.float32)
    for i, c in enumerate(PAPER):
        base[:, :, i] = c
    # fine grain
    noise = rng.normal(0, 4.5, (h, w)).astype(np.float32)
    # subtle fiber streaks
    fiber = rng.normal(0, 1.8, (h, w)).astype(np.float32)
    fiber = Image.fromarray(((fiber - fiber.min()) / (np.ptp(fiber) + 1e-6) * 255).astype(np.uint8))
    fiber = fiber.filter(ImageFilter.GaussianBlur(radius=1.2))
    fiber_arr = np.asarray(fiber, dtype=np.float32) - 128
    grain = noise + fiber_arr * 0.15
    for i in range(3):
        base[:, :, i] = np.clip(base[:, :, i] + grain * (0.9 if i < 2 else 0.7), 0, 255)
    # very faint warmer patches
    yy, xx = np.mgrid[0:h, 0:w]
    patch = 3.5 * np.sin(xx / 90.0 + seed) * np.cos(yy / 110.0)
    base[:, :, 0] = np.clip(base[:, :, 0] + patch * 0.4, 0, 255)
    base[:, :, 1] = np.clip(base[:, :, 1] + patch * 0.2, 0, 255)
    img = Image.fromarray(base.astype(np.uint8), "RGB")
    return img


def wobble_line(draw, p1, p2, color, width, rng, steps=18, amp=2.2, alpha=255):
    """Draw a slightly imperfect polyline between two points."""
    x1, y1 = p1
    x2, y2 = p2
    pts = []
    for i in range(steps + 1):
        t = i / steps
        x = x1 + (x2 - x1) * t
        y = y1 + (y2 - y1) * t
        # perpendicular jitter
        dx, dy = x2 - x1, y2 - y1
        L = math.hypot(dx, dy) or 1
        nx, ny = -dy / L, dx / L
        j = rng.uniform(-amp, amp) * math.sin(t * math.pi)  # less at ends
        pts.append((x + nx * j, y + ny * j))
    # draw as overlapping short segments for soft stroke feel
    for i in range(len(pts) - 1):
        draw.line([pts[i], pts[i + 1]], fill=color + (alpha,) if len(color) == 3 else color, width=width)


def wobble_polyline(draw, points, color, width, rng, amp=2.0):
    for a, b in zip(points, points[1:]):
        wobble_line(draw, a, b, color, width, rng, amp=amp)


def wobble_rect(draw, box, color, width, rng, amp=1.8, fill=None):
    x0, y0, x1, y1 = box
    # slightly irregular corners
    tl = (x0 + rng.uniform(-amp, amp), y0 + rng.uniform(-amp, amp))
    tr = (x1 + rng.uniform(-amp, amp), y0 + rng.uniform(-amp, amp))
    br = (x1 + rng.uniform(-amp, amp), y1 + rng.uniform(-amp, amp))
    bl = (x0 + rng.uniform(-amp, amp), y1 + rng.uniform(-amp, amp))
    if fill is not None:
        draw.polygon([tl, tr, br, bl], fill=fill)
    wobble_polyline(draw, [tl, tr, br, bl, tl], color, width, rng, amp=amp * 0.6)


def coral_marker(draw, cx, cy, h, rng, thickness=10):
    """Thick imperfect C / parenthesis coral stroke — THE gap mark."""
    # vertical-ish arc opening left or right
    pts = []
    for i in range(16):
        t = i / 15
        y = cy - h / 2 + h * t
        # slight C curve
        x = cx + 10 * math.sin(t * math.pi) + rng.uniform(-1.2, 1.2)
        # dry-brush taper
        pts.append((x, y))
    # draw multiple offset strokes for marker texture
    for ox in (-thickness * 0.15, 0, thickness * 0.12):
        for i in range(len(pts) - 1):
            t = i / (len(pts) - 1)
            w = int(thickness * (0.55 + 0.45 * math.sin(t * math.pi)))
            a, b = pts[i], pts[i + 1]
            draw.line([(a[0] + ox, a[1]), (b[0] + ox, b[1])], fill=CORAL + (235,), width=max(3, w))
    # chalky ends
    for end in (pts[0], pts[-1]):
        for _ in range(6):
            r = rng.uniform(1.5, thickness * 0.35)
            cx = end[0] + rng.uniform(-thickness * 0.35, thickness * 0.35)
            cy = end[1] + rng.uniform(-thickness * 0.25, thickness * 0.25)
            draw.ellipse(
                [cx - r, cy - r, cx + r, cy + r],
                fill=CORAL + (90,),
            )


def guide_line(draw, y, x0, x1, rng):
    wobble_line(draw, (x0, y), (x1, y), TEAL, 1, rng, steps=28, amp=0.8, alpha=55)


def save_both(img: Image.Image, name: str):
    # slight overall softness
    out = img.filter(ImageFilter.SMOOTH_MORE)
    path_p = OUT_PUBLIC / name
    path_d = OUT_DESIGN / name
    out.save(path_p, "PNG", optimize=True)
    out.save(path_d, "PNG", optimize=True)
    print(f"wrote {path_p} ({out.size[0]}x{out.size[1]})")


def make_rgba_layer(w, h):
    return Image.new("RGBA", (w, h), (0, 0, 0, 0))


def compose(paper, layer):
    return Image.alpha_composite(paper.convert("RGBA"), layer).convert("RGB")


# ---------- HERO 16:9 ----------
def gen_hero():
    w, h = 1600, 900
    rng = random.Random(7)
    paper = paper_bg(w, h, seed=7)
    layer = make_rgba_layer(w, h)
    d = ImageDraw.Draw(layer, "RGBA")

    # Leave large empty area on the RIGHT for RTL headline (content on left-center)
    # Two L-ish / bar states: current (shorter) and possible (taller)
    # Positions biased to left-center so right ~40% stays open for copy overlay feel

    # faint construction guides
    for yy in (280, 520, 640):
        guide_line(d, yy, 120, 980, rng)

    # Current block (lower / shorter) — left
    wobble_rect(
        d, (180, 380, 420, 680), TEAL, 3, rng, amp=3.0,
        fill=TEAL + (28,),
    )
    # Possible block (taller) — middle
    wobble_rect(
        d, (520, 220, 780, 680), TEAL, 3, rng, amp=3.2,
        fill=TEAL + (18,),
    )

    # small imperfect top ledge on possible (like inverted L feel)
    wobble_polyline(
        d,
        [(520, 220), (860, 215), (865, 290), (780, 295)],
        TEAL, 2, rng, amp=2.5,
    )

    # dimension ticks
    wobble_line(d, (430, 380), (510, 225), TEAL, 1, rng, amp=1.2, alpha=80)

    # CORAL gap mark between the two blocks
    coral_marker(d, 470, 430, 220, rng, thickness=14)

    # tiny dots (measurement feel)
    for pt in [(200, 360), (400, 360), (540, 200), (760, 200)]:
        r = rng.uniform(2.5, 4)
        d.ellipse([pt[0] - r, pt[1] - r, pt[0] + r, pt[1] + r], fill=TEAL + (120,))

    save_both(compose(paper, layer), "hero-gap.png")


# ---------- Calculator cards (1:1 family) ----------
def _card_base(seed: int, size=1024):
    rng = random.Random(seed)
    paper = paper_bg(size, size, seed=seed)
    layer = make_rgba_layer(size, size)
    d = ImageDraw.Draw(layer, "RGBA")
    # faint guides common to family
    guide_line(d, int(size * 0.28), int(size * 0.12), int(size * 0.88), rng)
    guide_line(d, int(size * 0.72), int(size * 0.12), int(size * 0.88), rng)
    return paper, layer, d, rng, size


def _two_bars(d, rng, size, left_h_ratio, right_h_ratio, gap_y_center=None):
    """Shared metaphor: two vertical bars, coral gap between."""
    m = size
    base_y = int(m * 0.72)
    bar_w = int(m * 0.18)
    left_x = int(m * 0.22)
    right_x = int(m * 0.55)
    left_h = int(m * left_h_ratio)
    right_h = int(m * right_h_ratio)
    wobble_rect(
        d, (left_x, base_y - left_h, left_x + bar_w, base_y), TEAL, 3, rng, amp=2.5,
        fill=TEAL + (30,),
    )
    wobble_rect(
        d, (right_x, base_y - right_h, right_x + bar_w, base_y), TEAL, 3, rng, amp=2.5,
        fill=TEAL + (16,),
    )
    # coral between
    gap_x = (left_x + bar_w + right_x) // 2
    cy = gap_y_center or (base_y - (left_h + right_h) // 4)
    coral_marker(d, gap_x, cy, abs(right_h - left_h) * 0.7 + m * 0.12, rng, thickness=11)
    return base_y, left_x, right_x, bar_w


def gen_calc_pension():
    # stairs / levels — retirement horizon
    paper, layer, d, rng, m = _card_base(11)
    base = int(m * 0.75)
    steps = [(0.18, 0.28), (0.38, 0.42), (0.58, 0.58)]
    for i, (x_r, h_r) in enumerate(steps):
        x0 = int(m * x_r)
        h = int(m * h_r)
        w = int(m * 0.18)
        wobble_rect(d, (x0, base - h, x0 + w, base), TEAL, 3, rng, amp=2.2, fill=TEAL + (22 + i * 6,))
    # coral marks the missing step height between 2 and "possible" taller
    coral_marker(d, int(m * 0.52), int(m * 0.42), int(m * 0.22), rng, thickness=12)
    # soft arc horizon
    wobble_line(d, (int(m * 0.15), int(m * 0.30)), (int(m * 0.85), int(m * 0.22)), TEAL, 1, rng, amp=1.5, alpha=70)
    save_both(compose(paper, layer), "calc-pension-gap.png")


def gen_calc_fees():
    # two fee "stacks" / thickness — management fees
    paper, layer, d, rng, m = _card_base(22)
    _two_bars(d, rng, m, 0.38, 0.22)  # high fees (taller cost) vs low
    # small horizontal slices suggesting fee layers on left bar
    base = int(m * 0.72)
    left_x = int(m * 0.22)
    for yy in range(base - int(m * 0.35), base, 28):
        wobble_line(d, (left_x + 8, yy), (left_x + int(m * 0.16), yy), TEAL, 1, rng, amp=0.8, alpha=90)
    save_both(compose(paper, layer), "calc-management-fees.png")


def gen_calc_hishtalmut():
    # jar / pot outline without piggy — simple vessel + fill levels
    paper, layer, d, rng, m = _card_base(33)
    cx = int(m * 0.38)
    top, bot = int(m * 0.28), int(m * 0.72)
    # vessel outline (imperfect)
    pts = [
        (cx - int(m * 0.12), top),
        (cx - int(m * 0.16), bot),
        (cx + int(m * 0.16), bot),
        (cx + int(m * 0.12), top),
        (cx - int(m * 0.12), top),
    ]
    wobble_polyline(d, pts, TEAL, 3, rng, amp=2.0)
    # current fill
    fill_y = int(m * 0.52)
    wobble_polyline(
        d,
        [(cx - int(m * 0.145), fill_y), (cx + int(m * 0.145), fill_y - 4)],
        TEAL, 2, rng, amp=1.5,
    )
    d.polygon(
        [
            (cx - int(m * 0.14), fill_y),
            (cx - int(m * 0.155), bot - 4),
            (cx + int(m * 0.155), bot - 4),
            (cx + int(m * 0.14), fill_y - 4),
        ],
        fill=TEAL + (35,),
    )
    # possible level higher
    poss_y = int(m * 0.36)
    wobble_line(d, (cx - int(m * 0.13), poss_y), (cx + int(m * 0.13), poss_y), TEAL, 2, rng, amp=1.2, alpha=140)
    # coral gap between fill and possible
    coral_marker(d, cx + int(m * 0.22), (fill_y + poss_y) // 2, fill_y - poss_y, rng, thickness=11)
    save_both(compose(paper, layer), "calc-hishtalmut.png")


def gen_calc_compound():
    # growing curve / steps of compound — two trajectories
    paper, layer, d, rng, m = _card_base(44)
    base = int(m * 0.72)
    # slow path
    slow = []
    for i in range(8):
        t = i / 7
        x = int(m * (0.15 + 0.55 * t))
        y = int(base - m * 0.12 * (t ** 1.2))
        slow.append((x, y))
    wobble_polyline(d, slow, TEAL, 3, rng, amp=2.0)
    # fast compound path
    fast = []
    for i in range(8):
        t = i / 7
        x = int(m * (0.15 + 0.55 * t))
        y = int(base - m * 0.48 * (t ** 1.7))
        fast.append((x, y))
    wobble_polyline(d, fast, TEAL, 3, rng, amp=2.2)
    for p in (slow[-1], fast[-1], slow[0]):
        r = 4
        d.ellipse([p[0] - r, p[1] - r, p[0] + r, p[1] + r], fill=TEAL + (160,))
    # coral marks vertical gap at the end
    coral_marker(d, int(m * 0.78), (slow[-1][1] + fast[-1][1]) // 2, abs(slow[-1][1] - fast[-1][1]) * 0.85, rng, thickness=12)
    save_both(compose(paper, layer), "calc-compound-interest.png")


def gen_calc_savings():
    # target ring / goal vs current arc
    paper, layer, d, rng, m = _card_base(55)
    cx, cy = int(m * 0.42), int(m * 0.48)
    r = int(m * 0.22)
    # outer goal circle imperfect
    pts = []
    for i in range(36):
        a = i / 36 * 2 * math.pi
        j = rng.uniform(-3, 3)
        pts.append((cx + (r + j) * math.cos(a), cy + (r + j) * math.sin(a)))
    pts.append(pts[0])
    wobble_polyline(d, pts, TEAL, 3, rng, amp=1.2)
    # current progress arc (partial)
    r2 = int(m * 0.14)
    arc = []
    for i in range(20):
        a = -math.pi * 0.85 + i / 19 * math.pi * 1.1
        j = rng.uniform(-2, 2)
        arc.append((cx + (r2 + j) * math.cos(a), cy + (r2 + j) * math.sin(a)))
    wobble_polyline(d, arc, TEAL, 4, rng, amp=1.0)
    d.ellipse([cx - 6, cy - 6, cx + 6, cy + 6], fill=TEAL + (100,))
    # coral gap on the open part of the ring
    coral_marker(d, cx + int(r * 0.95), cy - int(r * 0.15), int(m * 0.18), rng, thickness=11)
    save_both(compose(paper, layer), "calc-savings-goal.png")


def gen_calc_early():
    # timeline / finish line closer vs farther
    paper, layer, d, rng, m = _card_base(66)
    y = int(m * 0.55)
    wobble_line(d, (int(m * 0.12), y), (int(m * 0.88), y), TEAL, 2, rng, amp=1.5, alpha=160)
    # current retirement tick (farther)
    x_now = int(m * 0.72)
    x_early = int(m * 0.42)
    for x, h in ((x_now, 70), (x_early, 90)):
        wobble_line(d, (x, y - h), (x, y + 18), TEAL, 3, rng, amp=1.2)
        wobble_line(d, (x - 18, y - h), (x + 18, y - h), TEAL, 2, rng, amp=1.0)
    # small flag-ish triangle on early (geometry only)
    wobble_polyline(
        d,
        [(x_early, y - 90), (x_early + 40, y - 75), (x_early, y - 60), (x_early, y - 90)],
        TEAL, 2, rng, amp=1.5,
    )
    # coral dimension between the two ticks
    mid = (x_now + x_early) // 2
    # horizontal coral bracket under the line
    thickness = 10
    yb = y + 48
    pts = [(x_early, yb - 8), (x_early, yb), (x_now, yb), (x_now, yb - 8)]
    for a, b in zip(pts, pts[1:]):
        wobble_line(d, a, b, CORAL, thickness if a[1] == b[1] else 6, rng, amp=1.2, alpha=230)
    # also a small vertical coral tick in the middle for "gap"
    coral_marker(d, mid, y - 30, 50, rng, thickness=9)
    save_both(compose(paper, layer), "calc-early-retirement.png")


def main():
    gen_hero()
    gen_calc_pension()
    gen_calc_fees()
    gen_calc_hishtalmut()
    gen_calc_compound()
    gen_calc_savings()
    gen_calc_early()
    print("done")


if __name__ == "__main__":
    main()
