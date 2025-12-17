"use client";

import { PageSection, Callout } from '@pixelated-tech/components';

export default function UnderConstruction() {
	return (
		<html lang="en">
			<body style={{ backgroundColor: "white !important" }}>
				<style>{`
					.callout .callout-image a, 
					.callout .callout-image img {
						object-fit: contain !important;
						object-position: bottom !important;
					}
				`}</style>
				<PageSection columns={1} maxWidth="800px">
					<Callout
						variant="default"
						layout="vertical"
						img="/images/stock/construction-sign-white-background-3d-mesh-vector-illustration.jpg"
						title="Under Construction"
						subtitle="We're working hard to bring you something amazing. Check back soon!"
					/>
				</PageSection>
			</body>
		</html>
	);
}