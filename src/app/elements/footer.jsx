import React, { } from 'react';
import { GoogleAnalytics } from "@pixelated-tech/components";

export default function Footer() {
	return (
    	<>
			<GoogleAnalytics id="G-0FNGDMEKMS" />
    		<hr style={{ margin: "0 auto", width: "80%" }} />
      		<br />
      		<div className="centered">
        		<p className="footer-text">&copy; {new Date().getFullYear()} InformationFocus. All rights reserved.</p>
      		</div>
      		<br /><br />
    	</>
  	);
}
