import React from 'react';

import { standardMap } from 'assets/maps';
import { parseHexGrid } from 'lib/hexGrid';
import { max, min } from 'lodash';
import Vector2 from 'types/Vector2';

const result = parseHexGrid(standardMap, 30);
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

    const mapSize: Vector2 = [
      max(xCoords)! - min(xCoords)!,
      max(yCoords)! - min(yCoords)!,
    ];

    const center: Vector2 = [
      (width - mapSize[0]) / 2,
      (height - mapSize[1]) / 2,
    ];

    return (
      <svg
        className="d-block"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        {result.edges.map((edge, i) => (
          <line
            key={i}
            x1={center[0] + result.vertices[edge[0]][0]}
            y1={center[1] + result.vertices[edge[0]][1]}
            x2={center[0] + result.vertices[edge[1]][0]}
            y2={center[1] + result.vertices[edge[1]][1]}
            strokeWidth={1}
            stroke="#aaaaaa"
          />
        ))}
        {result.vertices.map((vertex, i) => (
          <circle
            key={i}
            cx={center[0] + vertex[0]}
            cy={center[1] + vertex[1]}
            r={3}
            fill="dodgerblue"
          />
        ))}
      </svg>
    );
  }
}

export default App;
