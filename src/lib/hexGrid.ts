import { flatten, isEqual, round, times, uniqWith } from 'lodash';

import LayoutType from 'enums/LayoutType';
import { Tile } from 'types/HexGrid';
import * as Mesh2d from 'types/Mesh2d';

const ONE_SIXTH_TAU = Math.PI * 2 / 6;

const reverse = <T>(arr: T[]): T[] => [ ...arr ].reverse();

const dedupeVertices = (vertices: Mesh2d.Vertex[]): Mesh2d.Vertex[] => {
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

const makeMeshFromPolygons = (polygons: Mesh2d.Polygon[]): Mesh2d.Mesh => {
  const vertices = dedupeVertices(flatten(polygons));
  const faces: Mesh2d.Face[] = polygons.map(polygon => {
    const face: Mesh2d.Face = polygon.map(vertex => {
      const vertexIndex = vertices.findIndex(v => isEqual(v, vertex));
      return vertexIndex;
    });
    return face;
  });

  const allEdges: Mesh2d.Edge[] = [];
  faces.forEach(face => {
    times(face.length, i => {
      allEdges.push([ face[i], face[(i + 1) % face.length] ]);
    });
  });

  const edges = uniqWith(allEdges, (a, b) => isEqual(a, b) || isEqual(a, reverse(b)));

  return { vertices, edges, faces };
};

export const makeMeshFromHexTiles = (
  tiles: Tile[],
  radius: number,
  layoutType: LayoutType.OddR = LayoutType.OddR, // probably the only layout type that needs supported
): Mesh2d.Mesh => {
  const hexWidth = Math.sqrt(3) * radius;
  const hexHeight = 2 * radius;
  const polygons: Mesh2d.Polygon[] = tiles.map(([ col, row ]) => {
    const tilePosition: Tile = [
      col * hexWidth + (row % 2 * 0.5 * hexWidth),
      row * 0.75 * hexHeight,
    ];
    const polygon: Mesh2d.Polygon = times(6, i => {
      const theta = ONE_SIXTH_TAU * i;
      const vertex: Mesh2d.Vertex = [
        // rounding fixes floating point issues
        round(tilePosition[0] + radius * Math.sin(theta), 5),
        round(tilePosition[1] + radius * Math.cos(theta), 5),
      ];
      return vertex;
    });
    return polygon;
  });

  return makeMeshFromPolygons(polygons);
};
