import React, { useState } from 'react';
import { SidePanel, SidePanelType } from '@/components/general/sidepanel';
import { MenuAccordion } from '@/components/general/menu-accordion';

export default {
	title: 'General',
	component: SidePanel,
	parameters: { layout: 'fullscreen' },
	argTypes: {
		position: {
			control: 'radio',
			options: ['left', 'right'],
			description: 'Side of the screen the panel slides in from',
			table: { defaultValue: { summary: 'left' } }
		},
		width: {
			control: 'text',
			description: 'Width of the panel (e.g. "300px", "50%", "100vw")',
			table: { defaultValue: { summary: '300px' } }
		},
		showOverlay: {
			control: 'boolean',
			description: 'Show a dimmed overlay behind the panel',
			table: { defaultValue: { summary: 'true' } }
		},
		showTab: {
			control: 'boolean',
			description: 'Show a visible tab to toggle the panel',
			table: { defaultValue: { summary: 'true' } }
		},
		tabLabel: {
			control: 'text',
			description: 'Label text inside the tab (if showTab is true)',
		},
		tabIcon: {
			control: 'text',
			description: 'Icon/Text to display in the tab',
		}
	}
};

// --- Shared Data & Components ---

const menuItems = [
	{ name: 'Home', path: '/' },
	{ name: 'About', path: '/about' },
	{ name: 'Services', routes: [
		{ name: 'Web Design', path: '/services/web-design' },
		{ name: 'Development', path: '/services/development' },
		{ name: 'Consulting', path: '/services/consulting' },
	]},
	{ name: 'Contact', path: '/contact' },
];

const Button = ({ onClick, children }: { onClick: () => void, children: React.ReactNode }) => (
<button 
		onClick={onClick}
		style={{
			padding: '0.75rem 1.5rem',
			fontSize: '1rem',
			cursor: 'pointer',
			background: '#007bff',
			color: 'white',
			border: 'none',
			borderRadius: '0.25rem'
		}}
	>
		{children}
	</button>
);

const PageContent = ({ title, desc, onOpen }: { title?: string, desc?: string[], onOpen?: () => void }) => (
<div style={{ padding: '2rem', minHeight: '100vh' }}>
		{onOpen && <Button onClick={onOpen}>Open Panel</Button>}
		<div style={{ marginTop: '2rem' }}>
			{title && <h2>{title}</h2>}
			{desc?.map((d, i) => <p key={i}>{d}</p>)}
		</div>
	</div>
);

// --- Story Wrapper ---

const StoryLayout = (args: SidePanelType & { 
	pageTitle?: string; 
	pageDesc?: string[]; 
	panelContent?: React.ReactNode;
	useMenu?: boolean;
}) => {
	const [isOpen, setIsOpen] = useState(false);

	const handleToggle = () => {
		const newState = !isOpen;
		setIsOpen(newState);
		if (newState && args.useMenu) {
			setTimeout(() => (window as any).moveMenu?.(), 100);
		}
	};

	const handleOpen = () => {
		setIsOpen(true);
		if (args.useMenu) {
			setTimeout(() => (window as any).moveMenu?.(), 100);
		}
	};

	return (
<>
			<PageContent 
				title={args.pageTitle} 
				desc={args.pageDesc} 
				onOpen={!args.showTab ? handleOpen : undefined} 
			/>
			<SidePanel
				{...args}
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
				onToggle={handleToggle}
			>
				{args.useMenu ? (
<div>
						<h2 style={{ marginBottom: '1rem' }}>Navigation</h2>
						<MenuAccordion menuItems={menuItems} />
					</div>
				) : (
args.panelContent || args.children
)}
			</SidePanel>
		</>
	);
};

// --- Stories ---

export const SidePanel_Playground = {
	render: (args: any) => <StoryLayout {...args} />,
	args: {
		position: 'left',
		width: '300px',
		showOverlay: true,
		showTab: true,
		tabIcon: '☰',
		tabLabel: 'Menu',
		pageTitle: 'SidePanel Playground',
		pageDesc: [
			'Use the Controls panel below to experiment with different configurations.',
			'You can toggle the tab, overlay, position, and width dynamically.'
		],
		panelContent: (
<div>
				<h2>Panel Content</h2>
				<p>This content adjusts based on the controls.</p>
				<p>Try changing position, width, or toggling the tab/overlay.</p>
			</div>
		),
	},
};

export const SidePanel_WithAccordionMenu = {
	render: (args: any) => <StoryLayout {...args} />,
	args: {
		position: 'left',
		width: '300px',
		showOverlay: true,
		showTab: true,
		tabIcon: '☰',
		tabLabel: 'Menu',
		useMenu: true,
		pageTitle: 'Accordion Menu Integration',
		pageDesc: [
			'Test the accordion menu inside the panel.',
			'Use controls to test how the menu behaves in different panel configurations (e.g. Right side, different widths).'
		],
	},
};
