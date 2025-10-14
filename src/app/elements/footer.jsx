import React, { } from 'react';

export default function Footer() {
  return (
    <>
    	<hr style={{ margin: "0 auto", width: "80%" }} />
      <br />
      <div className="centered">
        <p className="footer-text">&copy; {new Date().getFullYear()} InformationFocus. All rights reserved.</p>
      </div>
      <br /><br />
    </>
  );
}
