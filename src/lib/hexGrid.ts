import { round, times } from 'lodash';

import * as Mesh2d from 'lib/Mesh2d';
import Vector2 from 'types/Vector2';

enum LayoutType {
  OddR,
}

// A hex's grid coordinates
export type Tile = Vector2;

const ONE_SIXTH_TAU = Math.PI * 2 / 6;

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

  return Mesh2d.makeMeshFromPolygons(polygons);
};
