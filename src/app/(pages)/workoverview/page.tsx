"use client";

import { PageHeader } from "@/app/components/general/pixelated.general";
import { Callout } from "@brianwhaley/pixelated-components";

export default function Work() {
    
	return (
		<div className="section-container">
			<PageHeader title="Work Overview" />
			<div className="row-8col">
				<div className="grid-s2-e6">
					<Callout
						url="/workportfolio"
						img='images/circuitboard.jpg'
						title='Work Portfolio'
						content='I am an Information Technology leader accomplished in building and managing global high-performance teams, 
							launching and managing digital products, and developing and executing unified product and technology strategies. 
							I have managed Highly available e-commerce portals, web sites, web applications, and mobile applications, 
							in the media, finance, pharmaceutical, and telecommunications industries, 
							sizable departments up to 300 staff, budgets to $50 million, using onshore staff, offshore partners, and hybrid teams'
						layout='horizontal' />
				</div>
			</div>
			<div className="row-4col">
				<Callout
					url='/resume' 
					img='/images/icons/resume-icon.png'
					title='Resume'
					layout='vertical' 
					shape='squircle'
					content='A digital version of my curriculum vitae, with a 
						professional summary, contact information, education, skills,
						qualifications, work history, projects, voluteer work, certifications, 
						honors and awards, training and conferences, and rererences.' />
				<Callout
					url='/readme' 
					img='/images/icons/readme-icon.png'
					title='Readme'
					layout='vertical' 
					shape='squircle'
					content='The objective of my README is to share who I am, set some expectations, 
						and share management styles. What I don&#39;t want this document to do is dictate how to work with me. 
						I believe that good leaders adjust to the personality styles of the people working with them.' />
				<Callout
					url='https://www.linkedin.com/in/brianwhaley' 
					img='/images/logos/linkedin-logo.png'
					title='LinkedIn'
					layout='vertical' 
					shape='squircle' 
					content='Check out my LinkedIn profile, including my experience, education, licenses and certifications, 
						projects, volunteering, skills, courses, honors and awards, social media activity, 
						and recommendations from peers and teammates.' />
				<Callout
					url='http://twitter.com/brianwhaley' 
					img='/images/logos/x-logo.png'
					title='X (Twitter)'
					layout='vertical' 
					shape='squircle' 
					content='I use this account to regularly post great articles I come across that strike me on topics such as 
						leadership, coaching, team culture, industry trends, technology topics, architectural patterns, and more. ' />
				<Callout
					url='https://www.goodreads.com/review/list/49377228-brian-whaley?shelf=books-for-work' 
					img='/images/logos/goodreads-logo.png'
					title='Goodreads'
					layout='vertical' 
					shape='squircle' 
					content='This Goodreads Shelf is a collection of books that i have found to be 
						invaluable to build, strengthen, and manage my career and leadership skills over my career, 
						i hope these are useful to you too. '/>
				<Callout
					url='https://github.com/brianwhaley'
					img='images/logos/github-logo.png'
					title='GitHub Portfolio'
					layout='vertical' 
					shape='squircle' 
					content='This is a link to my GitHub account.  I have only uploaded a few pieces of code.
						Repositories include a library of LotusScripts and agents;
						pilot applications written in jQuery, Angular, React and Node, Spring iOS, and Java Android.  
						I enjoy working most on my component library and using it to rabidly build web sites for small businesses.'/>
				<Callout
					url="/recipes" 
					img='images/pizza-gaine.jpg'
					title='Family Recipes'
					layout='vertical' 
					shape='squircle' 
					content='This is my recipe book. It is a collection of recipes from 3 generations of my family, 
						from my friends, and my life as an Italian-American and as a Bariatric Patient. 
						I have cooked most of the recipes myself. I have tasted them all, however, 
						and they are fantastic! Please enjoy!'/>
			</div>
		</div>
	);
}
