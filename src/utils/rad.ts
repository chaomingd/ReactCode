
const PI2 = Math.PI * 2;
export function modRad(rad: number): number {
  return ((rad % PI2) + PI2) % PI2;
}

export function modDegree(deg: number): number {
  return ((deg % 360) + 360) % 360;
}
