"use client";

import React from "react";
import { CalloutHeader, CalloutSmall } from "@brianwhaley/pixelated-components";

export default function SocialTags() {
	return (
		<>

			<div className="row-12col">
				<div className="grid-s1-e12">
					<CalloutHeader url="" title="Personal Social Media" />
				</div>
			</div>

			<div className="row-12col">
				<div className="gridItem"><CalloutSmall shape="squircle" url="http://www.linkedin.com/in/brianwhaley" img="/images/logos/linkedin-logo.png" alt="LinkedIn" title={""} content={""} /></div>
				<div className="gridItem"><CalloutSmall shape="squircle" url="http://www.facebook.com/brian.t.whaley" img="/images/logos/facebook-logo.png" alt="Facebook" title={""} content={""} /></div>
				<div className="gridItem"><CalloutSmall shape="squircle" url="http://twitter.com/brianwhaley" img="/images/logos/twitter-logo.png" alt="Twitter" title={""} content={""} /></div>
				<div className="gridItem"><CalloutSmall shape="squircle" url="http://www.youtube.com/user/brianwhaley" img="/images/logos/youtube-logo.png" alt="YouTube" title={""} content={""} /></div>
				<div className="gridItem"><CalloutSmall shape="squircle" url="http://www.pinterest.com/brianwhaley" img="/images/logos/pinterest-logo.png" alt="Pinterest" title={""} content={""} /></div>
				<div className="gridItem"><CalloutSmall shape="squircle" url="http://reddit.com/user/btw-73/saved" img="/images/logos/reddit-logo.png" alt="Reddit" title={""} content={""} /></div>
				<div className="gridItem"><CalloutSmall shape="squircle" url="https://www.goodreads.com/user/show/49377228-brian-whaley" img="/images/logos/goodreads-logo.png" alt="Goodreads" title={""} content={""} /></div>
				<div className="gridItem"><CalloutSmall shape="squircle" url="https://maps.app.goo.gl/j5Tpcxxr9roydxd2A" img="/images/logos/googlemaps-logo.png" alt="Google Maps Travelogue" title={""} content={""} /></div>
				<div className="gridItem"><CalloutSmall shape="squircle" url="http://pixelatedviews.tumblr.com" img="/images/logos/tumblr-logo.png" alt="Feed Reader" title={""} content={""} /></div>
				<div className="gridItem"><CalloutSmall shape="squircle" url="https://www.etsy.com/people/bwhaley73" img="/images/logos/etsy-logo.png" alt="Etsy" title={""} content={""} /></div>
				<div className="gridItem"><CalloutSmall shape="squircle" url="http://trees.ancestry.com/tree/7237865" img="/images/logos/ancestry-logo.jpg" alt="Ancestry" title={""} content={""} /></div>
				<div className="gridItem"><CalloutSmall shape="squircle" url="https://github.com/brianwhaley" img="/images/logos/github-logo.png" alt="Github" title={""} content={""} /></div>
			</div>

		</>
	);
}