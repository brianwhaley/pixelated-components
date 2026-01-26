import React from 'react';
import PropTypes, { InferProps } from 'prop-types';
import './skeleton.css';

Skeleton.propTypes = {
	variant: PropTypes.oneOf(['text', 'rect', 'avatar']),
	lines: PropTypes.number,
	width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
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
