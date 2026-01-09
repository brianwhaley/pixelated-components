import React, { useEffect } from 'react';
import { Callout } from "@/components/general/callout";
const cloudinaryAPI = "https://res.cloudinary.com/pixelated-tech/image/fetch/w_600,h_600,c_fill,q_auto,f_auto/";
import { MicroInteractions } from "@/components/general/microinteractions";
import "@/css/pixelated.grid.scss";
import "@/css/pixelated.global.css";

export default {
	title: 'General',
	component: MicroInteractions,
};

const PageMicroInteractions = () => {
	useEffect(() => {
		MicroInteractions({ 
			buttonring: true,
			cartpulse: true,
			formglow: true,
			// grayscalehover: true,
			imghue: true,
			imgtwist: true,	
			scrollfadeElements: '.callout',
		});
	}, []);
	
	return (
		<>
			<div>buttonring : </div>
        	<div className="button">Hover Me (buttonRing)</div>
        	<button className="centered-button">Hover Me (buttonRing)</button>
        	<button className="button">Hover Me (buttonRing)</button>
			<br/><br/>


			<div>cartpulse : </div>
			<div className='pixCart'><div className='button' id='pixCartButton'>Buy</div></div>
			<br/><br/>


			<div>formglow : </div>
			<form>
				<input type="text" name="name" placeholder="Name" />
				<input type="email" name="email" placeholder="Email" />
				<button type="button">Submit</button>
			</form>
			<br/><br/>


			<div>imghue : </div>
			<div>imgtwist : </div>
			<img 
				src="https://www.pixelated.tech/images/pix/pix-bg-512.png" 
				title="Image Hue" 
				alt="Image Hue" 
				style={{width: '150px', height: '150px'}} />
			<br/><br/>


			<div className="row-3col">
				<div className="grid-s2-e3">

					<div>scrollfade : </div>
					<div className="gridItem">
						<Callout style="full" layout="vertical" url={cloudinaryAPI + "https://farm66.static.flickr.com/65535/50797219348_a7f5b18dd5_b.jpg"} 
							img="https://www.pixelvivid.com/images/customs/black-white-splatter.jpg" 
							imgAlt="Black White Splatter" subtitle="Black & White" imgShape="squircle" />
					</div>
					<div className="gridItem">
						<Callout style="full" layout="vertical" url={cloudinaryAPI + "https://farm66.static.flickr.com/65535/50652292218_3df2a75475_b.jpg"} 
							img="https://www.pixelvivid.com/images/customs/blue-splatter-3.jpg" 
							imgAlt="Blue Splatter" subtitle="Winter Blue" imgShape="squircle" />
					</div>
					<div className="gridItem">
						<Callout style="full" layout="vertical" url={cloudinaryAPI + "https://farm66.static.flickr.com/65535/50653036651_8cc8ec0a1c_b.jpg"} 
							img="https://www.pixelvivid.com/images/customs/gold-silver-splatter.jpg" 
							imgAlt="Gold Silver Splatter" subtitle="Gold & Silver" imgShape="squircle" />
					</div>
					<div className="gridItem">
						<Callout style="full" layout="vertical" url={cloudinaryAPI + "https://farm66.static.flickr.com/65535/50664254938_bb746893d0_b.jpg"} 
							img="https://www.pixelvivid.com/images/customs/neon-splatter.jpg" 
							imgAlt="Neon Splatter" subtitle="Neon Splatter" imgShape="squircle" />
					</div>
					<div className="gridItem">
						<Callout style="full" layout="vertical" url={cloudinaryAPI + "https://farm66.static.flickr.com/65535/50653037331_449ba8cece_b.jpg"} 
							img="https://www.pixelvivid.com/images/customs/blue-marble.jpg" 
							imgAlt="Blue Marble" subtitle={"Cobalt / Planet X"} imgShape="squircle" />
					</div>

				</div>
			</div>

		</>
	);
};

export const Micro_Interactions = () => <PageMicroInteractions />;