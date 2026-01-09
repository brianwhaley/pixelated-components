import { CompoundFontSelector } from '../../components/sitebuilder/config/CompoundFontSelector';

export default {
	title: 'SiteBuilder/Config/CompoundFontSelector',
	component: CompoundFontSelector,
	parameters: {
		layout: 'padded',
	},
	argTypes: {
		label: { control: 'text' },
		required: { control: 'boolean' },
		value: { control: 'text' },
	},
	args: {
		id: 'font-selector',
		name: 'font-selector',
		label: 'Font Stack',
		required: false,
		value: '"Montserrat", Arial, sans-serif',
	},
};

export const Playground = {};