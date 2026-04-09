"use client";

import React, { useState } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import './tab.css';

const TabItemPropTypes = {
	id: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,//
	content: PropTypes.node.isRequired,
};
// type TabItemType = InferProps<typeof TabItemPropTypes>;

/**
 * Tab — simple tabbed UI: clickable headers with content panes.
 *
 * @param {arrayOf} [props.tabs] - Array of tab items: { id, label, content }.
 * @param {oneOf} [props.orientation] - Tab orientation: 'top' | 'bottom' | 'left' | 'right'.
 * @param {string} [props.defaultActiveTab] - Id of the tab that should be active initially.
 * @param {function} [props.onTabChange] - Callback invoked when the active tab changes (tabId).
 */
Tab.propTypes = {
/** Array of tabs to render, each should include id, label, and content. */
	tabs: PropTypes.arrayOf(PropTypes.shape(TabItemPropTypes).isRequired).isRequired,
	/** Layout orientation for the tab headers. */
	orientation: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
	/** Optional default active tab id. */
	defaultActiveTab: PropTypes.string,
	/** Optional change handler called with the new tab id. */
	onTabChange: PropTypes.func,
};
export type TabType = InferProps<typeof Tab.propTypes>;
export function Tab({
	tabs,
	orientation = 'top',
	defaultActiveTab,
	onTabChange
}: TabType) {
	const [activeTab, setActiveTab] = useState<string>(
		defaultActiveTab || tabs[0]?.id || ''
	);

	const handleTabClick = (tabId: string) => {
		setActiveTab(tabId);
		onTabChange?.(tabId);
	};

	const activeContent = tabs.find(tab => tab.id === activeTab)?.content;

	const tabClass = `tab-container tab-${orientation}`;

	return (
		<div className={tabClass}>
			<div className="tab-headers">
				{tabs.map(tab => (
					<button
						key={tab.id}
						className={`tab-header ${activeTab === tab.id ? 'active' : ''}`}
						onClick={() => handleTabClick(tab.id)}
					>
						{tab.label}
					</button>
				))}
			</div>
			<div className="tab-content">
				{activeContent}
			</div>
		</div>
	);
}
