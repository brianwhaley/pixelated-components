import React from 'react';
import { Callout } from '@/components/general/callout';
import '@/css/pixelated.grid.scss';

export default {
	title: 'Callout',
	component: CalloutManyStories,
};


const ManyStories = () => {

	return (
		<>

			<section className="section" id="nerdjoke-section">
				<div className="section-container">
					<Callout 
						direction='left'
						img='/images/pix/pix-bg-512.png'
						url='/' 
						title='Left Direction'
						subtitle='No Grid wrapper'
						content='Pixelated Technologies is a Digital Services company that specializes in transforming small businesses through custom IT solutions, including web development, social media marketing, search engine optimization, content management, eCommerce solutions, and small business modernization. Our mission is to empower small businesses to thrive in the digital age by providing tailored technology services that drive growth and efficiency.'
					/>
				</div>
			</section>


			<section className="section" id="nerdjoke-section">
				<div className="section-container">
					<Callout 
						direction='right'
						img='/images/pix/pix-bg-512.png'
						url='/' 
						title='Left Direction'
						subtitle='No Grid wrapper'
						content='Pixelated Technologies is a Digital Services company that specializes in transforming small businesses through custom IT solutions, including web development, social media marketing, search engine optimization, content management, eCommerce solutions, and small business modernization. Our mission is to empower small businesses to thrive in the digital age by providing tailored technology services that drive growth and efficiency.'
					/>
				</div>
			</section>


			<section className="section" id="nerdjoke-section">
				<div className="section-container">
					<Callout 
						style='boxed' 
						direction='left'
						img='/images/pix/pix-bg-512.png'
						url='/' 
						title='Left Direction'
						subtitle='No Grid wrapper'
						content='Pixelated Technologies is a Digital Services company that specializes in transforming small businesses through custom IT solutions, including web development, social media marketing, search engine optimization, content management, eCommerce solutions, and small business modernization. Our mission is to empower small businesses to thrive in the digital age by providing tailored technology services that drive growth and efficiency.'
					/>
				</div>
			</section>


			<section className="section" id="nerdjoke-section">
				<div className="section-container">
					<Callout 
						style='boxed' 
						direction='right'
						img='/images/pix/pix-bg-512.png'
						url='/' 
						title='Left Direction'
						subtitle='No Grid wrapper'
						content='Pixelated Technologies is a Digital Services company that specializes in transforming small businesses through custom IT solutions, including web development, social media marketing, search engine optimization, content management, eCommerce solutions, and small business modernization. Our mission is to empower small businesses to thrive in the digital age by providing tailored technology services that drive growth and efficiency.'
					/>
				</div>
			</section>


			<section className="section" id="nerdjoke-section">
				<div className="section-container">
					<div className="row-12col">
						<div className="grid-s2-e12">
							<Callout 
								direction='left'
								img='https://res.cloudinary.com/dlbon7tpq/image/fetch/f_auto,q_auto/https://farm2.static.flickr.com/1819/43210108074_ed27304d0f_b.jpg'
								imgShape='bevel' 
								title='Content Management'
								subtitle='Left Direction, grid wrappers.  Do you have to rely on a web developer to make updates to your website? Would you like to be able to make updates yourself, without needing technical skills? Do you need a content management system that is easy to use and maintain?'
								content='Pixelated Technologies can help you implement a content management system (CMS) that allows you to easily update and manage your website content. We can help you choose the right CMS at the right cost for your business needs, set it up, and provide training and support to ensure you can manage your website effectively.'
							/>
						</div>
					</div>
				</div>
			</section>


			<section className="section" id="nerdjoke-section">
				<div className="section-container">
					<div className="row-12col">
						<div className="grid-s2-e12">
							<Callout 
								direction='right'
								img='https://res.cloudinary.com/dlbon7tpq/image/fetch/f_auto,q_auto/https://farm2.static.flickr.com/1819/43210108074_ed27304d0f_b.jpg'
								imgShape='bevel' 
								title='Content Management'
								subtitle='Left Direction, grid wrappers.  Do you have to rely on a web developer to make updates to your website? Would you like to be able to make updates yourself, without needing technical skills? Do you need a content management system that is easy to use and maintain?'
								content='Pixelated Technologies can help you implement a content management system (CMS) that allows you to easily update and manage your website content. We can help you choose the right CMS at the right cost for your business needs, set it up, and provide training and support to ensure you can manage your website effectively.'
							/>
						</div>
					</div>
				</div>
			</section>


			<section className="section" id="examples-section">
				<div className="section-container">

					<div className="row-6col">
						<div className="gridItem">
							<Callout 
								style='full'
								layout='vertical'
								img='https://www.pixelated.tech/images/icons/webdev.png'
								imgShape='bevel' 
								title=''
								subtitle='Web Development'
								content=''
							/>
						</div>
						<div className="gridItem">
							<Callout 
								style='full'
								layout='vertical'
								img='https://res.cloudinary.com/dlbon7tpq/image/fetch/f_auto,q_auto/https://farm2.static.flickr.com/1819/43210108074_ed27304d0f_b.jpg'
								imgShape='bevel' 
								title=''
								subtitle='Social Media Marketing'
								content=''
							/>
						</div>
						<div className="gridItem">
							<Callout 
								style='full'
								layout='vertical'
								img='https://www.pixelated.tech/images/icons/content.png'
								imgShape='bevel' 
								title=''
								subtitle='Content Management'
								content=''
							/>
						</div>
						<div className="gridItem">
							<Callout 
								style='full'
								layout='vertical'
								img='https://www.pixelated.tech/images/icons/webdev.png'
								imgShape='bevel' 
								title=''
								subtitle='Web Development'
								content=''
							/>
						</div>
						<div className="gridItem">
							<Callout 
								style='full'
								layout='vertical'
								img='https://res.cloudinary.com/dlbon7tpq/image/fetch/f_auto,q_auto/https://farm2.static.flickr.com/1819/43210108074_ed27304d0f_b.jpg'
								imgShape='bevel' 
								title=''
								subtitle='Social Media Marketing'
								content=''
							/>
						</div>
						<div className="gridItem">
							<Callout 
								style='full'
								layout='vertical'
								img='https://www.pixelated.tech/images/icons/content.png'
								imgShape='bevel' 
								title=''
								subtitle='Content Management'
								content=''
							/>
						</div>

					</div>
				</div>
			</section>


			<section className="section" id="nerdjoke-section">
				<div className="section-container">
					<div className="row-3col">
						<div className="gridItem">
							<Callout 
								style='boxed' 
								layout='vertical'
								img='https://www.pixelated.tech/images/icons/webdev.png'
								imgShape='bevel' 
								title='Web Development'
								subtitle='Do you need a new website or web application for your business? Is your current website outdated or not mobile-friendly? Have you focused on other parts of your business and need help with your online presence?'
								content='Pixelated Technologies can be your Virtual Technology Department, providing custom web development solutions tailored to your business needs. We specialize in creating responsive, user-friendly websites and web applications that help small businesses succeed online.'
							/>
						</div>
						<div className="gridItem">
							<Callout 
								style='boxed' 
								layout='vertical'
								img='https://res.cloudinary.com/dlbon7tpq/image/fetch/f_auto,q_auto/https://farm2.static.flickr.com/1819/43210108074_ed27304d0f_b.jpg'
								imgShape='bevel' 
								title=''
								subtitle='Are your social media accounts active and engaging? Are they integrated with your website and other online platforms? Do they help convert prospective customers into current customers?'
								content='Let Pixelated Technologieshelp you develop a comprehensive social media strategy that aligns with your business goals. We can help you create and manage your social media accounts, produce engaging content, and analyze performance metrics to optimize your social media presence.'
							/>
						</div>
						<div className="gridItem">
							<Callout 
								style='boxed' 
								layout='vertical'
								img='https://www.pixelated.tech/images/icons/content.png'
								imgShape='bevel' 
								title='Content Management'
								subtitle='Do you have to rely on a web developer to make updates to your website? Would you like to be able to make updates yourself, without needing technical skills? Do you need a content management system that is easy to use and maintain?'
								content='Pixelated Technologies can help you implement a content management system (CMS) that allows you to easily update and manage your website content. We can help you choose the right CMS at the right cost for your business needs, set it up, and provide training and support to ensure you can manage your website effectively.'
							/>
						</div>
					</div>
				</div>
			</section>


			<div>
				<Callout 
					style='split' 
					direction='left'
					img='https://res.cloudinary.com/dlbon7tpq/image/fetch/f_auto,q_auto/https://farm2.static.flickr.com/1819/43210108074_ed27304d0f_b.jpg'
					title='Content Management'
					subtitle='Do you have to rely on a web developer to make updates to your website? Would you like to be able to make updates yourself, without needing technical skills? Do you need a content management system that is easy to use and maintain?'
					content='Pixelated Technologies can help you implement a content management system (CMS) that allows you to easily update and manage your website content. We can help you choose the right CMS at the right cost for your business needs, set it up, and provide training and support to ensure you can manage your website effectively.'
				/>

				<Callout
					style='split' 
					direction='right'
					img='https://res.cloudinary.com/dlbon7tpq/image/fetch/f_auto,q_auto/https://farm6.static.flickr.com/5562/30577897340_eb945b4ab3_b.jpg'
					title='Content Management'
					subtitle='Do you have to rely on a web developer to make updates to your website? Would you like to be able to make updates yourself, without needing technical skills? Do you need a content management system that is easy to use and maintain?'
					content='Pixelated Technologies can help you implement a content management system (CMS) that allows you to easily update and manage your website content. We can help you choose the right CMS at the right cost for your business needs, set it up, and provide training and support to ensure you can manage your website effectively.'
				/>
			</div>

			<div className="row-2col">
				<div className="gridItem">
					<Callout
						style='overlay' 
						direction='left'
						img='https://res.cloudinary.com/dlbon7tpq/image/fetch/f_auto,q_auto/https://farm6.static.flickr.com/5562/30577897340_eb945b4ab3_b.jpg'
						title='Content Management'
						subtitle=''
						content='Pixelated Technologies can help you implement a content management system (CMS) that allows you to easily update and manage your website content. '
					/>
				</div>
				<div className="gridItem">
					<Callout
						style='overlay' 
						direction='left'
						img='https://res.cloudinary.com/dlbon7tpq/image/fetch/f_auto,q_auto/https://farm6.static.flickr.com/5562/30577897340_eb945b4ab3_b.jpg'
						title='Content Management'
						subtitle=''
						content='Pixelated Technologies can help you implement a content management system (CMS) that allows you to easily update and manage your website content. '
					/>
				</div>
			</div>

		</>
	);
}

export const CalloutManyStories = () => <ManyStories />;
