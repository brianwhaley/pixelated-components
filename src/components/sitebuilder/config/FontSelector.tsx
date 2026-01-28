import React, { useState, useEffect, useMemo } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { getFontOptions } from './google-fonts';
import { WEB_SAFE_FONTS, GENERIC_FAMILIES, type FontOption } from './fonts';
import './FontSelector.css';

interface FontSelectorProps {
	id: string;
	name: string;
	label: string;
	fontType: 'google' | 'websafe' | 'generic';
	required?: boolean;
	placeholder?: string;
	value?: string;
	onChange?: (value: string) => void;
}

/**
 * FontSelector — Single-font picker that supports Google Fonts, web-safe fonts, and generic families with autocomplete.
 *
 * @param {string} [props.id] - Input id attribute.
 * @param {string} [props.name] - Input name attribute.
 * @param {string} [props.label] - Display label for the selector.
 * @param {oneOf} [props.fontType] - Font source type: 'google' | 'websafe' | 'generic'.
 * @param {boolean} [props.required] - Whether the field is required.
 * @param {string} [props.placeholder] - Placeholder text shown when empty.
 * @param {string} [props.value] - Current selected font value.
 * @param {function} [props.onChange] - Callback invoked when selection changes (receives the font value).
 */
FontSelector.propTypes = {
/** Input id attribute */
	id: PropTypes.string.isRequired,
	/** Input name attribute */
	name: PropTypes.string.isRequired,
	/** Display label */
	label: PropTypes.string.isRequired,
	/** Font source type */
	fontType: PropTypes.oneOf(['google', 'websafe', 'generic']).isRequired,
	/** Required flag */
	required: PropTypes.bool,
	/** Placeholder text */
	placeholder: PropTypes.string,
	/** Selected font value */
	value: PropTypes.string,
	/** Change handler receives new font value */
	onChange: PropTypes.func,
};
export type FontSelectorType = InferProps<typeof FontSelector.propTypes>;
export function FontSelector(props: FontSelectorType) {
	const { id, name, label, fontType, required = false, placeholder, value = '', onChange } = props;
	const [inputValue, setInputValue] = useState(value);
	const [googleFonts, setGoogleFonts] = useState<FontOption[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [showDropdown, setShowDropdown] = useState(false);

	// Load Google Fonts for autocomplete
	useEffect(() => {
		if (fontType === 'google') {
			setIsLoading(true);
			getFontOptions().then(options => {
				setGoogleFonts(options);
				setIsLoading(false);
			}).catch(() => {
				setIsLoading(false);
			});
		}
	}, [fontType]);

	// Get options based on font type
	const options = useMemo(() => {
		switch (fontType) {
		case 'google':
			return googleFonts;
		case 'websafe':
			return WEB_SAFE_FONTS;
		case 'generic':
			return GENERIC_FAMILIES;
		default:
			return [];
		}
	}, [fontType, googleFonts]);

	// Filter options based on input
	const filteredOptions = useMemo(() => {
		if (!inputValue) return options.slice(0, 10); // Show first 10 when no input

		return options.filter(option =>
			option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
      option.value.toLowerCase().includes(inputValue.toLowerCase())
		).slice(0, 10); // Limit to 10 results
	}, [options, inputValue]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setInputValue(newValue);
		setShowDropdown(true);
		onChange?.(newValue);
	};

	const handleOptionSelect = (option: FontOption) => {
		setInputValue(option.value);
		setShowDropdown(false);
		onChange?.(option.value);
	};

	const handleFocus = () => {
		setShowDropdown(true);
	};

	const handleBlur = () => {
		// Delay hiding dropdown to allow clicks on options
		setTimeout(() => setShowDropdown(false), 200);
	};

	// Generate tooltip with Google Fonts link for Google fonts
	const getTooltip = () => {
		if (fontType === 'google' && inputValue) {
			const fontName = inputValue.replace(/\s+/g, '+');
			return `👁️ [Preview ${inputValue} on Google Fonts](https://fonts.google.com/specimen/${fontName})`;
		}
		return null;
	};

	return (
		<div className="font-selector-container">
			<label htmlFor={id} className="font-selector-label">
				{label}
				{required && <span className="font-selector-required">*</span>}
				{getTooltip() && (
					<span className="font-selector-tooltip" title={getTooltip()!.replace(/\[([^\]]+)\]\([^)]+\)/, '$1')}>
            👁️
					</span>
				)}
			</label>

			<div className="font-selector-input-container">
				<input
					type="text"
					id={id}
					name={name}
					value={inputValue ?? ''}
					onChange={handleInputChange}
					onFocus={handleFocus}
					onBlur={handleBlur}
					placeholder={placeholder ?? undefined}
					required={required ?? false}
					autoComplete="off"
					className="font-selector-input"
				/>

				{showDropdown && filteredOptions.length > 0 && (
					<div className="font-selector-dropdown">
						{isLoading ? (
							<div className="font-selector-loading">Loading fonts...</div>
						) : (
							filteredOptions.map((option) => (
								<div
									key={option.value}
									className="font-selector-option"
									onClick={() => handleOptionSelect(option)}
									onKeyDown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.preventDefault();
											handleOptionSelect(option);
										}
									}}
									tabIndex={0}
									role="option"
									aria-selected={inputValue === option.value}
								>
									<span className="font-selector-font-name">{option.label}</span>
									{option.category && (
										<span className="font-selector-font-category">({option.category})</span>
									)}
								</div>
							))
						)}
					</div>
				)}
			</div>
		</div>
	);
}

/**
 * FontSelector — Single-font picker that supports Google Fonts, web-safe fonts, and generic families with autocomplete.
 *
 * @param {string} [props.id] - Input id attribute.
 * @param {string} [props.name] - Input name attribute.
 * @param {string} [props.label] - Display label for the selector.
 * @param {oneOf} [props.fontType] - Font source type: 'google' | 'websafe' | 'generic'.
 * @param {boolean} [props.required] - Whether the field is required.
 * @param {string} [props.placeholder] - Placeholder text shown when empty.
 * @param {string} [props.value] - Current selected font value.
 * @param {function} [props.onChange] - Callback invoked when selection changes (receives the font value).
 */
FontSelector.propTypes = {
/** Input id attribute */
	id: PropTypes.string.isRequired,
	/** Input name attribute */
	name: PropTypes.string.isRequired,
	/** Display label */
	label: PropTypes.string.isRequired,
	/** Font source type */
	fontType: PropTypes.oneOf(['google', 'websafe', 'generic']).isRequired,
	/** Required flag */
	required: PropTypes.bool,
	/** Placeholder text */
	placeholder: PropTypes.string,
	/** Selected font value */
	value: PropTypes.string,
	/** Change handler receives new font value */
	onChange: PropTypes.func,
};