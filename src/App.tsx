import React from 'react';

import { standardMap } from 'assets/maps';
import { parseHexGrid } from 'lib/hexGrid';
import { head, last, max, meanBy, min } from 'lodash';
import Vector2 from 'types/Vector2';

const result = parseHexGrid(standardMap, 50);
console.log(result);

interface AppState {
  viewportSize: Vector2;
}

class App extends React.Component<{}, AppState> {

  static getViewportSize(): Vector2 {
    return [ window.innerWidth, window.innerHeight ];
  }

  constructor(props: {}) {
    super(props);
    this.state = {
      viewportSize: App.getViewportSize(),
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.onResize);
  }

  onResize = () => {
    this.setState({ viewportSize: App.getViewportSize() });
  };

  render() {
    const [ width, height ] = this.state.viewportSize;

    const xCoords = result.vertices.map(v => v[0]);
    const yCoords = result.vertices.map(v => v[1]);

    const xBounds: Vector2 = [ min(xCoords)!, max(xCoords)! ];
    const yBounds: Vector2 = [ min(yCoords)!, max(yCoords)! ];

    const center: Vector2 = [
      -xBounds[0] + (width - (xBounds[1] - xBounds[0])) / 2,
      -yBounds[0] + (height - (yBounds[1] - yBounds[0])) / 2,
    ];

    return (
      <svg
        className="d-block"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        <g style={{ transform: `translate(${center.map(v => v + 'px').join()})` }}>
          {result.faces.map((face, i) => {
            const vertices = face.map(vi => result.vertices[vi]);
            const x = meanBy(vertices, head);
            const y = meanBy(vertices, last);

            return (
              <React.Fragment key={i}>
                <polygon
                  points={vertices.map(vertex => vertex.join(',')).join(' ')}
                  className="face"
                />
                <text fill="white" x={x} y={y}>{i + 1}</text>
              </React.Fragment>
            );
          })}
          {result.edges.map((edge, i) => (
            <line
              key={i}
              x1={result.vertices[edge[0]][0]}
              y1={result.vertices[edge[0]][1]}
              x2={result.vertices[edge[1]][0]}
              y2={result.vertices[edge[1]][1]}
              className="edge"
            />
          ))}
          {result.vertices.map((vertex, i) => (
            <circle
              key={i}
              cx={vertex[0]}
              cy={vertex[1]}
              r={3}
              className="node"
            />
          ))}
        </g>
      </svg>
    );
  }
}

export default App;
