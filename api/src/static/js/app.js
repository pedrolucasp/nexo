const { animate, utils, stagger, splitText, morphTo } = anime;

// Motion path: glowing dot traces the logo outline.
// morphTo on hover: logo → 16-pt star, tries to mimic the logo

// XXX: morphTo note: animejs tries to find the shorter path to match the
// logo's in ~300 commands, so the star gets hundreds of "stacked" points. The
// morph works but looks like a chaotic crystallisation rather than a clean
// shape-to-shape swap. Not gonna waste more time on this bullshit
async function setupLogoAnimations() {
  const container = document.getElementById('logo-container');
  if (!container) return;

  let pathD;
  try {
    const text = await fetch('/images/logo.svg').then(r => r.text());
    pathD = new DOMParser()
      .parseFromString(text, 'image/svg+xml')
      .querySelector('path')
      .getAttribute('d');
  } catch {
    return;
  }

  // Blah
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs = {}) => {
    const el = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  };

  const svg = mk('svg', { viewBox: '0 0 600 600' });
  svg.style.cssText = 'width:100%;height:100%;display:block;overflow:visible';

  const defs = mk('defs');

  // Radial gradient: bright upper-left highlight fading to a deeper green at
  // edges
  const grad = mk('radialGradient', {
    id: 'logo-gradient',
    cx: '42%',
    cy: '36%',
    r: '65%',
    gradientUnits: 'objectBoundingBox'
  });

  grad.appendChild(mk('stop', { offset: '0%',   'stop-color': '#2dff80' }));
  grad.appendChild(mk('stop', { offset: '52%',  'stop-color': '#13ec5b' }));
  grad.appendChild(mk('stop', { offset: '100%', 'stop-color': '#09a042' }));
  defs.appendChild(grad);

  // Glow filter for the dot
  const dotFilter = mk('filter', {
    id: 'dot-glow',
    x: '-300%',
    y: '-300%',
    width: '700%',
    height: '700%'
  });

  dotFilter.appendChild(mk('feGaussianBlur', {
    in: 'SourceGraphic',
    stdDeviation: '6',
    result: 'blur'
  }));

  const merge = mk('feMerge');
  merge.appendChild(mk('feMergeNode', { in: 'blur' }));
  merge.appendChild(mk('feMergeNode', { in: 'SourceGraphic' }));
  dotFilter.appendChild(merge);
  defs.appendChild(dotFilter);

  svg.appendChild(defs);

  // Logo path: gradient fill
  const logoPathEl = mk('path', {
    fill: 'url(#logo-gradient)',
    filter: 'url(#logo-texture)',
    d: pathD
  });

  svg.appendChild(logoPathEl);

  // morphTo targets (same 0-600 coordinate space as the logo)
  const starD = 'M300,30 L322,192 L466,109 L371,258 L562,296 L371,340 L466,489 L322,412 L300,570 L278,412 L134,489 L229,340 L38,296 L229,258 L134,109 L278,192 Z';
  const starEl = mk('path', { d: starD, visibility: 'hidden' });
  const origEl = mk('path', { d: pathD, visibility: 'hidden' });
  svg.appendChild(starEl);
  svg.appendChild(origEl);

  // Motion dot
  const trail = mk('circle', {
    r: '24',
    fill: '#13ec5b',
    opacity: '0.15',
    filter: 'url(#dot-glow)',
    cx: '316',
    cy: '578'
  });

  const dot = mk('circle', {
    r: '8',
    fill: 'black',
    opacity: '0.85',
    filter: 'url(#dot-glow)',
    cx: '316',
    cy: '578'
  });

  svg.appendChild(trail);
  svg.appendChild(dot);

  container.appendChild(svg);

  // Motion path
  const totalLen = logoPathEl.getTotalLength();
  if (!totalLen) return;

  const DURATION = 12000;
  let rafStart = null;

  function traceDot(ts) {
    if (rafStart === null) rafStart = ts;
    const t = ((ts - rafStart) % DURATION) / DURATION;
    const pt = logoPathEl.getPointAtLength(t * totalLen);

    dot.setAttribute('cx', pt.x);
    dot.setAttribute('cy', pt.y);
    trail.setAttribute('cx', pt.x);
    trail.setAttribute('cy', pt.y);
    requestAnimationFrame(traceDot);
  }
  requestAnimationFrame(traceDot);

  // morphTo experiment
  container.addEventListener('pointerenter', () => {
    animate(logoPathEl, { d: morphTo(starEl), duration: 900, ease: 'inOutCubic' });
  });

  container.addEventListener('pointerleave', () => {
    animate(logoPathEl, { d: morphTo(origEl), duration: 900, ease: 'inOutCubic' });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  const colors = [];

  new Glide('.glide', {
    type: 'carousel',
    autoplay: 2000,
    startAt: 0,
    perView: 2.5,
    gap: 32,
    breakpoints: {
      1024: {
        perView: 2
      },
      768: {
        perView: 1
      }
    }
  }).mount();

  // Initialize Atropos 3D Effect
  const dash = Atropos({
    el: '.my-atropos',
    activeOffset: 40,
    shadow: true,
    shadowScale: 1.05,
    onEnter() {
      console.log('Atropos Enter');
    },
    onLeave() {
      console.log('Atropos Leave');
    }
  });


  // Anime js text bullshit
  splitText('.animated-text', {
    lines: true,
  })
    .addEffect(({ lines }) => animate(lines, {
      y: ['20%', '-20%'],
      loop: true,
      alternate: true,
      delay: stagger(15000),
      ease: 'inOutQuad',
    }))
    .addEffect(split => {
      split.words.forEach(($el, i) => {
        const color = colors[i];
        if (color) utils.set($el, { color });
        $el.addEventListener('pointerenter', () => {
          animate($el, {
            color: utils.randomPick(['#FF4B4B', '#FFCC2A', '#B7FF54', '#57F695']),
            duration: 250,
          })
        });
      });
      return () => {
        /* Called between each split */
        split.words.forEach((w, i) => colors[i] = utils.get(w, 'color'));
      }
    });

  setupLogoAnimations();

  document.querySelectorAll('.glide__slide .morph-icon').forEach(svg => {
    const path    = svg.querySelector(':scope > path');
    const resting = svg.querySelector('defs .morph-resting');
    const shape   = svg.querySelector('defs .morph-shape');
    const card    = svg.closest('.group');

    card.addEventListener('pointerenter', () => {
      animate(path, { d: morphTo(shape),   duration: 500, ease: 'inOutCubic' });
    });
    card.addEventListener('pointerleave', () => {
      animate(path, { d: morphTo(resting), duration: 500, ease: 'inOutCubic' });
    });
  });
});
