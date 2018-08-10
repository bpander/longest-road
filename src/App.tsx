import React from 'react';

import { standardMap } from 'assets/maps';
import { parseHexGrid } from 'lib/hexGrid';

const result = parseHexGrid(standardMap, 30);
console.log(result);

class App extends React.Component {
  render() {
    return (
      <div style={{ position: 'relative' }}>
        {result.vertices.map((vertex, i) => (
          <div
            key={i}
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              position: 'absolute',
              background: 'black',
              transform: `translate(${100 + vertex[0]}px, ${100 + vertex[1]}px)`,
            }}
          />
        ))}
      </div>
    );
  }
}

export default App;
