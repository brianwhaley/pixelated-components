"use client";

import { useEffect } from 'react';
import { attachProxyCspListener } from '@pixelated-tech/components';

export default function LayoutClient() {
	useEffect(() => {
		// attachProxyCspListener may return a cleanup function in newer component versions
		const maybeDetach: any = attachProxyCspListener();
		return () => { if (typeof maybeDetach === 'function') maybeDetach(); };
	}, []);

	return null;
}
