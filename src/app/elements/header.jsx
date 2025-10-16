import React, { } from 'react';

export default function Header() {
  return (
    <div>
      <div className="logo"><a href="/"><img src="/images/informationfocus.png" className="logo" alt="InformationFocus" /></a></div>
      <div className="title"><a href="/"><h1>InformationFocus</h1></a></div>
      <div className="contactinfo">
        Mary Ann Sarao, Principal
        <br />
        maryann.sarao@gmail.com
      </div>
    </div>
  );
}
