
import PropTypes, { InferProps } from "prop-types";


/**
 * setClientMetadata — updates document head metadata (title, description, keywords, og:title, og:description).
 *
 * @param {string} [props.title] - Document title to set.
 * @param {string} [props.description] - Meta description content to set.
 * @param {string} [props.keywords] - Comma-separated keywords string to set in the meta keywords tag.
 */
setClientMetadata.propTypes = {
/** Title to set as document.title and og:title. */
	title: PropTypes.string.isRequired,
	/** Meta description text applied to several description tags. */
	description: PropTypes.string.isRequired,
	/** Comma-separated keywords string applied to meta[name='keywords']. */
	keywords: PropTypes.string.isRequired,
};
export type SetClientMetadataType = InferProps<typeof setClientMetadata.propTypes>;
export function setClientMetadata(props: SetClientMetadataType) {
	const { title, description, keywords } = props;
	document.title = title;
	(document.querySelector("meta[property='og:title']"))?.setAttribute('content', title);
	(document.querySelector("meta[name='description']"))?.setAttribute('content', description);
	(document.querySelector("meta[property='og:description']"))?.setAttribute('content', description);
	(document.querySelector("meta[itemprop='description']"))?.setAttribute('content', description);
	(document.querySelector("meta[name='keywords']"))?.setAttribute('content', keywords);
};

