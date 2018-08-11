import { removeFirst, reverse } from 'lib/arrays';
import { differenceWith, flatten, includes, isEqual, last, uniq } from 'lodash';
import * as Mesh2d from 'types/Mesh2d';

const NUM_EDGES_FOR_CONFLUENCE = 3;

export const edgeComparator = (a: Mesh2d.Edge, b: Mesh2d.Edge) => isEqual(a, b) || isEqual(a, reverse(b));

const getEdgesAtVertex = (
  edges: Mesh2d.Edge[],
  vertexIndex: number,
  maxConnections: number = Infinity,
): Mesh2d.Edge[] => {
  const foundEdges: Mesh2d.Edge[] = [];
  for (const edge of edges) {
    if (includes(edge, vertexIndex)) {
      foundEdges.push(edge);
      if (foundEdges.length === maxConnections) {
        break;
      }
    }
  }
  return foundEdges;
};

const followEdge = (edges: Mesh2d.Edge[], edge: Mesh2d.Edge, startIndex: number): Mesh2d.Path => {
  let currEdge = edge;
  const openSet = [ ...edges ];
  const path: Mesh2d.Path = [ edge[startIndex], edge[1 - startIndex] ];
  const eatCurrEdge = () => {
    openSet.splice(openSet.indexOf(currEdge), 1);
    const edgesAtVertex = getEdgesAtVertex(edges, last(path)!, NUM_EDGES_FOR_CONFLUENCE);
    const nextEdgeCandidates = removeFirst(edgesAtVertex, currEdge);
    if (nextEdgeCandidates.length === 1 && includes(openSet, nextEdgeCandidates[0])) {
      currEdge = nextEdgeCandidates[0];
      path.push(currEdge.find(p => p !== last(path)) as number);
      eatCurrEdge();
    }
  };

  eatCurrEdge();

  return path;
};

const pathToEdges = (path: Mesh2d.Path): Mesh2d.Edge[] => {
  if (path.length < 2) {
    return [];
  }
  const edges: Mesh2d.Edge[] = [];
  const [ firstPoint, ...remainingPoints ] = path;
  let prevPoint = firstPoint;
  remainingPoints.forEach(point => {
    edges.push([ prevPoint, point ]);
    prevPoint = point;
  });

  return edges;
};

export const getLongestPath = (edges: Mesh2d.Edge[], impassableNodes: number[]): Mesh2d.Path => {
  let openSet = [ ...edges ];
  const paths: Mesh2d.Path[] = [];
  const search = (validEdges: Mesh2d.Edge[], startEdge: Mesh2d.Edge, startIndex: number) => {
    const path = followEdge(validEdges, startEdge, startIndex);
    openSet = differenceWith(openSet, pathToEdges(path), edgeComparator);
    paths.push(path);
  };

  // First split the edge network at its confluences (if any)
  uniq(flatten(edges)).forEach(vi => {
    const edgesAtVertex = getEdgesAtVertex(edges, vi, NUM_EDGES_FOR_CONFLUENCE);
    if (edgesAtVertex.length < NUM_EDGES_FOR_CONFLUENCE) {
      return;
    }

    edgesAtVertex.forEach(edge => {
      if (includes(openSet, edge)) {
        search(edges, edge, edge.indexOf(vi));
      }
    });
  });

  // Then look for non-looping paths
  uniq(flatten(openSet)).forEach(vi => {
    const edgesAtVertex = getEdgesAtVertex(edges, vi, 2);
    if (edgesAtVertex.length === 1) {
      const terminalEdge = edgesAtVertex[0];
      if (includes(openSet, terminalEdge)) {
        search(openSet, terminalEdge, terminalEdge.indexOf(vi));
      }
    }
  });

  // Lastly take care of island loops
  while (openSet.length) {
    const edge = openSet[0];
    search(openSet, edge, 0);
  }

  console.log({ paths });

  return [];
};
