import PropTypes, { InferProps } from 'prop-types';
import { smartFetch } from '../general/smartfetch';

// https://www.outsystems.com/forge/component-documentation/12204/lorem-ipsum-lipsum-com-o11/0

/**
 * getLipsum — Fetch placeholder text from lipsum.com and return an array of paragraphs.
 *
 * @param {oneOf} [props.LipsumTypeId] - Type of content to request ('Paragraph', 'Word', 'Char').
 * @param {number} [props.Amount] - Quantity to request (number of paragraphs/words/chars).
 * @param {boolean} [props.StartWithLoremIpsum] - Whether the text should start with the classic Lorem Ipsum opening.
 */
getLipsum.propTypes = {
/** Type of lipsum content to request */
	LipsumTypeId: PropTypes.oneOf(['Paragraph', 'Word', 'Char']).isRequired,
	/** Number of items to request */
	Amount: PropTypes.number.isRequired,
	/** Start with the canonical Lorem Ipsum text */
	StartWithLoremIpsum: PropTypes.bool,
};
export type LipsumType = InferProps<typeof getLipsum.propTypes>;
export async function getLipsum(props: LipsumType): Promise<string[]> {
	const { LipsumTypeId, Amount, StartWithLoremIpsum } = props;
	const proxyURL = "https://proxy.pixelated.tech/prod/proxy?url=";
	const baseURL = "https://www.lipsum.com/feed/html";
	const qs = `?LipsumTypeId=${LipsumTypeId}&amount=${Amount}&StartWithLoremIpsum=${StartWithLoremIpsum}`;
	const fulURL = `${proxyURL}${baseURL}${qs}`;
	try {
		const html = await smartFetch(fulURL, { responseType: 'text' });
		
		const parser = new DOMParser();
		const doc = parser.parseFromString(html, 'text/html');
		const lipsum = doc.getElementById('lipsum');
		const paragraphs = lipsum?.querySelectorAll('p');
		const strings: string[] = [];
		paragraphs?.forEach((p: any) => {
			strings.push(p.textContent.trim());
		});
		return strings;
	} catch (error) {
		console.error('Failed to fetch page: ', error);
		return [];
	}
}
