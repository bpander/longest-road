import Vector2 from 'types/Vector2';

// A point in 2d space (x, y)
export type Vertex = Vector2;

// A list of vertices
export type Path = Vertex[];

// Two vertex indexes, signifies a connection between two vertices
export type Edge = Vector2;

// A list of vertex indexes, describes a polygon
export type Face = number[];

export interface Mesh {
  vertices: Vertex[];
  edges: Edge[];
  faces: Face[];
}
