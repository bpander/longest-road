import { reverse } from 'lib/arrays';
import { includes } from 'lodash';
import * as Mesh2d from 'types/Mesh2d';

const getEdgesAtPoint = (edges: Mesh2d.Edge[], point: Mesh2d.Point): Mesh2d.Edge[] => {
  return edges.filter(edge => includes(edge, point));
};

export const getPaths = (edges: Mesh2d.Edge[], impassablePoints: Mesh2d.Point[]): Mesh2d.Path[] => {
  const allPaths: Mesh2d.Path[] = [];
  const openSet = [ ...edges ];

  const followEdge = (startEdge: Mesh2d.Edge, startIndex: 0 | 1): Mesh2d.Path => {
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
    const startEdge = openSet.shift() as Mesh2d.Edge;
    const path: Mesh2d.Path = [
      ...reverse(followEdge(startEdge, 0)), ...startEdge, ...followEdge(startEdge, 1),
    ];
    allPaths.push(path);
  }

  return allPaths;
};
