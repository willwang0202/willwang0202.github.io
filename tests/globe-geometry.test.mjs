import test from 'node:test';
import assert from 'node:assert/strict';
import { projectPoint, projectWireframe, createWireframe, RADIUS, CENTER } from '../assets/js/globe-geometry.js';

const near = (actual, expected, tolerance = 1e-8) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} should equal ${expected}`);

test('both poles remain fixed throughout an axial revolution', () => {
  for (const pole of [[0, 1, 0], [0, -1, 0]]) {
    const expected = projectPoint(pole, 0);
    for (const angle of [0.3, Math.PI / 2, Math.PI, 5.7, Math.PI * 2]) {
      const actual = projectPoint(pole, angle);
      actual.forEach((value, index) => near(value, expected[index]));
    }
  }
});

test('an equatorial point crosses the silhouette and moves behind the sphere', () => {
  const front = projectPoint([0, 0, 1], 0);
  const limb = projectPoint([0, 0, 1], Math.PI / 2);
  const back = projectPoint([0, 0, 1], Math.PI);
  assert.ok(front[2] > 0);
  near(limb[2], 0);
  assert.ok(back[2] < 0);
  near(Math.hypot(limb[0] - CENTER, limb[1] - CENTER), RADIUS);
  assert.ok(Math.hypot(front[0] - CENTER, front[1] - CENTER) < RADIUS);
});

test('projection preserves a spherical surface and closes a full revolution', () => {
  const mesh = createWireframe();
  for (const line of mesh) {
    for (const point of line) {
      const projected = projectPoint(point, 0.72);
      const x = (projected[0] - CENTER) / RADIUS;
      const y = (projected[1] - CENTER) / RADIUS;
      near(x * x + y * y + projected[2] * projected[2], 1);
      const revolved = projectPoint(point, 0.72 + Math.PI * 2);
      projected.forEach((value, index) => near(value, revolved[index]));
    }
  }
});

test('meridians change their projected shape while latitude rings stay fixed', () => {
  const mesh = createWireframe();
  const initial = projectWireframe(mesh, 0);
  const turned = projectWireframe(mesh, 0.12);
  assert.notEqual(initial.front, turned.front);
  assert.notEqual(initial.back, turned.back);
  assert.ok(initial.front.startsWith('M') && initial.back.startsWith('M'));
  assert.ok(!/NaN|Infinity/.test(initial.front + initial.back + turned.front + turned.back));
  const latitudes = mesh.filter((line) => line.latitude);
  assert.deepEqual(projectWireframe(latitudes, 0), projectWireframe(latitudes, 1.4));
});
