const { animate, utils, stagger, splitText } = anime;

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
    },
    onRotate(x, y) {
      // Optional: add some dynamic lighting update logic here
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

  // Anime JS morph bullshit
});
