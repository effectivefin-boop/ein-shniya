# Soft Sketch assets (נייר ועיפרון)

Locked style reference: `design/style-soft-sketch.png`

## GenerateImage note
Cursor `GenerateImage` / `GetDynamicTools` were **unavailable** in the executor session.
Workaround: `scripts/gen_soft_sketch.py` (Pillow) produces a consistent family matching the
reference — warm paper grain, imperfect teal strokes, coral **only** on the gap mark, no text.

Re-run:
```bash
.venv/bin/python scripts/gen_soft_sketch.py
```

## Public paths
- `/illustrations/hero-gap.png` (16:9)
- `/illustrations/calc-pension-gap.png`
- `/illustrations/calc-management-fees.png`
- `/illustrations/calc-hishtalmut.png`
- `/illustrations/calc-compound-interest.png`
- `/illustrations/calc-savings-goal.png`
- `/illustrations/calc-early-retirement.png`
- `/brand/mark.svg`, `favicon.svg`, `paper-dots.svg`, png favicons

Design copies under `design/illustrations/`.
