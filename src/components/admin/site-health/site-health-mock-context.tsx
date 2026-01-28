'use client';

import React, { createContext, useContext } from 'react';
import PropTypes, { InferProps } from 'prop-types';

type SiteHealthMockDataMap = Record<string, unknown>;

const SiteHealthMockDataContext = createContext<SiteHealthMockDataMap | null>(null);

export interface SiteHealthMockProviderProps {
  mocks: SiteHealthMockDataMap;
  children: React.ReactNode;
}

export const SiteHealthMockProvider = ({ mocks, children }: SiteHealthMockProviderProps) => {
	return (
		<SiteHealthMockDataContext.Provider value={mocks}>
			{children}
		</SiteHealthMockDataContext.Provider>
	);
};

/**
 * SiteHealthMockProvider — Provider that injects mock site-health data into child components for development and testing.
 *
 * @param {object} [props.mocks] - Map of mock data keyed by site identifier.
 * @param {node} [props.children] - Child nodes that will receive the mock data via context.
 */
SiteHealthMockProvider.propTypes = {
/** Map of mock site-health data */
	mocks: PropTypes.object.isRequired,
	/** Child nodes that consume mock data */
	children: PropTypes.node.isRequired
};

export type SiteHealthMockProviderType = InferProps<typeof SiteHealthMockProvider.propTypes>;

export function useSiteHealthMockData(): SiteHealthMockDataMap | null {
	return useContext(SiteHealthMockDataContext);
}
