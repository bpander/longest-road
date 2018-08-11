import { reverse } from 'lib/arrays';
import { flatten, includes, isEqual, times, uniqWith } from 'lodash';
import Vector2 from 'types/Vector2';

// A point in 2d space (x, y)
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

export type Path = Point[];

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

  const edges = uniqWith(allEdges, (a, b) => isEqual(a, b) || isEqual(a, reverse(b)));

  return { vertices, edges, faces };
};

const getEdgesAtPoint = (edges: Edge[], point: Point): Edge[] => {
  return edges.filter(edge => includes(edge, point));
};

export const getPaths = (edges: Edge[], impassablePoints: Point[]): Path[] => {
  const allPaths: Path[] = [];
  const openSet = [ ...edges ];

  const followEdge = (startEdge: Edge, startIndex: 0 | 1): Path => {
    const p0 = startEdge[startIndex];
    const connections = getEdgesAtPoint(edges, p0);
    const nextEdgeCandidates = getEdgesAtPoint(openSet, p0);
    if (connections.length > 2 || nextEdgeCandidates.length !== 1) {
      return [];
    }
    const nextEdge = nextEdgeCandidates[0];
    const nextStartIndex = nextEdge.findIndex(p => p !== p0) as 1 | 0;
    const p1 = nextEdge[nextStartIndex];
    openSet.splice(openSet.indexOf(nextEdge), 1);

    return [ p1, ...followEdge(nextEdge, nextStartIndex) ];
  };

  while (openSet.length) {
    const startEdge = openSet.shift() as Edge;
    const path: Path = [
      ...reverse(followEdge(startEdge, 0)), ...startEdge, ...followEdge(startEdge, 1),
    ];
    allPaths.push(path);
  }

  return allPaths;
};
