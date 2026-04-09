// Font definitions for web-safe fonts, generic families, and Google Fonts detection
export interface FontOption {
  value: string;
  label: string;
  category?: string;
}

// Web-safe fonts available on most operating systems
export const WEB_SAFE_FONTS: FontOption[] = [
	{ value: 'Arial', label: 'Arial' },
	{ value: 'Bookman', label: 'Bookman' },
	{ value: 'Comic Sans MS', label: 'Comic Sans MS' },
	{ value: 'Courier', label: 'Courier' },
	{ value: 'Courier New', label: 'Courier New' },
	{ value: 'Garamond', label: 'Garamond' },
	{ value: 'Geneva', label: 'Geneva' },
	{ value: 'Georgia', label: 'Georgia' },
	{ value: 'Helvetica', label: 'Helvetica' },
	{ value: 'Helvetica Neue', label: 'Helvetica Neue' },
	{ value: 'Impact', label: 'Impact' },
	{ value: 'Lucida Console', label: 'Lucida Console' },
	{ value: 'Monaco', label: 'Monaco' },
	{ value: 'Palatino', label: 'Palatino' },
	{ value: 'Roboto', label: 'Roboto' },
	{ value: 'Segoe UI', label: 'Segoe UI' },
	{ value: 'System', label: 'System' },
	{ value: 'Apple System', label: 'Apple System' },
	{ value: 'BlinkMacSystemFont', label: 'BlinkMacSystemFont' },
	{ value: 'Tahoma', label: 'Tahoma' },
	{ value: 'Times', label: 'Times' },
	{ value: 'Times New Roman', label: 'Times New Roman' },
	{ value: 'Trebuchet MS', label: 'Trebuchet MS' },
	{ value: 'Verdana', label: 'Verdana' },
	{ value: 'New York', label: 'New York' },
	{ value: 'Oxygen', label: 'Oxygen' },
	{ value: 'Ubuntu', label: 'Ubuntu' },
	{ value: 'Cantarell', label: 'Cantarell' },
	{ value: 'Fira Sans', label: 'Fira Sans' },
	{ value: 'Droid Sans', label: 'Droid Sans' },
];

// Generic font families that work across all systems
export const GENERIC_FAMILIES: FontOption[] = [
	{ value: 'cursive', label: 'cursive' },
	{ value: 'fantasy', label: 'fantasy' },
	{ value: 'monospace', label: 'monospace' },
	{ value: 'sans-serif', label: 'sans-serif' },
	{ value: 'serif', label: 'serif' },
	{ value: 'system-ui', label: 'system-ui' },
	{ value: 'ui-monospace', label: 'ui-monospace' },
	{ value: 'ui-rounded', label: 'ui-rounded' },
	{ value: 'ui-sans-serif', label: 'ui-sans-serif' },
	{ value: 'ui-serif', label: 'ui-serif' },
];

// Combined list of all web-safe fonts and generic families
export const ALL_WEBSAFE_FONTS: FontOption[] = [
	...WEB_SAFE_FONTS,
	...GENERIC_FAMILIES
];