 
'use client';
 
/* https://randyperkins2k.medium.com/writing-a-simple-markdown-parser-using-javascript-1f2e9449a558 */

import React from "react";
import PropTypes, { InferProps } from "prop-types";
import { SmartImage } from "./smartimage";
import { usePixelatedConfig } from "../config/config.client";
import "./markdown.css";

/* ========== MARKDOWN ========== */
/**
 * Markdown — Renders a simplified markdown string into HTML (supports headings, lists, links, images, inline code).
 *
 * @param {string} [props.markdowndata] - Markdown input string to be parsed and rendered as HTML.
 */
Markdown.propTypes = {
	/** Markdown input (string) to render */
	markdowndata: PropTypes.string.isRequired,
};
export type MarkdownType = InferProps<typeof Markdown.propTypes>;
export function Markdown(props: MarkdownType) {	
	function markdownParser (text: any) {
		const config = usePixelatedConfig();
		const toHTML = text
			.replace(/^#{6}\s(.*$)/gim, '<h6>$1</h6>') // h6 tag
			.replace(/^#{5}\s(.*$)/gim, '<h5>$1</h5>') // h5 tag
			.replace(/^#{4}\s(.*$)/gim, '<h4>$1</h4>') // h4 tag
			.replace(/^#{3}\s(.*$)/gim, '<h3>$1</h3>') // h3 tag
			.replace(/^#{2}\s(.*$)/gim, '<h2>$1</h2>') // h2 tag
			.replace(/^#{1}\s(.*$)/gim, '<h1>$1</h1>') // h1 tag
			.replace(/(=|-|\*){3}/gim, '<hr />') // horizontal rule
			.replace(/!\[(.*?)\]\((.*?)\)/gim, <SmartImage alt='$1' title='$1' src='$2' 
				cloudinaryEnv={config?.cloudinary?.product_env}
				cloudinaryDomain={config?.cloudinary?.baseUrl}
				cloudinaryTransforms={config?.cloudinary?.transforms} />) // images
			.replace(/\[([^[]+)\]\((.*)\)/gim, '<a href="$2">$1</a>') // links
			.replace(/^\*{1}\s+(.*$)/gim, '<ul><li>$1</li></ul>') // unordered list
			.replace(/<\/ul>\s?<ul>/g, '') // duplicate unordered list
			.replace(/^\d+\.\s+(.*$)/gim, '<ol><li>$1</li></ol>') // ordered list
			.replace(/<\/ol>\s?<ol>/g, '') // duplicate ordered list
			.replace(/:"(.*?)":/gim, '<q>$1</q>') // quote
			.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>') // blockquote
			.replace(/`(.*?)`/gim, '<code>$1</code>') // inline code
			.replace(/\*{2}(.*?)\*{2}/gim, '<b>$1</b>') // bold text
			.replace(/\*{1}(.*?)\*{1}/gim, '<i>$1</i>') // italic text
			.replace(/~{2}(.*?)~{2}/gim, '<b>$1</b>') // strikethrough
			.replace(/(^[A-z].+)/gim, '<p>$1</p>') // paragraphs
			//.replace(/\n$/gim, '<br />') // newline
			//.replace(//gim, '')
			;
		return toHTML.trim(); // using trim method to remove whitespace
	}
	return (
		<div className="section-container">
			<div className="markdown" dangerouslySetInnerHTML={{__html: markdownParser(props.markdowndata) }} />
		</div>
	);
}

