// Main entry point for the rain animation
import { tau } from './util';
import { Drop, makeDrop, applyGravity, mergeOverlapping } from './drops';
import { Channel, timerChannel, chunkedChannel } from './async';

// Declare the global stackBlurCanvasRGB function from stackblur.js
declare global {
  interface Window {
    stackBlurCanvasRGB: (
      id: string,
      topX: number,
      topY: number,
      width: number,
      height: number,
      radius: number
    ) => void;
  }
}

const FPS = 25;
const MAX_DROPS = 1000;

function drawCanvas(canvas: HTMLCanvasElement, bg?: HTMLImageElement): HTMLCanvasElement {
  // Resize the canvas element to window height and width.
  // If optional bg is provided, draw it into the canvas
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  canvas.width = width;
  canvas.height = height;
  
  if (bg) {
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(bg, 0, 0, width, height);
  }
  
  return canvas;
}

function drawDrop(canvas: HTMLCanvasElement, drop: Drop, reflection: HTMLCanvasElement): void {
  // draw a circle on canvas with given reflection
  const { x, y, r } = drop;
  const ctx = canvas.getContext('2d')!;
  const rSquared = r * r;
  
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, tau, false);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(
    reflection,
    Math.max(0, x - rSquared), Math.max(0, y - rSquared), 4 * rSquared, 4 * rSquared,
    x - r, y - r, 2 * r, 2 * r
  );
  ctx.restore();
}

function clearDrop(canvas: HTMLCanvasElement, drop: Drop): void {
  // erase previously drawn raindrop
  const { x, y, r } = drop;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(x - r - 1, y - r - 1, 2 * r + 2, 2 * r + 2);
}

function onScreen(drop: Drop): boolean {
  // returns true if raindrop is partially within bounds of window
  const { y, r } = drop;
  return y - r < window.innerHeight;
}

async function init(): Promise<void> {
  // The Canvases
  // - the background, with blur applied
  // - the glass, canvas for drawing the raindrops
  // - the reflection, canvas holding inverted image (unblurred) for drop reflection
  
  const background = document.getElementById('background') as HTMLImageElement;
  drawCanvas(document.getElementById('outside') as HTMLCanvasElement, background);
  const glass = drawCanvas(document.getElementById('glass') as HTMLCanvasElement);
  const reflection = drawCanvas(document.getElementById('reflection') as HTMLCanvasElement, background);
  
  // The channels
  // - newDrops: randomly placed by a random timer
  // - drops: need to be (re-)rendered
  // - animatingDrops: filtered by whether they are still on screen
  // - animationTick: collects the next animation loop's worth of drops
  
  const newDrops = timerChannel(() => 20 * Math.floor(Math.random() * 10), 'drop');
  const drops = new Channel<Drop>(MAX_DROPS);
  const animationTick = chunkedChannel(drops, 1000 / FPS);
  
  // blur the background canvas
  window.stackBlurCanvasRGB('outside', 0, 0, window.innerWidth, window.innerHeight, 15);
  
  // generate new raindrops
  (async () => {
    while (!newDrops.isClosed()) {
      const msg = await newDrops.take();
      if (msg !== null) {
        const drop = makeDrop();
        await drops.put(drop);
      }
    }
  })();
  
  // raindrop render loop
  (async () => {
    while (!animationTick.isClosed()) {
      const dropsToAnimate = await animationTick.take();
      if (dropsToAnimate === null) break;
      
      // Filter on-screen drops
      const onScreenDrops = dropsToAnimate.filter(onScreen);
      
      // Clear all drops
      for (const drop of onScreenDrops) {
        clearDrop(glass, drop);
      }
      
      // Merge overlapping drops and render
      const mergedDrops = onScreenDrops.reduce(mergeOverlapping, [] as Drop[]);
      for (const drop of mergedDrops) {
        const nextDrop = applyGravity(drop);
        drawDrop(glass, nextDrop, reflection);
        await drops.put(nextDrop);
      }
    }
  })();
}

// Start the animation when the page loads
window.addEventListener('load', init);
