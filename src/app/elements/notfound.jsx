import React, { } from 'react';

export default function NotFound() {
  return (
    <section>
      <div className="section-container" style={{ position: 'relative' }}>
        <img alt="Page Not Found" src="https://farm6.static.flickr.com/5762/23917768592_1c2353b913_b.jpg" className="horizontal-centered" style={{ padding: '0 5px' }} />
        <div className="horizontal-centered" style={{ top: '10px', width: '100%' }}>
          <h1 className="centered text-outline-halo" style={{ fontSize: '2em' }}>OMG.  You Broke It.</h1>
          <div className="centeredbutton"><a href="/index.html" target="_self" rel="noopener noreferrer">Go Home</a></div>
        </div>
      </div>
    </section>
  );
}
