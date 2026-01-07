
import PropTypes, { InferProps } from "prop-types";


setClientMetadata.propTypes = {
	title: PropTypes.string.isRequired,
	description: PropTypes.string.isRequired,
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

