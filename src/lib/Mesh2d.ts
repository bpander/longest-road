import { flatten, isEqual, times, uniqWith } from 'lodash';

import { reverse } from 'lib/Arrays';
import Vector2 from 'types/Vector2';

// An (x,y) coordinate where two lines meet
export type Vertex = Vector2;

// A list of vertices, implies a closed shape
export type Polygon = Vertex[];

// A way to reference a specific vertex; its index in a vertices array
export type Point = number;

// Like a Polygon but is made of up Points
export type Face = Point[];

// Signifies a connection between two Points
export type Edge = [ Point, Point ];

export interface Mesh {
  vertices: Vertex[];
  edges: Edge[];
  faces: Face[];
}

const dedupeVertices = (vertices: Vertex[]): Vertex[] => {
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

export const makeMeshFromPolygons = (polygons: Polygon[]): Mesh => {
  const vertices = dedupeVertices(flatten(polygons));
  const faces: Face[] = polygons.map(polygon => {
    const face: Face = polygon.map(vertex => {
      const point = vertices.findIndex(v => isEqual(v, vertex));
      return point;
    });
    return face;
  });

  const allEdges: Edge[] = [];
  faces.forEach(face => {
    times(face.length, i => {
      allEdges.push([ face[i], face[(i + 1) % face.length] ]);
    });
  });

  const edges = uniqWith(allEdges, (e1, e2) => isEqual(e1, e2) || isEqual(e1, reverse(e2)));

  return { vertices, edges, faces };
};
