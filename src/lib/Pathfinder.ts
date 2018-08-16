import { first, includes, last, maxBy, sumBy } from 'lodash';

import { removeFirst, reverse } from 'lib/Arrays';
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


const connectPaths = (paths: Path[]): { [p: number]: Path[] } => {
  const connections: { [p: number]: Path[] } = {};
  paths.forEach(path => {
    const pathStart = first(path)!;
    const pathFinal = last(path)!;
    if (!connections[pathStart]) {
      connections[pathStart] = [];
    }
    connections[pathStart].push(path);
    if (!connections[pathFinal]) {
      connections[pathFinal] = [];
    }
    connections[pathFinal].push(path);
  });

  return connections;
};

// TODO: This should stitch together that Path[] it returns into a single Path
export const constructLongestPath = (paths: Path[]): Path[] => {
  if (!paths.length) {
    return [];
  }
  let openSet: Path[] = [];
  const candidates: Path[][] = [];
  const connections = connectPaths(paths);
  const followPath = (pathsSoFar: Path[], nextPath: Path, point: Mesh2d.Point) => {
    const pathIndex = openSet.indexOf(nextPath);
    if (pathIndex === -1) {
      candidates.push(pathsSoFar);
      return;
    }
    openSet.splice(pathIndex, 1);
    const nextPathCandidates = removeFirst(connections[point], nextPath);
    if (!nextPathCandidates.length) {
      candidates.push([ ...pathsSoFar, nextPath ]);
      return;
    }
    nextPathCandidates.forEach(pathCandidate => {
      let connectionIndex = pathCandidate.indexOf(point);
      if (connectionIndex === 0) {
        connectionIndex = pathCandidate.length - 1;
      } else {
        connectionIndex = 0;
      }
      followPath([ ...pathsSoFar, nextPath ], pathCandidate, pathCandidate[connectionIndex]);
    });
  };
  paths.forEach(path => {
    openSet = [ ...paths ];
    followPath([], path, first(path)!);
    openSet = [ ...paths ];
    followPath([], path, last(path)!);
  });

  return maxBy(candidates, candidate => sumBy(candidate, path => path.length - 1))!;
};
