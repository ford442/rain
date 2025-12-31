// Utility functions for mathematical operations

export const pi = Math.PI;
export const tau = 2 * pi;

export function log(stuff: any): void {
  console.log(stuff);
}

export function area(r: number): number {
  // area of a circle of radius r
  return pi * r * r;
}

export function radius(area: number): number {
  // given the area of a circle, calculate the radius
  return Math.sqrt(area / pi);
}

export function square(x: number): number {
  return x * x;
}
