import { round, times } from 'lodash';

import Vector2 from 'types/Vector2';

interface HexMapParseResult {
  vertices: Vector2[];
  edges: Vector2[];
}

const ONE_SIXTH_TAU = Math.PI * 2 / 6;

export const parseHexGrid = (tiles: Vector2[], r: number): HexMapParseResult => {
  const hexWidth = Math.sqrt(3) * r;
  const hexHeight = 2 * r;
  const vertices: Vector2[] = [];
  const edges: Vector2[] = [];
  tiles.forEach(([ col, row ], i) => {
    const tilePosition: Vector2 = [
      col * hexWidth + (row % 2 * 0.5 * hexWidth),
      row * 0.75 * hexHeight,
    ];
    times(6, j => {
      const theta = ONE_SIXTH_TAU * j;
      const x = round(tilePosition[0] + r * Math.sin(theta), 5);
      const y = round(tilePosition[1] + r * Math.cos(theta), 5);
      const newLength = vertices.push([ x, y ]);
      edges.push([ newLength - 1, newLength % 6 + i * 6 ]);
    });
  });

  // const openSet = [ ...vertices ];
  // while (openSet.length) {
  //   const vertex = openSet.shift();
  //   for (let i = openSet.length; i >= 0; i--) {
  //     if (isEqual(vertex, openSet[i])) {
  //       vertices.splice(vertices.indexOf(openSet[i]), 1);
  //       openSet.splice(i, 1);
  //     }
  //   }
  // }

  return { vertices, edges };
};
