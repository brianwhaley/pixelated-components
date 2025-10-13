import React, { } from 'react';

export default function Footer() {
  return (
    <>
      <br />
      <div className="centered">
        <p className="footer-text">&copy; {new Date().getFullYear()} InformationFocus. All rights reserved.</p>
      </div>
      <br /><br />
    </>
  );
}
