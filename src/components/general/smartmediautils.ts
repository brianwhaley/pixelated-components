import PropTypes from 'prop-types';

const VIDEO_EXTENSIONS = ['mp4', 'webm', 'ogg', 'ogv', 'mov', 'm4v', 'mkv'];

export function parseNumber(v?: string | number): number | undefined {
	if (typeof v === 'number') return Number.isFinite(v) && v > 0 ? v : undefined;
	if (typeof v === 'string') {
		const n = parseInt(v, 10);
		return Number.isFinite(n) && n > 0 ? n : undefined;
	}
	return undefined;
}

export function safeString(value: any): string | undefined {
	if (value === undefined || value === null) return undefined;
	return String(value);
}

export function sanitizeMediaString(value: any): string | undefined {
	const raw = safeString(value);
	if (!raw) return undefined;
	return raw.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function normalizeProtocolRelativeUrl(src: string): string {
	return src.startsWith('//') ? `https:${src}` : src;
}

export function isVideoUrl(src: string): boolean {
	const clean = safeString(src)?.split('?')[0]?.split('#')[0] ?? '';
	const extension = clean.split('.').pop()?.toLowerCase();
	return !!extension && VIDEO_EXTENSIONS.includes(extension);
}

export function deriveMediaId(props: { id?: string; name?: string; title?: string; alt?: string; src?: string; }) {
	return safeString(props.id)
		|| safeString(props.name)
		|| sanitizeMediaString(props.title)
		|| sanitizeMediaString(props.alt)
		|| sanitizeMediaString(safeString(props.src)?.split('/').pop()?.split('?')[0]?.replace(/\.[^.]+$/, ''))
		|| undefined;
}

export const SmartMediaUtils = {
	parseNumber,
	safeString,
	sanitizeString: sanitizeMediaString,
	normalizeProtocolRelativeUrl,
	isVideoUrl,
	deriveMediaId,
};

export const SmartMediaUtilsPropTypes = {
	src: PropTypes.string.isRequired,
	poster: PropTypes.string,
	variant: PropTypes.oneOf(['cloudinary', 'html']),
	width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	autoPlay: PropTypes.bool,
	muted: PropTypes.bool,
	loop: PropTypes.bool,
	controls: PropTypes.bool,
	playsInline: PropTypes.bool,
	preload: PropTypes.oneOf(['auto', 'metadata', 'none']),
	aboveFold: PropTypes.bool,
	className: PropTypes.string,
	style: PropTypes.object,
	id: PropTypes.string,
	name: PropTypes.string,
	title: PropTypes.string,
	quality: PropTypes.number,
	cloudinaryEnv: PropTypes.string,
	cloudinaryDomain: PropTypes.string,
	cloudinaryTransforms: PropTypes.string,
};
