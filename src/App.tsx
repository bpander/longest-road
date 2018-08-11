import classNames from 'classnames';
import React from 'react';

import { standardMap } from 'assets/maps';
import { removeFirst } from 'lib/arrays';
import { parseHexGrid } from 'lib/hexGrid';
import { head, includes, last, max, meanBy, min } from 'lodash';
import Vector2 from 'types/Vector2';

const result = parseHexGrid(standardMap, 50);
console.log(result);

enum EditMode {
  None,
  Add,
  Subtract,
}

interface AppState {
  viewportSize: Vector2;
  edges: number[];
  editMode: EditMode;
}

class App extends React.Component<{}, AppState> {

  static getViewportSize(): Vector2 {
    return [ window.innerWidth, window.innerHeight ];
  }

  constructor(props: {}) {
    super(props);
    this.state = {
      viewportSize: App.getViewportSize(),
      edges: [],
      editMode: EditMode.None,
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.onResize);
  }

  onResize = () => {
    this.setState({ viewportSize: App.getViewportSize() });
  };

  onEdgeMouseDown: React.MouseEventHandler = e => {
    e.preventDefault();
    const edgeIndex = Number(e.currentTarget.getAttribute('data-edge-index'));
    const wasSelected = includes(this.state.edges, edgeIndex);
    const editMode = (wasSelected) ? EditMode.Subtract : EditMode.Add;
    const edges = (wasSelected)
      ? removeFirst(this.state.edges, edgeIndex)
      : [ ...this.state.edges, edgeIndex ];

    this.setState({ edges, editMode });
    window.addEventListener('mouseup', this.onMouseUp);
  };

  onEdgeMouseEnter: React.MouseEventHandler = e => {
    const edgeIndex = Number(e.currentTarget.getAttribute('data-edge-index'));
    switch (this.state.editMode) {
      case EditMode.Add:
        if (!includes(this.state.edges, edgeIndex)) {
          this.setState({ edges: [ ...this.state.edges, edgeIndex ] });
        }
        break;

      case EditMode.Subtract:
        this.setState({ edges: removeFirst(this.state.edges, edgeIndex) });
        break;
    }
  };

  onMouseUp = () => {
    window.removeEventListener('mouseup', this.onMouseUp);
    this.setState({ editMode: EditMode.None });
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
        className={classNames('scene', { 'scene--drawing': this.state.editMode !== EditMode.None })}
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
              className={classNames('edge', {
                'edge--active': includes(this.state.edges, i),
              })}
              data-edge-index={i}
              onMouseDown={this.onEdgeMouseDown}
              onMouseEnter={this.onEdgeMouseEnter}
            />
          ))}
          {result.vertices.map((vertex, i) => (
            <circle
              key={i}
              cx={vertex[0]}
              cy={vertex[1]}
              r={5}
              className="node"
            />
          ))}
        </g>
      </svg>
    );
  }
}

export default App;
