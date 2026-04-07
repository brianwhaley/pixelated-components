import React, { useState, useEffect } from 'react';
import { stringTo1337 } from '@/components/general/utilities';
import { LoremIpsum as LoremIpsumComponent, type LoremIpsumType } from '@/components/integrations/loremipsum';
import { getLipsum, type LipsumType } from '@/components/integrations/lipsum';

/**
 * Text Generation & Placeholder Content Stories
 * 
 * Unified page for text transformation and placeholder generation utilities.
 * Useful for development, testing, and demo content.
 */
const meta = {
	title: 'General/Text Generation',
	tags: ['placeholder', 'utilities'],
} as const;

export default meta;

// ============================================
// LEETSPEAK CONVERTER
// ============================================

type LeetSpeakStoryProps = {
	inputText: string;
	showComparison: boolean;
};

const LeetSpeakTemplate: React.FC<LeetSpeakStoryProps> = ({ inputText, showComparison }) => {
	const [text, setText] = useState(inputText);
	const converted = stringTo1337(text);

	return (
		<div style={{ padding: '2rem' }}>
			<h2>Leetspeak Converter</h2>
			<p style={{ color: '#666', marginBottom: '1.5rem' }}>
				Converts text to leetspeak by replacing letters with numbers. Non-consecutive characters only.
			</p>

			<div style={{ marginBottom: '2rem' }}>
				<label htmlFor="input-text" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
					Input Text:
				</label>
				<textarea
					id="input-text"
					value={text}
					onChange={(e) => setText(e.target.value)}
					style={{
						width: '100%',
						minHeight: '80px',
						padding: '8px',
						fontFamily: 'monospace',
						fontSize: '14px',
						border: '1px solid #ccc',
						borderRadius: '4px',
					}}
				/>
			</div>

			{showComparison && (
				<div style={{
					display: 'grid',
					gridTemplateColumns: '1fr 1fr',
					gap: '1rem',
					marginBottom: '2rem',
				}}>
					<div style={{ padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
						<h3 style={{ marginTop: 0 }}>Original</h3>
						<code style={{ wordBreak: 'break-all' }}>{text}</code>
					</div>
					<div style={{ padding: '1rem', backgroundColor: '#e8f5e9', borderRadius: '4px' }}>
						<h3 style={{ marginTop: 0 }}>Leetspeak</h3>
						<code style={{ wordBreak: 'break-all' }}>{converted}</code>
					</div>
				</div>
			)}

			{!showComparison && (
				<div style={{ padding: '1rem', backgroundColor: '#e8f5e9', borderRadius: '4px', marginBottom: '2rem' }}>
					<h3 style={{ marginTop: 0 }}>Result</h3>
					<code style={{ fontSize: '18px', wordBreak: 'break-all' }}>{converted}</code>
				</div>
			)}

			<div style={{
				padding: '1rem',
				backgroundColor: '#f0f0f0',
				borderRadius: '4px',
				fontFamily: 'monospace',
				fontSize: '12px',
			}}>
				<p style={{ margin: '0 0 0.5rem 0' }}>Mapping:</p>
				<p style={{ margin: '0.25rem 0' }}>o → 0 | l → 1 | z → 2 | e → 3 | a → 4 | s → 5 | b → 6 | t → 7 | g → 9</p>
			</div>
		</div>
	);
};

export const Leetspeak = {
	render: (args: LeetSpeakStoryProps) => <LeetSpeakTemplate {...args} />,
	args: {
		inputText: 'The quick brown fox jumps over the lazy dog',
		showComparison: true,
	},
	argTypes: {
		inputText: {
			control: 'text',
			description: 'Input text to convert to leetspeak',
		},
		showComparison: {
			control: 'boolean',
			description: 'Show side-by-side comparison',
		},
	},
	parameters: {
		docs: {
			description: {
				story: 'Interactive leetspeak converter using the `stringTo1337` utility. Converts letters to numbers intelligently (non-consecutive only).',
			},
		},
	},
};

// ============================================
// LOREM IPSUM
// ============================================

const LoremIpsumTemplate: React.FC<LoremIpsumType> = (props) => {
	return (
		<div style={{ padding: '2rem' }}>
			<h2>Lorem Ipsum Generator</h2>
			<p style={{ color: '#666', marginBottom: '1.5rem' }}>
				Fetches and renders placeholder paragraphs via the lipsum.com API with optional proxy fallback.
			</p>
			<LoremIpsumComponent {...props} />
		</div>
	);
};

export const LoremIpsumStory = {
	render: (args: LoremIpsumType) => <LoremIpsumTemplate {...args} />,
	args: {
		paragraphs: 3,
		seed: undefined,
		proxyBase: undefined,
		className: '',
	},
	argTypes: {
		paragraphs: {
			control: { type: 'range', min: 1, max: 10 },
			description: 'Number of paragraphs to generate',
		},
		seed: {
			control: 'text',
			description: 'Optional seed for content generation',
		},
		proxyBase: {
			control: 'text',
			description: 'Optional proxy base URL',
		},
		className: {
			control: 'text',
			description: 'CSS class to apply',
		},
	},
	parameters: {
		docs: {
			description: {
				story: 'Renders Lorem Ipsum placeholder content by fetching from lipsum.com via the site proxy.',
			},
		},
	},
};

// ============================================
// LIPSUM (Function)
// ============================================

const LipsumFunctionTemplate: React.FC<LipsumType> = (props) => {
	const [result, setResult] = React.useState<string[]>([]);
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	useEffect(() => {
		const fetch = async () => {
			setLoading(true);
			setError(null);
			try {
				const data = await getLipsum(props as LipsumType);
				setResult(data);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to fetch lipsum');
				setResult([]);
			} finally {
				setLoading(false);
			}
		};
		fetch();
	}, [props.LipsumTypeId, props.Amount, props.StartWithLoremIpsum]);

	return (
		<div style={{ padding: '2rem' }}>
			<h2>Lipsum Function</h2>
			<p style={{ color: '#666', marginBottom: '1.5rem' }}>
				Server-side function to fetch placeholder text from lipsum.com. Returns raw text data (not rendered).
			</p>

			<div style={{
				padding: '1rem',
				backgroundColor: '#f5f5f5',
				borderRadius: '4px',
				marginBottom: '1.5rem',
				fontFamily: 'monospace',
				fontSize: '12px',
			}}>
				<p style={{ margin: 0 }}>Type: {props.LipsumTypeId}</p>
				<p style={{ margin: 0 }}>Amount: {props.Amount}</p>
				<p style={{ margin: 0 }}>Start with Lorem Ipsum: {props.StartWithLoremIpsum ? 'Yes' : 'No'}</p>
			</div>

			{loading && <p style={{ color: '#999' }}>Loading...</p>}
			{error && <p style={{ color: '#d32f2f' }}>Error: {error}</p>}

			{result.length > 0 && (
				<div>
					<h3>Result ({result.length} items):</h3>
					<div style={{
						border: '1px solid #ddd',
						borderRadius: '4px',
						padding: '1rem',
						backgroundColor: '#fafafa',
						maxHeight: '400px',
						overflow: 'auto',
					}}>
						{result.map((item, idx) => (
							<div
								key={idx}
								style={{
									padding: '0.75rem',
									marginBottom: idx < result.length - 1 ? '1rem' : 0,
									borderBottom: idx < result.length - 1 ? '1px solid #eee' : 'none',
									fontSize: '14px',
									lineHeight: '1.6',
								}}
							>
								{item}
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export const LipsumFunction = {
	render: (args: LipsumType) => <LipsumFunctionTemplate {...args} />,
	args: {
		LipsumTypeId: 'Paragraph' as const,
		Amount: 3,
		StartWithLoremIpsum: true,
	},
	argTypes: {
		LipsumTypeId: {
			control: { type: 'radio' },
			options: ['Paragraph', 'Word', 'Char'],
			description: 'Type of content to fetch',
		},
		Amount: {
			control: { type: 'range', min: 1, max: 20 },
			description: 'Quantity to fetch',
		},
		StartWithLoremIpsum: {
			control: 'boolean',
			description: 'Start with canonical Lorem Ipsum text',
		},
	},
	parameters: {
		docs: {
			description: {
				story: 'Server-side function that fetches placeholder text from lipsum.com. Use for getting raw text data.',
			},
		},
	},
};
