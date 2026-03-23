import React, { useState, useEffect } from 'react';

import { createPageURLs, jsonToSitemapEntries } from '@/components/general/sitemap';
import myRoutes from "@/data/routes.json";

export default {
	title: 'General',
	component: createPageURLs
};

const PageURLs = () => {
	const [ myPageURLs, setMyPageURLs ] = useState();
	useEffect( () => {
  		async function getMyPageURLs() {
			const step1 = await createPageURLs(myRoutes.routes, window.location.origin);
			const step2 = jsonToSitemapEntries(step1);
			setMyPageURLs(step2);
		}
		getMyPageURLs();
	}, []);
	return (
		<>
			{ myPageURLs }
		</>
	);
};

export const Sitemap_XML = () => <PageURLs />;