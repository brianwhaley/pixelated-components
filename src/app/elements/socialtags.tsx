"use client";

import React from "react";
import { PageSectionHeader } from "@brianwhaley/pixelated-components";
import { Callout } from "@brianwhaley/pixelated-components";

export default function SocialTags() {
	return (
		<>

			<div className="row-12col">
				<div className="grid-s1-e12">
					<PageSectionHeader url="" title="Personal Social Media" />
				</div>
			</div>

			<div className="row-12col">
				<div className="gridItem"><Callout style="full" imgShape="squircle" url="http://www.linkedin.com/in/brianwhaley" img="/images/logos/linkedin-logo.png" imgAlt="LinkedIn" title={""} content={""} /></div>
				<div className="gridItem"><Callout style="full" imgShape="squircle" url="http://www.facebook.com/brian.t.whaley" img="/images/logos/facebook-logo.png" imgAlt="Facebook" title={""} content={""} /></div>
				<div className="gridItem"><Callout style="full" imgShape="squircle" url="http://twitter.com/brianwhaley" img="/images/logos/twitter-logo.png" imgAlt="Twitter" title={""} content={""} /></div>
				<div className="gridItem"><Callout style="full" imgShape="squircle" url="http://www.youtube.com/user/brianwhaley" img="/images/logos/youtube-logo.png" imgAlt="YouTube" title={""} content={""} /></div>
				<div className="gridItem"><Callout style="full" imgShape="squircle" url="http://www.pinterest.com/brianwhaley" img="/images/logos/pinterest-logo.png" imgAlt="Pinterest" title={""} content={""} /></div>
				<div className="gridItem"><Callout style="full" imgShape="squircle" url="http://reddit.com/user/btw-73/saved" img="/images/logos/reddit-logo.png" imgAlt="Reddit" title={""} content={""} /></div>
				<div className="gridItem"><Callout style="full" imgShape="squircle" url="https://www.goodreads.com/user/show/49377228-brian-whaley" img="/images/logos/goodreads-logo.png" imgAlt="Goodreads" title={""} content={""} /></div>
				<div className="gridItem"><Callout style="full" imgShape="squircle" url="https://maps.app.goo.gl/j5Tpcxxr9roydxd2A" img="/images/logos/googlemaps-logo.png" imgAlt="Google Maps Travelogue" title={""} content={""} /></div>
				<div className="gridItem"><Callout style="full" imgShape="squircle" url="http://pixelatedviews.tumblr.com" img="/images/logos/tumblr-logo.png" imgAlt="Feed Reader" title={""} content={""} /></div>
				<div className="gridItem"><Callout style="full" imgShape="squircle" url="https://www.etsy.com/people/bwhaley73" img="/images/logos/etsy-logo.png" imgAlt="Etsy" title={""} content={""} /></div>
				<div className="gridItem"><Callout style="full" imgShape="squircle" url="http://trees.ancestry.com/tree/7237865" img="/images/logos/ancestry-logo.jpg" imgAlt="Ancestry" title={""} content={""} /></div>
				<div className="gridItem"><Callout style="full" imgShape="squircle" url="https://github.com/brianwhaley" img="/images/logos/github-logo.png" imgAlt="Github" title={""} content={""} /></div>
			</div>

		</>
	);
}