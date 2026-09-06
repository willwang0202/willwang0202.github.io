/* Orthographic projection of a sphere turning about its north/south axis.
   Camera elevation and axis lean are constant; only longitude changes. */
export const CENTER = 320;
export const RADIUS = 131;
const TAU = Math.PI * 2;
const ELEVATION = 18 * Math.PI / 180;
const LEAN = 28 * Math.PI / 180;
const cosElevation = Math.cos(ELEVATION);
const sinElevation = Math.sin(ELEVATION);
const cosLean = Math.cos(LEAN);
const sinLean = Math.sin(LEAN);

function project(point, sinAngle, cosAngle) {
  const [x, y, z] = point;
  const spunX = x * cosAngle + z * sinAngle;
  const spunZ = z * cosAngle - x * sinAngle;
  const elevatedY = y * cosElevation - spunZ * sinElevation;
  const depth = y * sinElevation + spunZ * cosElevation;
  return [
    CENTER + RADIUS * (spunX * cosLean - elevatedY * sinLean),
    CENTER - RADIUS * (spunX * sinLean + elevatedY * cosLean),
    depth
  ];
}

export function projectPoint(point, angle) {
  return project(point, Math.sin(angle), Math.cos(angle));
}

export function createWireframe() {
  const lines = [];
  // Latitude circles do not change when the sphere turns about its own axis.
  for (let degrees = -75; degrees <= 75; degrees += 15) {
    const latitude = degrees * Math.PI / 180;
    const ring = [];
    for (let step = 0; step <= 96; step++) {
      const longitude = step / 96 * TAU;
      ring.push([Math.cos(latitude) * Math.sin(longitude), Math.sin(latitude), Math.cos(latitude) * Math.cos(longitude)]);
    }
    ring.latitude = true;
    lines.push(ring);
  }
  // Each meridian runs pole-to-pole, passing from the near side to the far side.
  for (let index = 0; index < 18; index++) {
    const longitude = index / 18 * TAU;
    const meridian = [];
    for (let step = 0; step <= 64; step++) {
      const latitude = -Math.PI / 2 + step / 64 * Math.PI;
      meridian.push([Math.cos(latitude) * Math.sin(longitude), Math.sin(latitude), Math.cos(latitude) * Math.cos(longitude)]);
    }
    lines.push(meridian);
  }
  return lines;
}

/** Split strokes at the horizon so rear lines retain the reference's faint ink. */
export function projectWireframe(lines, angle) {
  const paths = { front: [], back: [] };
  const sinAngle = Math.sin(angle);
  const cosAngle = Math.cos(angle);
  const xy = (point) => `${point[0].toFixed(2)} ${point[1].toFixed(2)}`;

  for (const line of lines) {
    const sin = line.latitude ? 0 : sinAngle;
    const cos = line.latitude ? 1 : cosAngle;
    let previous = project(line[0], sin, cos);
    let side = previous[2] >= 0 ? 'front' : 'back';
    paths[side].push(`M${xy(previous)}`);
    for (let index = 1; index < line.length; index++) {
      const point = project(line[index], sin, cos);
      const nextSide = point[2] >= 0 ? 'front' : 'back';
      if (nextSide !== side) {
        // Interpolate the z=0 crossing; both strokes meet at the same point.
        const fraction = previous[2] / (previous[2] - point[2]);
        const horizon = [previous[0] + (point[0] - previous[0]) * fraction, previous[1] + (point[1] - previous[1]) * fraction];
        paths[side].push(`L${xy(horizon)}`);
        paths[nextSide].push(`M${xy(horizon)}`);
        side = nextSide;
      }
      paths[side].push(`L${xy(point)}`);
      previous = point;
    }
  }
  return { front: paths.front.join(''), back: paths.back.join('') };
}
