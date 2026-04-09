"use server";

import React from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { getClientOnlyPixelatedConfig } from './config';

// Server wrapper: reads server env blob and sanitizes it, then mounts the client provider.
// Important: do NOT import client components at module scope — dynamically import
// the client provider inside the function so this module remains server-safe.
/**
 * PixelatedServerConfigProvider — Server-side wrapper that loads and sanitizes server config then mounts the client config provider.
 *
 * @param {object} [props.config] - Optional server config object (sanitized before passing to client provider).
 * @param {node} [props.children] - Client-side UI rendered within the provider.
 */
PixelatedServerConfigProvider.propTypes = {
/** Optional sanitized server config object */
	config: PropTypes.object,
	/** Child nodes rendered inside the client provider */
	children: PropTypes.node.isRequired,
};
export type PixelatedServerConfigProviderType = InferProps<typeof PixelatedServerConfigProvider.propTypes>;
export async function PixelatedServerConfigProvider(props: PixelatedServerConfigProviderType) {
	const { config, children } = props;
	const cfg = config ?? getClientOnlyPixelatedConfig();
	const mod = await import('./config.client');
	const Provider = mod.PixelatedClientConfigProvider;
	return <Provider config={cfg}>{children}</Provider>;
}
