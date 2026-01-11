import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Stub @pixelated-tech/components to avoid requiring deep optional modules
vi.mock('@pixelated-tech/components/server', () => ({
	getFullPixelatedConfig: () => ({
		nextAuth: { secret: 'test-secret' },
		google: { client_id: 'g-id', client_secret: 'g-secret' },
	}),
}));

vi.mock('@pixelated-tech/components', () => ({
	server: {
		getFullPixelatedConfig: () => ({
			nextAuth: { secret: 'test-secret', url: 'https://localhost:3006' },
			google: { client_id: 'g-id', client_secret: 'g-secret' },
		}),
	},
}));

// Provide a minimal adminserver integration mock so tests that import it can spy on
// `performAxeCoreAnalysis` without pulling in optional heavy modules from the real package.
vi.mock('@pixelated-tech/components/adminserver', () => ({
	performAxeCoreAnalysis: vi.fn(),
}));