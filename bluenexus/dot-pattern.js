class DotPattern {
  constructor(containerSelectorOrEl, options = {}) {
    this.container = (typeof containerSelectorOrEl === 'string')
        ? document.querySelector(containerSelectorOrEl)
        : containerSelectorOrEl;

    this.canvas = this.container.querySelector('.dot-pattern');
    this.ctx = this.canvas.getContext('2d');

    // keep a default (fallback) color
    this.defaultDotColor = options.dotColor || '#E9EBF7';

    // Outer border configuration
    this.outerDotSize = options.outerDotSize || 5;
    this.outerSpacing = options.outerSpacing || 20;
    this.outerInset = options.outerInset || 5;

    // Inner border configuration
    this.innerDotSize = options.innerDotSize || 5;
    this.innerSpacing = options.innerSpacing || 20;
    this.innerInset = options.innerInset || 16; // Distance from container edge

    this.dotColor = options.dotColor || '#E9EBF7';

    this.init();
  }
  readColorFromCanvas() {
    // supports either dot-color="..." or data-dot-color="..."
    const attr = this.canvas.getAttribute('dot-color') || this.canvas.getAttribute('data-dot-color');
    this.dotColor = (attr && attr.trim()) ? attr.trim() : this.defaultDotColor;
}
  init() {
    this.setupCanvas();
    this.drawDots();

    window.addEventListener('resize', () => {
      this.setupCanvas();
      this.drawDots();
    });
  }
  readSidesFromCanvas() {
    const el = this.canvas;

    const hasAny =
        el.hasAttribute('top') ||
        el.hasAttribute('right') ||
        el.hasAttribute('bottom') ||
        el.hasAttribute('left');

    this.visibleSides = hasAny
        ? {
            top: el.hasAttribute('top'),
            right: el.hasAttribute('right'),
            bottom: el.hasAttribute('bottom'),
            left: el.hasAttribute('left')
        }
        : { top: true, right: true, bottom: true, left: true };
}


  shouldDrawPoint(p, width, height) {
    const s = this.visibleSides || { top: true, right: true, bottom: true, left: true };

    const eps = 1; // px tolerance

    const onTop = p.y <= eps;
    const onBottom = p.y >= height - eps;
    const onLeft = p.x <= eps;
    const onRight = p.x >= width - eps;

    return (s.top && onTop) || (s.bottom && onBottom) || (s.left && onLeft) || (s.right && onRight);
  }

  setupCanvas() {
    const rect = this.container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;

    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);

    this.displayWidth = rect.width;
    this.displayHeight = rect.height;
  }

  getBorderRadius() {
    const style = window.getComputedStyle(this.container);
    return parseFloat(style.borderTopLeftRadius) || 0;
  }

  computeRoundedGeometry(offset) {
    const width = this.displayWidth - 2 * offset;
    const height = this.displayHeight - 2 * offset;

    const baseRadius = this.getBorderRadius();
    const radius = Math.max(0, Math.min(baseRadius - offset, Math.min(width, height) / 2));

    return { width, height, radius };
  }

  computeDotCount(perimeter, dotSize, targetGap) {
    // target center-to-center step is (dotSize + targetGap)
    const step = Math.max(1, dotSize + targetGap);
    return Math.max(1, Math.round(perimeter / step));
  }

  drawRoundedBorderFixedCount(width, height, radius, offset, dotSize, count, phase = 0) {
    const perimeter = this.calculateTotalPerimeter(width, height, radius);

    for (let i = 0; i < count; i++) {
      // phase is a fraction of the perimeter: 0..1
      const t = (i / count + phase) % 1;
      const d = t * perimeter;

      const p = this.getPointOnRoundedRect(d, width, height, radius);
      this.drawDot(p.x + offset, p.y + offset, dotSize);
    }
  }


  calculateTotalPerimeter(width, height, radius) {
    const straightEdges = 2 * (width - 2 * radius) + 2 * (height - 2 * radius);
    const cornerArcs = 4 * (Math.PI * radius / 2);
    return straightEdges + cornerArcs;
  }

  drawDots() {
    this.readSidesFromCanvas();
    this.readColorFromCanvas();

    this.ctx.clearRect(0, 0, this.displayWidth, this.displayHeight);
    this.ctx.fillStyle = this.dotColor;

    this.drawBorder(this.outerInset, this.outerDotSize, this.outerSpacing);
    this.drawBorder(this.innerInset, this.innerDotSize, this.innerSpacing);
}


drawSideDots(side, width, height, radius, centerInset, dotSize, targetSpacing) {
  const len = this.getSideLength(side, width, height, radius);

  const targetStep = Math.max(1, dotSize + targetSpacing);
  const count = Math.max(1, Math.round(len / targetStep));

  // Equal spacing + equal end margins:
  // step = len / count, positions at (i + 0.5) * step
  const step = len / count;

  for (let i = 0; i < count; i++) {
      const s = (i + 0.5) * step;

      const p = radius === 0
          ? this.getPointOnRectSide(side, s, width, height)
          : this.getPointOnRoundedRectSide(side, s, width, height, radius);

      this.drawDot(p.x + centerInset, p.y + centerInset, dotSize);
  }
}

drawBorder(offset, dotSize, spacing) {
  const centerInset = offset + dotSize / 2;

  const width = this.displayWidth - 2 * centerInset;
  const height = this.displayHeight - 2 * centerInset;
  if (width <= 0 || height <= 0) return;

  const baseRadius = this.getBorderRadius();
  const radius = Math.max(0, Math.min(baseRadius - centerInset, Math.min(width, height) / 2));

  const s = this.visibleSides || { top: true, right: true, bottom: true, left: true };
  const enabled = ['top', 'right', 'bottom', 'left'].filter(k => s[k]);

  // If all 4 sides are enabled, keep your “all perimeter equal spacing” method.
  if (enabled.length === 4) {
      const perimeter = radius === 0
          ? 2 * (width + height)
          : this.calculateTotalPerimeter(width, height, radius);

      const targetStep = Math.max(1, dotSize + spacing);
      const count = Math.max(1, Math.round(perimeter / targetStep));
      const step = perimeter / count;

      for (let i = 0; i < count; i++) {
          const d = i * step;

          const p = radius === 0
              ? this.getPointOnRect(d, width, height)
              : this.getPointOnRoundedRect(d, width, height, radius);

          this.drawDot(p.x + centerInset, p.y + centerInset, dotSize);
      }
      return;
  }

  // Otherwise, draw only selected sides (with equal end gaps on each side).
  for (const side of enabled) {
      this.drawSideDots(side, width, height, radius, centerInset, dotSize, spacing);
  }
}
getSideLength(side, width, height, radius) {
  if (radius <= 0) {
      if (side === 'top' || side === 'bottom') return width;
      return height;
  }

  const arcQ = Math.PI * radius / 2; // quarter arc
  const topBottom = (width - 2 * radius) + 2 * arcQ;   // includes both top corner arcs
  const leftRight = (height - 2 * radius) + 2 * arcQ;  // includes both side corner arcs

  return (side === 'top' || side === 'bottom') ? topBottom : leftRight;
}

getPointOnRectSide(side, s, width, height) {
  if (side === 'top') return { x: s, y: 0 };
  if (side === 'bottom') return { x: s, y: height };
  if (side === 'left') return { x: 0, y: s };
  return { x: width, y: s }; // right
}

getPointOnRoundedRectSide(side, s, width, height, r) {
  const arcQ = Math.PI * r / 2;

  if (side === 'top') {
      // (0,r) -> arc -> (r,0) -> line -> (w-r,0) -> arc -> (w,r)
      if (s <= arcQ) {
          const t = s / arcQ;
          const a = Math.PI + t * (Math.PI / 2);
          return { x: r + Math.cos(a) * r, y: r + Math.sin(a) * r };
      }
      s -= arcQ;

      const topEdge = width - 2 * r;
      if (s <= topEdge) return { x: r + s, y: 0 };
      s -= topEdge;

      const t = s / arcQ;
      const a = (3 * Math.PI / 2) + t * (Math.PI / 2);
      return { x: width - r + Math.cos(a) * r, y: r + Math.sin(a) * r };
  }

  if (side === 'bottom') {
      // (0,h-r) -> arc -> (r,h) -> line -> (w-r,h) -> arc -> (w,h-r)
      if (s <= arcQ) {
          const t = s / arcQ;
          const a = Math.PI - t * (Math.PI / 2);
          return { x: r + Math.cos(a) * r, y: height - r + Math.sin(a) * r };
      }
      s -= arcQ;

      const bottomEdge = width - 2 * r;
      if (s <= bottomEdge) return { x: r + s, y: height };
      s -= bottomEdge;

      const t = s / arcQ;
      const a = (Math.PI / 2) - t * (Math.PI / 2);
      return { x: width - r + Math.cos(a) * r, y: height - r + Math.sin(a) * r };
  }

  if (side === 'left') {
      // (r,0) -> arc -> (0,r) -> line -> (0,h-r) -> arc -> (r,h)
      if (s <= arcQ) {
          const t = s / arcQ;
          const a = (3 * Math.PI / 2) + t * (Math.PI / 2);
          return { x: r + Math.cos(a) * r, y: r + Math.sin(a) * r };
      }
      s -= arcQ;

      const leftEdge = height - 2 * r;
      if (s <= leftEdge) return { x: 0, y: r + s };
      s -= leftEdge;

      const t = s / arcQ;
      const a = Math.PI + t * (Math.PI / 2);
      return { x: r + Math.cos(a) * r, y: height - r + Math.sin(a) * r };
  }

  // right
  // (w-r,0) -> arc -> (w,r) -> line -> (w,h-r) -> arc -> (w-r,h)
  if (s <= arcQ) {
      const t = s / arcQ;
      const a = (3 * Math.PI / 2) - t * (Math.PI / 2);
      return { x: width - r + Math.cos(a) * r, y: r + Math.sin(a) * r };
  }
  s -= arcQ;

  const rightEdge = height - 2 * r;
  if (s <= rightEdge) return { x: width, y: r + s };
  s -= rightEdge;

  const t = s / arcQ;
  const a = 0 + t * (Math.PI / 2);
  return { x: width - r + Math.cos(a) * r, y: height - r + Math.sin(a) * r };
}


  // Rect perimeter sampler (same “distance along perimeter” idea as rounded)
  getPointOnRect(distance, width, height) {
    const per = 2 * (width + height);
    let d = ((distance % per) + per) % per;

    if (d <= width) return { x: d, y: 0 };
    d -= width;

    if (d <= height) return { x: width, y: d };
    d -= height;

    if (d <= width) return { x: width - d, y: height };
    d -= width;

    return { x: 0, y: height - d };
  }

  layoutEdge(edgeLength, dotSize, targetGap, edgePadding) {
    const usable = edgeLength - 2 * edgePadding;
    if (usable <= dotSize) {
      return { count: 1, gap: 0, pad: edgePadding };
    }

    // choose count so gaps are near targetGap
    const count = Math.max(2, Math.floor((usable + targetGap) / (dotSize + targetGap)));

    // distribute remainder as the true gap between dots
    const gap = (usable - count * dotSize) / (count - 1);

    return { count, gap, pad: edgePadding };
  }

  drawRectangularBorder(width, height, offset, dotSize, targetGap) {
    const edgePadding = targetGap; // <- fixed padding from inset to first dot

    const h = this.layoutEdge(width, dotSize, targetGap, edgePadding);
    const v = this.layoutEdge(height, dotSize, targetGap, edgePadding);

    const x0 = offset + h.pad + dotSize / 2;
    const xStep = dotSize + h.gap;

    const yTop = offset + v.pad + dotSize / 2;
    const yBot = offset + height - v.pad - dotSize / 2;

    // Top + bottom
    for (let i = 0; i < h.count; i++) {
      const x = x0 + i * xStep;
      this.drawDot(x, yTop, dotSize);
      this.drawDot(x, yBot, dotSize);
    }

    const y0 = offset + v.pad + dotSize / 2;
    const yStep = dotSize + v.gap;
    const xLeft = offset + h.pad + dotSize / 2;
    const xRight = offset + width - h.pad - dotSize / 2;

    // Left + right (skip corners)
    for (let i = 1; i < v.count - 1; i++) {
      const y = y0 + i * yStep;
      this.drawDot(xLeft, y, dotSize);
      this.drawDot(xRight, y, dotSize);
    }
  }


  drawRoundedBorder(width, height, radius, offset, dotSize, targetGap) {
    const perimeter = this.calculateTotalPerimeter(width, height, radius);

    // Constant padding along the path from the "start point" (top edge after top-left arc)
    const pad = targetGap;

    const usable = Math.max(0, perimeter - 2 * pad);

    // Pick a dot count near the target gap (still discrete, but phase won't jump anymore)
    const count = Math.max(1, Math.round(usable / (dotSize + targetGap)));

    const gap = count <= 1 ? 0 : (usable - count * dotSize) / (count - 1);

    // Constant phase so changing inset doesn't rotate/re-align the pattern
    let d = pad;

    for (let i = 0; i < count; i++) {
      // wrap distance so we never run past the perimeter
      const dn = ((d % perimeter) + perimeter) % perimeter;

      const p = this.getPointOnRoundedRect(dn, width, height, radius);
      this.drawDot(p.x + offset, p.y + offset, dotSize);

      d += dotSize + gap;
    }
  }


  getPointOnRoundedRect(distance, width, height, radius) {
    const topEdge = width - 2 * radius;
    const rightEdge = height - 2 * radius;
    const bottomEdge = width - 2 * radius;
    const leftEdge = height - 2 * radius;
    const arcLength = Math.PI * radius / 2;

    let d = distance;

    if (d <= topEdge) {
      return { x: radius + d, y: 0 };
    }
    d -= topEdge;

    if (d <= arcLength) {
      const angle = (d / arcLength) * (Math.PI / 2) - Math.PI / 2;
      return {
        x: width - radius + Math.cos(angle) * radius,
        y: radius + Math.sin(angle) * radius
      };
    }
    d -= arcLength;

    if (d <= rightEdge) {
      return { x: width, y: radius + d };
    }
    d -= rightEdge;

    if (d <= arcLength) {
      const angle = (d / arcLength) * (Math.PI / 2);
      return {
        x: width - radius + Math.cos(angle) * radius,
        y: height - radius + Math.sin(angle) * radius
      };
    }
    d -= arcLength;

    if (d <= bottomEdge) {
      return { x: width - radius - d, y: height };
    }
    d -= bottomEdge;

    if (d <= arcLength) {
      const angle = (d / arcLength) * (Math.PI / 2) + Math.PI / 2;
      return {
        x: radius + Math.cos(angle) * radius,
        y: height - radius + Math.sin(angle) * radius
      };
    }
    d -= arcLength;

    if (d <= leftEdge) {
      return { x: 0, y: height - radius - d };
    }
    d -= leftEdge;

    const angle = (d / arcLength) * (Math.PI / 2) + Math.PI;
    return {
      x: radius + Math.cos(angle) * radius,
      y: radius + Math.sin(angle) * radius
    };
  }

  calculateDotsForEdge(edgeLength, dotSize, targetSpacing) {
    const idealDots = Math.floor((edgeLength - dotSize) / (dotSize + targetSpacing));
    const actualSpacing = (edgeLength - (idealDots * dotSize)) / (idealDots + 1);

    let finalDots = idealDots;
    let finalSpacing = actualSpacing;

    const minAllowedSpacing = targetSpacing * 0.5;
    if (actualSpacing < minAllowedSpacing && idealDots > 1) {
      finalDots = idealDots - 1;
      finalSpacing = (edgeLength - (finalDots * dotSize)) / (finalDots + 1);
    }

    return {
      count: finalDots,
      spacing: finalSpacing
    };
  }

  drawDot(x, y, dotSize) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, dotSize / 2, 0, Math.PI * 2);
    this.ctx.fill();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.circles-sm').forEach((el) => {
      new DotPattern(el, {
          outerDotSize: 5,
          outerSpacing: 20,
          outerInset: 5,

          innerDotSize: 3,
          innerSpacing: 20,
          innerInset: 24,

          dotColor: '#E9EBF7'
      });
  });
});

