import Vector2 from 'types/Vector2';

// A point in 2d space (x, y)
export type Vertex = Vector2;

// A list of vertices, implies a closed shape
export type Polygon = Vertex[];

// Like a Polygon but is made of up references to vertices (vertex indexes)
export type Face = number[];

// Two vertex indexes, signifies a connection between two vertices
export type Edge = Vector2;

export interface Mesh {
  vertices: Vertex[];
  edges: Edge[];
  faces: Face[];
}
