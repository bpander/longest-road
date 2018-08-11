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
