import React from 'react';
import PropTypes, { InferProps } from 'prop-types';
import './skeleton.css';

/**
 * Skeleton — renders an accessible placeholder skeleton for text, rectangular blocks, or avatars.
 *
 * Props:
 * @param {('text'|'rect'|'avatar')} [variant='text'] Visual variant to render.
 * @param {number} [lines=1] Number of text lines when variant is 'text'.
 * @param {string|number} [width] Width for text lines (percent) or explicit width for rect/avatar.
 * @param {string|number} [height] Height in pixels (rect/avatar) or CSS string.
 * @param {boolean} [animated=true] Whether the skeleton should animate (respects prefers-reduced-motion).
 */

Skeleton.propTypes = {
/** Visual variant to render: 'text' (lines), 'rect' (rectangle), or 'avatar' (circle). */
	variant: PropTypes.oneOf(['text', 'rect', 'avatar']),
	/** Number of text lines to render when variant is 'text'. */
	lines: PropTypes.number,
	/** Width for text lines (percentage number) or explicit CSS/string width for rect/avatar. */
	width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	/** Height in pixels or CSS string for rect/avatar; ignored for text lines. */
	height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	/** Whether the skeleton should animate (respects prefers-reduced-motion). */
	animated: PropTypes.bool,
};
export type SkeletonType = InferProps<typeof Skeleton.propTypes>;
export function Skeleton({
	variant = 'text',
	lines = 1,
	width,
	height,
	animated = true,
}: SkeletonType) {
	const base = `skeleton ${animated ? 'skeleton--animated' : ''}`;

	if (variant === 'avatar') {
		const avatarStyle: React.CSSProperties | undefined =
      width != null || height != null ? { ...(width != null ? { width } : {}), ...(height != null ? { height } : {}) } : undefined;
		return <div aria-hidden="true" className={`${base} skeleton--avatar`} style={avatarStyle} />;
	}

	if (variant === 'rect') {
		return (
			<div
				aria-hidden="true"
				className={`${base} skeleton--rect`}
				style={{ width: width ?? '100%', height: (height as any) ?? 160 }}
			/>
		);
	}

	return (
		<div aria-hidden="true" className="skeleton-text">
			{Array.from({ length: Math.max(1, Number(lines || 1)) }).map((_, i) => (
				<div
					key={i}
					className={base + ' skeleton-line'}
					style={{ width: typeof width === 'number' ? `${width}%` : (width ?? (i === (lines || 1) - 1 ? '60%' : '100%')) }}
				/>
			))}
		</div>
	);
}
