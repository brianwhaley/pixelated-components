import type { PageData } from './types';

export interface SavePageRequest {
	name: string;
	data: PageData;
}

export interface SavePageResponse {
	success: boolean;
	message: string;
	filename?: string;
}

export interface LoadPageResponse {
	success: boolean;
	data?: PageData;
	message?: string;
}

export interface ListPagesResponse {
	success: boolean;
	pages: string[];
	message?: string;
}

export interface DeletePageResponse {
	success: boolean;
	message: string;
}
