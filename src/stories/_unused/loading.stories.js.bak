import React, { useEffect } from 'react';
import { Loading, ToggleLoading } from '@/components/general/loading';
import '@/css/pixelated.global.css';

export default {
	title: 'General',
	component: Loading
};

const Wrapper = () => {
	useEffect(() => {
		ToggleLoading({ show: true });
	}, []);
	return (
		<>
			<Loading />
		</>
	);
};

export const LoadingSpinner = () => <Wrapper />;
LoadingSpinner.args = {};
