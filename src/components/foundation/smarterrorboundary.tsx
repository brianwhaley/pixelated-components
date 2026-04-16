'use client';

import React from 'react';
import PropTypes from 'prop-types';

type SmartErrorBoundaryProps = {
  boundaryName?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

type SmartErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

export class SmartErrorBoundary extends React.Component<SmartErrorBoundaryProps, SmartErrorBoundaryState> {
	static propTypes = {
		boundaryName: PropTypes.string,
		fallback: PropTypes.node,
		children: PropTypes.node.isRequired,
	};

	constructor(props: SmartErrorBoundaryProps) {
		super(props);
		this.state = {
			hasError: false,
			error: undefined,
		};
	}

	static getDerivedStateFromError(error: Error) {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, info: React.ErrorInfo) {
		console.error(
			`[SmartErrorBoundary] ${this.props.boundaryName ?? 'Boundary'} error:`,
			error,
			info
		);
	}

	render() {
		if (this.state.hasError) {
			return this.props.fallback ?? (
				<div className="smart-error-boundary-fallback">
					<p>
            Sorry, something went wrong loading{' '}
						{this.props.boundaryName ?? 'this section'}.
					</p>
				</div>
			);
		}

		return this.props.children;
	}
}
