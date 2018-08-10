import { isEqual, round, times, uniqWith } from 'lodash';

import Vector2 from 'types/Vector2';

interface HexMapParseResult {
  vertices: Vector2[];
  edges: Vector2[];
}

const ONE_SIXTH_TAU = Math.PI * 2 / 6;

const reverse = <T>(arr: T[]): T[] => [ ...arr ].reverse();

export const parseHexGrid = (tiles: Vector2[], r: number): HexMapParseResult => {
  const hexWidth = Math.sqrt(3) * r;
  const hexHeight = 2 * r;
  const vertices: Vector2[] = [];
  const lines: Array<[ Vector2, Vector2 ]> = [];
  tiles.forEach(([ col, row ], i) => {
    const tilePosition: Vector2 = [
      col * hexWidth + (row % 2 * 0.5 * hexWidth),
      row * 0.75 * hexHeight,
    ];
    let lastVertex: Vector2 | undefined;
    times(6, j => {
      const theta = ONE_SIXTH_TAU * j;
      const vertex: Vector2 = [
        round(tilePosition[0] + r * Math.sin(theta), 5),
        round(tilePosition[1] + r * Math.cos(theta), 5),
      ];
      vertices.push(vertex);
      if (lastVertex) {
        lines.push([ vertex, lastVertex ]);
      }
      lastVertex = vertex;
    });
    lines.push([ lastVertex as Vector2, vertices[vertices.length - 6] ]);
  });

  const openSet = [ ...vertices ];
  while (openSet.length) {
    const vertex = openSet.shift();
    for (let i = openSet.length; i >= 0; i--) {
      if (isEqual(vertex, openSet[i])) {
        vertices.splice(vertices.indexOf(openSet[i]), 1);
        openSet.splice(i, 1);
      }
    }
  }

  const allEdges = lines.map(
    line => line.map(vertex => vertices.findIndex(v => isEqual(v, vertex))) as Vector2,
  );

  const edges = uniqWith(allEdges, (a, b) => isEqual(a, b) || isEqual(a, reverse(b)));

  return { vertices, edges };
};
