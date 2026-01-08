"use server";

import React from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { getClientOnlyPixelatedConfig } from './config';

// Server wrapper: reads server env blob and sanitizes it, then mounts the client provider.
// Important: do NOT import client components at module scope — dynamically import
// the client provider inside the function so this module remains server-safe.
PixelatedServerConfigProvider.propTypes = {
	config: PropTypes.object,
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
