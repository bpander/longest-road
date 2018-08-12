import { includes } from 'lodash';

import { reverse } from 'lib/Arrays';
import * as Mesh2d from 'lib/Mesh2d';

export type Path = Mesh2d.Point[];

export const mapConnections = (edges: Mesh2d.Edge[]): { [p: number]: Mesh2d.Point[] } => {
  const connections = {};
  edges.forEach(edge => {
    edge.forEach((p, i) => {
      if (!connections[p]) {
        connections[p] = [];
      }
      connections[p].push(edge[1 - i]);
    });
  });

  return connections;
};

export const getPaths = (edges: Mesh2d.Edge[], impassablePoints: Mesh2d.Point[]): Path[] => {
  const allPaths: Path[] = [];
  const connections = mapConnections(edges);
  const openSet = [ ...edges ];

  const followEdge = (startEdge: Mesh2d.Edge, startIndex: 0 | 1): Path => {
    const p0 = startEdge[startIndex];
    const nextEdgeCandidates = openSet.filter(edge => includes(edge, p0));
    if (connections[p0].length > 2 || nextEdgeCandidates.length !== 1) {
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
    const path: Path = [
      ...reverse(followEdge(startEdge, 0)), ...startEdge, ...followEdge(startEdge, 1),
    ];
    allPaths.push(path);
  }

  return allPaths;
};
