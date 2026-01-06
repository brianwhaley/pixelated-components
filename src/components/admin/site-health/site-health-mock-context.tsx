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

SiteHealthMockProvider.propTypes = {
	mocks: PropTypes.object.isRequired,
	children: PropTypes.node.isRequired
};

export type SiteHealthMockProviderType = InferProps<typeof SiteHealthMockProvider.propTypes>;

export function useSiteHealthMockData(): SiteHealthMockDataMap | null {
	return useContext(SiteHealthMockDataContext);
}
