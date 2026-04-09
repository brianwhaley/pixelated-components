import { PageTitleHeader, PageSectionHeader } from "@/components/general/semantic";
import '@/css/pixelated.global.css';

export default {
	title: 'General',
	component: PageTitleHeader,
};

export const Page_Header = {
	args: {
		title: "Page Header Example",
	},
	title: 'General',
	component: PageTitleHeader
};

export const Page_Section_Header = {
	args: {
		title: "Section Header Example",
	},
	title: 'General',
	component: PageSectionHeader
};
