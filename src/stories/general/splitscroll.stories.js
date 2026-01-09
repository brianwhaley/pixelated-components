import React from 'react';
import { SplitScroll } from '@/components/general/splitscroll';
import '@/css/pixelated.grid.scss';

export default {
	title: 'General',
	component: SplitScroll,
	decorators: [
		(Story) => (
			<div style={{ height: '100vh', overflow: 'auto' }}>
				<Story />
			</div>
		),
	],
};

export const SplitScroll_Basic = {
	render: () => (
		<SplitScroll>
			<SplitScroll.Section
				img="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d"
				imgAlt="Modern workspace"
				title="Introduction"
				subtitle="Welcome to our story"
			>
				<div style={{ fontSize: '1.125rem', lineHeight: '1.75' }}>
					<p>
						This is a splitscroll-style layout where images on the left stay sticky 
						and layer over each other as you scroll through the content on the right.
					</p>
					<p>
						Perfect for portfolios, product showcases, or storytelling experiences.
					</p>
				</div>
			</SplitScroll.Section>

			<SplitScroll.Section
				img="https://images.unsplash.com/photo-1461749280684-dccba630e2f6"
				imgAlt="Coding workspace"
				title="Our Process"
				subtitle="How we work"
			>
				<div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
					<section>
						<h3 style={{ marginTop: 0 }}>Discovery</h3>
						<p>We start by understanding your needs and goals.</p>
					</section>
					<section>
						<h3>Design</h3>
						<p>Creating beautiful, functional experiences.</p>
					</section>
					<section>
						<h3>Development</h3>
						<p>Building with modern technologies and best practices.</p>
					</section>
				</div>
			</SplitScroll.Section>

			<SplitScroll.Section
				img="https://images.unsplash.com/photo-1498050108023-c5249f4df085"
				imgAlt="Technology"
				title="Technology Stack"
			>
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
					<div style={{ padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
						<h4 style={{ margin: '0 0 0.5rem 0' }}>Frontend</h4>
						<ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
							<li>React</li>
							<li>Next.js</li>
							<li>TypeScript</li>
						</ul>
					</div>
					<div style={{ padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
						<h4 style={{ margin: '0 0 0.5rem 0' }}>Backend</h4>
						<ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
							<li>Node.js</li>
							<li>API Routes</li>
							<li>Serverless</li>
						</ul>
					</div>
					<div style={{ padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
						<h4 style={{ margin: '0 0 0.5rem 0' }}>Infrastructure</h4>
						<ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
							<li>AWS</li>
							<li>CloudFront</li>
							<li>S3</li>
						</ul>
					</div>
				</div>
			</SplitScroll.Section>

			<SplitScroll.Section
				img="https://images.unsplash.com/photo-1551650975-87deedd944c3"
				imgAlt="Team collaboration"
				title="Get Started"
				subtitle="Ready to begin?"
				buttonText="Contact Us"
				url="https://pixelated.tech/contact"
			>
				<div style={{ fontSize: '1.125rem', lineHeight: '1.75' }}>
					<p>
						Ready to bring your vision to life? Let's collaborate on your next project.
					</p>
					<div style={{ 
						marginTop: '2rem', 
						padding: '2rem', 
						backgroundColor: '#007bff', 
						color: 'white',
						borderRadius: '12px'
					}}>
						<h3 style={{ marginTop: 0 }}>Why Choose Us</h3>
						<ul style={{ margin: 0 }}>
							<li>Expert team of developers and designers</li>
							<li>Modern, scalable solutions</li>
							<li>Ongoing support and maintenance</li>
							<li>Proven track record of success</li>
						</ul>
					</div>
				</div>
			</SplitScroll.Section>
		</SplitScroll>
	)
};

export const SplitScroll_ProductShowcase = {
	render: () => (
		<SplitScroll>
			<SplitScroll.Section
				img="https://images.unsplash.com/photo-1523275335684-37898b6baf30"
				imgShape="squircle"
				title="Premium Headphones"
				subtitle="Experience Audio Excellence"
			>
				<div>
					<p style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>
						Immerse yourself in crystal-clear sound with our latest flagship headphones.
					</p>
					<div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
						<div>
							<h4>Features</h4>
							<ul>
								<li>40mm drivers</li>
								<li>Active noise cancellation</li>
								<li>30-hour battery life</li>
								<li>Premium leather cushions</li>
							</ul>
						</div>
						<div>
							<h4>Specifications</h4>
							<ul>
								<li>Frequency: 20Hz - 20kHz</li>
								<li>Impedance: 32Ω</li>
								<li>Weight: 250g</li>
								<li>Bluetooth 5.0</li>
							</ul>
						</div>
					</div>
				</div>
			</SplitScroll.Section>

			<SplitScroll.Section
				img="https://images.unsplash.com/photo-1505740420928-5e560c06d30e"
				imgShape="squircle"
				title="Available in Multiple Colors"
			>
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '2rem' }}>
					{['Midnight Black', 'Pearl White', 'Rose Gold', 'Ocean Blue', 'Forest Green', 'Cherry Red'].map(color => (
						<div 
							key={color}
							style={{ 
								padding: '1rem', 
								textAlign: 'center',
								backgroundColor: '#f0f0f0',
								borderRadius: '8px'
							}}
						>
							{color}
						</div>
					))}
				</div>
			</SplitScroll.Section>

			<SplitScroll.Section
				img="https://images.unsplash.com/photo-1484704849700-f032a568e944"
				imgShape="squircle"
				title="What People Say"
				subtitle="Customer Reviews"
			>
				<div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
					<blockquote style={{ 
						padding: '1.5rem', 
						backgroundColor: '#f8f9fa', 
						borderLeft: '4px solid #007bff',
						margin: 0
					}}>
						<p style={{ margin: '0 0 0.5rem 0' }}>
							"Best headphones I've ever owned. The sound quality is incredible!"
						</p>
						<footer>— Sarah M.</footer>
					</blockquote>
					<blockquote style={{ 
						padding: '1.5rem', 
						backgroundColor: '#f8f9fa', 
						borderLeft: '4px solid #007bff',
						margin: 0
					}}>
						<p style={{ margin: '0 0 0.5rem 0' }}>
							"Comfortable for all-day wear and the battery life is amazing."
						</p>
						<footer>— James K.</footer>
					</blockquote>
				</div>
			</SplitScroll.Section>
		</SplitScroll>
	)
};

export const SplitScroll_Minimal = {
	render: () => (
		<SplitScroll>
			<SplitScroll.Section
				img="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe"
				title="Chapter One"
			>
				<p>Simple content with minimal styling.</p>
			</SplitScroll.Section>

			<SplitScroll.Section
				img="https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead"
				title="Chapter Two"
			>
				<p>Each section can be as simple or complex as you need.</p>
			</SplitScroll.Section>

			<SplitScroll.Section
				img="https://images.unsplash.com/photo-1618172193622-ae2d025f4032"
				title="Chapter Three"
			>
				<p>The splitscroll layout does the heavy lifting for you.</p>
			</SplitScroll.Section>
		</SplitScroll>
	)
};
