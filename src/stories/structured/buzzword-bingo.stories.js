import { BuzzwordBingo } from '@/components/general/buzzwordbingo';
import { buzzwords } from "@/components/general/buzzwordbingo.words";
import '@/css/pixelated.global.css';

export default {
	title: 'Structured',
	component: BuzzwordBingo
};

export const BuzzwordBingoStory = {
	args: {
		buzzwords: buzzwords
	}
};
