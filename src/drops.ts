// Raindrop physics and merging logic
import { area, radius, square } from './util';

const K_GRAVITY = 0.005;

export interface Drop {
  x: number;
  y: number;
  r: number;
  g?: number;
}

export function makeDrop(): Drop {
  // return a new raindrop instance
  return {
    x: Math.floor(Math.random() * window.innerWidth),
    y: Math.floor(Math.random() * window.innerHeight),
    r: 2 + Math.floor(Math.random() * 6)
  };
}

export function applyGravity(drop: Drop): Drop {
  // calculate new position and acceleration of raindrop
  const g = drop.g || K_GRAVITY;
  const dg = K_GRAVITY * drop.r;
  return {
    ...drop,
    y: drop.y + g,
    g: g + dg
  };
}

export function mergeDrops(d1: Drop, d2: Drop): Drop {
  // return a new raindrop which has the average position of the 2 parents and the combined size
  return {
    x: (d1.x + d2.x) / 2,
    y: (d1.y + d2.y) / 2,
    r: radius(area(d1.r) + area(d2.r)),
    g: ((d1.g || 0) + (d2.g || 0)) / 2
  };
}

export function overlapping(drop1: Drop, drop2: Drop): boolean {
  // Checks for whether 2 drops overlap.
  const { x: x1, y: y1, r: r1 } = drop1;
  const { x: x2, y: y2, r: r2 } = drop2;
  
  return square(r1 - r2) <= square(x1 - x2) + square(y1 - y2) && 
         square(x1 - x2) + square(y1 - y2) <= square(r1 + r2);
}

export function mergeOverlapping(drops: Drop[], drop: Drop): Drop[] {
  // Assumes there is at most one drop from drops, which overlaps drop.
  // Returns a new collection with overlapping values merged
  const result: Drop[] = [];
  
  for (let i = 0; i < drops.length; i++) {
    const d = drops[i];
    if (overlapping(drop, d)) {
      // Found an overlap - merge and return the result with remaining drops
      return [...result, mergeDrops(drop, d), ...drops.slice(i + 1)];
    }
    result.push(d);
  }
  
  result.push(drop);
  return result;
}
