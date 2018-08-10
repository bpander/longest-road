import { isEqual, round, times, uniqWith } from 'lodash';

import Vector2 from 'types/Vector2';

interface HexMapParseResult {
  vertices: Vector2[];
  edges: Vector2[];
}

const ONE_SIXTH_TAU = Math.PI * 2 / 6;

export const parseHexGrid = (tiles: Vector2[], r: number): HexMapParseResult => {
  const hexWidth = Math.sqrt(3) * r;
  const hexHeight = 2 * r;
  let vertices: Vector2[] = [];
  const edges: Vector2[] = [];
  tiles.forEach(([ col, row ]) => {
    const tilePosition: Vector2 = [
      col * hexWidth + (row % 2 * 0.5 * hexWidth),
      row * 0.75 * hexHeight,
    ];
    times(6, i => {
      const theta = ONE_SIXTH_TAU * i;
      const x = round(tilePosition[0] + r * Math.sin(theta), 5);
      const y = round(tilePosition[1] + r * Math.cos(theta), 5);
      vertices.push([ x, y ]);
    });
  });

  vertices = uniqWith(vertices, isEqual);

  return { vertices, edges };
};
