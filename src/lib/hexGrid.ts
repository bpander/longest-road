import { flatten, isEqual, round, times, uniqWith } from 'lodash';

import Vector2 from 'types/Vector2';

type Path = Vector2[];
type Face = number[];

interface Mesh2d {
  vertices: Vector2[];
  edges: Vector2[];
  faces: Face[];
}

const ONE_SIXTH_TAU = Math.PI * 2 / 6;

const reverse = <T>(arr: T[]): T[] => [ ...arr ].reverse();

const dedupeVertices = (vertices: Vector2[]): Vector2[] => {
  const deduped = [ ...vertices ];
  const openSet = [ ...vertices ];
  while (openSet.length) {
    const vertex = openSet.shift();
    for (let i = openSet.length; i >= 0; i--) {
      if (isEqual(vertex, openSet[i])) {
        deduped.splice(deduped.indexOf(openSet[i]), 1);
        openSet.splice(i, 1);
      }
    }
  }

  return deduped;
};

const makeMesh2dFromPaths = (paths: Path[]): Mesh2d => {
  const vertices = dedupeVertices(flatten(paths));
  const faces: Face[] = paths.map(path => {
    const face: Face = path.map(vertex => {
      const vertexIndex = vertices.findIndex(v => isEqual(v, vertex));
      return vertexIndex;
    });
    return face;
  });

  const allEdges: Vector2[] = [];
  faces.forEach(face => {
    times(face.length, i => {
      allEdges.push([ face[i], face[(i + 1) % face.length] ]);
    });
  });

  const edges = uniqWith(allEdges, (a, b) => isEqual(a, b) || isEqual(a, reverse(b)));

  return { vertices, edges, faces };
};

export const parseHexGrid = (tiles: Vector2[], r: number): Mesh2d => {
  const hexWidth = Math.sqrt(3) * r;
  const hexHeight = 2 * r;
  const paths: Path[] = tiles.map(([ col, row ], i) => {
    const tilePosition: Vector2 = [
      col * hexWidth + (row % 2 * 0.5 * hexWidth),
      row * 0.75 * hexHeight,
    ];
    const path: Path = times(6, j => {
      const theta = ONE_SIXTH_TAU * j;
      const vertex: Vector2 = [
        round(tilePosition[0] + r * Math.sin(theta), 5),
        round(tilePosition[1] + r * Math.cos(theta), 5),
      ];
      return vertex;
    });
    return path;
  });

  return makeMesh2dFromPaths(paths);
};
