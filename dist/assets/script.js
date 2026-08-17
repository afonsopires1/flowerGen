const garden = document.getElementById("garden");
const ground = document.getElementById("ground");
const waterBtn = document.getElementById("waterBtn");

const flowers = [];
let flowerId = 0;
let wateringCycle = 0;

const palettes = [
  { petalA: "#ffd0df", petalB: "#f2528d", highlight: "#fff0f5", centerA: "#f98caf", centerB: "#8f183c", glow: "255, 87, 151" },
  { petalA: "#ffadc9", petalB: "#d72f6d", highlight: "#ffe7ef", centerA: "#ee5b89", centerB: "#6f102b", glow: "239, 59, 118" },
  { petalA: "#a92a4c", petalB: "#5a0b25", highlight: "#e77a99", centerA: "#d94770", centerB: "#3b0718", glow: "142, 25, 59" },
  { petalA: "#cf496e", petalB: "#74112e", highlight: "#f2a2b9", centerA: "#ec6c91", centerB: "#4d091e", glow: "175, 34, 75" },
  { petalA: "#ff8db5", petalB: "#bd245b", highlight: "#ffd7e5", centerA: "#f56b99", centerB: "#7c1332", glow: "233, 59, 119" }
];

waterBtn.addEventListener("click", waterGarden);
window.addEventListener("resize", updateFlowerPositions);

function waterGarden() {
  wateringCycle += 1;
  const clusterCenter = randomRange(0.14, 0.86);

  waterBtn.animate(
    [
      { transform: "translateY(0) rotate(0deg)" },
      { transform: "translateY(1px) rotate(-3deg) scale(.97)" },
      { transform: "translateY(0) rotate(0deg)" }
    ],
    { duration: 420, easing: "ease-out" }
  );

  ground.style.setProperty("--water-x", `${clusterCenter * 100}%`);
  ground.classList.remove("wet");
  void ground.offsetWidth;
  ground.classList.add("wet");

  rainOn(clusterCenter);

  const bloomCount = wateringCycle === 1 ? 3 : Math.round(randomRange(2, 5));
  window.setTimeout(() => growCluster(clusterCenter, bloomCount), 420);
  window.setTimeout(() => driftPetals(Math.min(5, bloomCount + 1)), 1220);
}

function rainOn(centerRatio) {
  const width = window.innerWidth;
  const targetX = centerRatio * width;
  const spread = Math.min(width * .34, 340);
  const fallDistance = window.innerHeight * .76;

  for (let i = 0; i < 24; i += 1) {
    const drop = document.createElement("span");
    const startX = clamp(targetX + randomRange(-spread, spread), 8, width - 8);
    drop.className = "water-drop";
    drop.style.left = `${startX}px`;
    drop.style.top = `${randomRange(-90, window.innerHeight * .12)}px`;
    drop.style.setProperty("--drift-x", `${randomRange(-18, 18)}px`);
    drop.style.setProperty("--fall-y", `${fallDistance + randomRange(-45, 50)}px`);
    drop.style.setProperty("--fall-time", `${randomRange(.62, .98)}s`);
    drop.style.animationDelay = `${randomRange(0, .24)}s`;
    garden.appendChild(drop);
    window.setTimeout(() => drop.remove(), 1400);
  }
}

function growCluster(centerRatio, count) {
  const usedRatios = flowers.map((flower) => flower.ratioX);

  for (let i = 0; i < count; i += 1) {
    let ratioX = clamp(centerRatio + randomRange(-.13, .13), .055, .945);

    for (let attempt = 0; attempt < 5; attempt += 1) {
      if (usedRatios.every((used) => Math.abs(used - ratioX) > .027)) break;
      ratioX = clamp(centerRatio + randomRange(-.18, .18), .055, .945);
    }

    usedRatios.push(ratioX);
    const spec = createFlowerSpec(ratioX, i, count);

    window.setTimeout(() => {
      const flower = buildFlower(spec);
      flowers.push(flower);
      garden.appendChild(flower.element);

      window.setTimeout(() => sparkleBloom(flower.anchorX, flower.anchorY, spec.bloom > 72 ? 10 : 7), 930);
      trimGarden();
    }, i * 125);
  }
}

function createFlowerSpec(ratioX, index, count) {
  const screenScale = clamp(Math.min(window.innerWidth / 1280, window.innerHeight / 820), .62, 1.04);
  const featured = wateringCycle === 1 && index === Math.floor(count / 2);
  const stem = (featured ? 255 : randomRange(118, 218)) * screenScale;
  const bloom = (featured ? 76 : randomRange(43, 67)) * screenScale;
  const curveDirection = ratioX < .5 ? -1 : 1;

  return {
    ratioX,
    stem,
    bloom,
    petals: Math.random() > .42 ? 7 : 6,
    curve: randomRange(7, 19) * curveDirection,
    tilt: randomRange(-3.2, 3.2),
    bottom: window.innerWidth < 720 ? 68 : 82,
    depth: Math.round(stem)
  };
}

function buildFlower(spec) {
  const palette = palettes[flowerId % palettes.length];
  const width = spec.bloom * 2.75;
  const height = spec.stem + spec.bloom * 1.95 + 26;
  const centerX = width / 2;
  const baseY = height - 10;
  const blossomY = baseY - spec.stem;
  const blossomX = centerX + spec.curve;
  const controlX = centerX + spec.curve * .3;
  const controlY = baseY - spec.stem * .46;
  const stemLength = Math.round(spec.stem * 1.08);
  const leafSize = spec.bloom * .58;

  const container = document.createElement("div");
  container.className = "flower";
  container.dataset.ratioX = String(spec.ratioX);
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  container.style.zIndex = String(spec.depth + 3);
  container.style.bottom = `${spec.bottom}px`;
  container.style.left = `${spec.ratioX * window.innerWidth}px`;

  const body = document.createElement("div");
  body.className = "flower-body";
  body.style.setProperty("--tilt", `${spec.tilt}deg`);
  body.style.setProperty("--sway-duration", `${randomRange(5.6, 7.8)}s`);
  body.style.setProperty("--sway-delay", `${-randomRange(0, 3)}s`);
  body.style.setProperty("--stem-length", String(stemLength));
  body.innerHTML = createFlowerSvg({
    id: flowerId,
    width,
    height,
    centerX,
    baseY,
    blossomX,
    blossomY,
    controlX,
    controlY,
    bloom: spec.bloom,
    petals: spec.petals,
    leafSize,
    palette
  });
  container.appendChild(body);

  const flower = {
    element: container,
    ratioX: spec.ratioX,
    bottom: spec.bottom,
    stem: spec.stem,
    anchorX: spec.ratioX * window.innerWidth,
    anchorY: window.innerHeight - spec.bottom - spec.stem
  };

  flowerId += 1;
  return flower;
}

function createFlowerSvg(config) {
  const { id, width, height, centerX, baseY, blossomX, blossomY, controlX, controlY, bloom, petals, leafSize, palette } = config;
  const stemGradient = `stem-gradient-${id}`;
  const petalGradient = `petal-gradient-${id}`;
  const centerGradient = `center-gradient-${id}`;
  const glowGradient = `glow-gradient-${id}`;
  const stemPath = `M ${centerX} ${baseY} Q ${controlX} ${controlY} ${blossomX} ${blossomY}`;
  const leafBack = leafPath(centerX + (blossomX - centerX) * .25, baseY - (baseY - blossomY) * .34, leafSize, -1);
  const leafFront = leafPath(centerX + (blossomX - centerX) * .62, baseY - (baseY - blossomY) * .6, leafSize * .9, 1);
  const petalMarkup = makePetals(petals, bloom, petalGradient, palette.highlight);

  return `
    <svg viewBox="0 0 ${width} ${height}" aria-hidden="true">
      <defs>
        <linearGradient id="${stemGradient}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#73b781"></stop>
          <stop offset="58%" stop-color="#43825c"></stop>
          <stop offset="100%" stop-color="#204833"></stop>
        </linearGradient>
        <linearGradient id="${petalGradient}" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stop-color="${palette.petalA}"></stop>
          <stop offset="100%" stop-color="${palette.petalB}"></stop>
        </linearGradient>
        <radialGradient id="${centerGradient}" cx="35%" cy="35%" r="72%">
          <stop offset="0%" stop-color="${palette.centerA}"></stop>
          <stop offset="100%" stop-color="${palette.centerB}"></stop>
        </radialGradient>
        <radialGradient id="${glowGradient}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(${palette.glow}, .3)"></stop>
          <stop offset="100%" stop-color="rgba(${palette.glow}, 0)"></stop>
        </radialGradient>
      </defs>
      <ellipse cx="${blossomX}" cy="${blossomY + bloom * .1}" rx="${bloom * .95}" ry="${bloom * .8}" fill="url(#${glowGradient})"></ellipse>
      <path class="stem-path" d="${stemPath}" stroke="url(#${stemGradient})"></path>
      <path class="leaf back" d="${leafBack}" fill="url(#${stemGradient})"></path>
      <path class="leaf front" d="${leafFront}" fill="url(#${stemGradient})"></path>
      <g class="bud">
        <ellipse cx="${blossomX}" cy="${blossomY - bloom * .08}" rx="${bloom * .18}" ry="${bloom * .3}" fill="${palette.petalB}"></ellipse>
      </g>
      <g class="calyx">
        <ellipse cx="${blossomX}" cy="${blossomY + bloom * .08}" rx="${bloom * .2}" ry="${bloom * .08}" fill="#4f9168"></ellipse>
      </g>
      <g transform="translate(${blossomX} ${blossomY})">
        <g class="blossom">
          ${petalMarkup}
          <circle r="${bloom * .22}" fill="url(#${centerGradient})"></circle>
          <circle r="${bloom * .07}" fill="rgba(255,231,240,.35)"></circle>
        </g>
      </g>
    </svg>
  `;
}

function makePetals(count, bloom, gradientId, highlight) {
  const rx = bloom * .22;
  const ry = bloom * .46;
  const distance = bloom * .34;
  let markup = "";

  for (let i = 0; i < count; i += 1) {
    const angle = (360 / count) * i;
    markup += `
      <g transform="rotate(${angle})">
        <ellipse cx="0" cy="${-distance}" rx="${rx}" ry="${ry}" fill="url(#${gradientId})"></ellipse>
        <ellipse cx="0" cy="${-distance - bloom * .05}" rx="${rx * .46}" ry="${ry * .32}" fill="${highlight}" opacity=".38"></ellipse>
      </g>
    `;
  }

  return markup;
}

function leafPath(x, y, size, direction) {
  const spread = size * .9 * direction;
  const dip = size * .44;
  const length = size * .8;
  return [
    `M ${x} ${y}`,
    `C ${x + spread * .2} ${y - dip * .4}, ${x + spread * .85} ${y - dip}, ${x + spread} ${y + dip * .28}`,
    `C ${x + spread * .56} ${y + length * .4}, ${x + spread * .14} ${y + length * .08}, ${x} ${y}`
  ].join(" ");
}

function sparkleBloom(x, y, count) {
  for (let i = 0; i < count; i += 1) {
    const sparkle = document.createElement("span");
    sparkle.className = "sparkle";
    sparkle.style.left = `${x + randomRange(-32, 32)}px`;
    sparkle.style.top = `${y + randomRange(-15, 18)}px`;
    sparkle.style.setProperty("--drift-x", `${randomRange(-18, 18)}px`);
    sparkle.style.animationDuration = `${randomRange(1.5, 2.15)}s`;
    garden.appendChild(sparkle);
    window.setTimeout(() => sparkle.remove(), 2300);
  }
}

function driftPetals(count) {
  for (let i = 0; i < count; i += 1) {
    const palette = palettes[(flowerId + i) % palettes.length];
    const petal = document.createElement("span");
    petal.className = "float-petal";
    petal.style.left = `${randomRange(window.innerWidth * .12, window.innerWidth * .88)}px`;
    petal.style.top = `${randomRange(window.innerHeight * .22, window.innerHeight * .54)}px`;
    petal.style.background = `linear-gradient(180deg, ${palette.petalA}, ${palette.petalB})`;
    petal.style.setProperty("--flight-x", `${randomRange(-42, 42)}px`);
    petal.style.setProperty("--flight-time", `${randomRange(4.5, 6.4)}s`);
    petal.style.setProperty("--rotation", `${randomRange(-80, 80)}deg`);
    garden.appendChild(petal);
    window.setTimeout(() => petal.remove(), 6800);
  }
}

function updateFlowerPositions() {
  flowers.forEach((flower) => {
    flower.bottom = window.innerWidth < 720 ? 68 : 82;
    flower.anchorX = flower.ratioX * window.innerWidth;
    flower.anchorY = window.innerHeight - flower.bottom - flower.stem;
    flower.element.style.left = `${flower.anchorX}px`;
    flower.element.style.bottom = `${flower.bottom}px`;
  });
}

function trimGarden() {
  while (flowers.length > 30) {
    const oldest = flowers.shift();
    oldest.element.remove();
  }
}

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
