/* eslint-disable */

/* https://randyperkins2k.medium.com/writing-a-simple-markdown-parser-using-javascript-1f2e9449a558 */

import React, { Component } from "react";
import PropTypes from 'prop-types'
import "./pixelated.markdown.css";
// import markdowndata from "./readme.md";

export class Markdown extends Component {
	static propTypes = {
		markdowndata: PropTypes.string.isRequired,
	}
	constructor(props) {
		super(props);
		// this.state = { markdown: '' };
	}
	/* 
	UNSAFE_componentWillMount() {  
		fetch(this.props.data)
			.then(response => { return response.text(); })
			.then(text => { this.setState({ markdown: text }); })
			.catch(err => console.log(err));
	}
	*/
	render () {
		return (
			<div className="section-container">
				<div className="markdown" dangerouslySetInnerHTML={{__html: this.markdownParser(this.props.markdowndata) }} />
			</div>
		);
	};

	markdownParser (text) {
		const toHTML = text
			.replace(/^#{6}\s(.*$)/gim, '<h6>$1</h6>') // h6 tag
			.replace(/^#{5}\s(.*$)/gim, '<h5>$1</h5>') // h5 tag
			.replace(/^#{4}\s(.*$)/gim, '<h4>$1</h4>') // h4 tag
			.replace(/^#{3}\s(.*$)/gim, '<h3>$1</h3>') // h3 tag
			.replace(/^#{2}\s(.*$)/gim, '<h2>$1</h2>') // h2 tag
			.replace(/^#{1}\s(.*$)/gim, '<h1>$1</h1>') // h1 tag
			.replace(/(\=|\-|\*){3}/gim, '<hr />') // horizontal rule
			.replace(/!\[(.*?)\]\((.*?)\)/gim, "<img alt='$1' src='$2' />") // images
			.replace(/\[([^\[]+)\]\((.*)\)/gim, '<a href="$2">$1</a>') // links
			.replace(/^\*{1}\s+(.*$)/gim, '<ul><li>$1</li></ul>') // unordered list
			.replace(/<\/ul>\s?<ul>/g, '') // duplicate unordered list
			.replace(/^\d+\.\s+(.*$)/gim, '<ol><li>$1</li></ol>') // ordered list
			.replace(/<\/ol>\s?<ol>/g, '') // duplicate ordered list
			.replace(/\:\"(.*?)\"\:/gim, '<q>$1</q>') // quote
			.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>') // blockquote
			.replace(/`(.*?)`/gim, '<code>$1</code>') // inline code
			.replace(/\*{2}(.*?)\*{2}/gim, '<b>$1</b>') // bold text
			.replace(/\*{1}(.*?)\*{1}/gim, '<i>$1</i>') // italic text
			.replace(/\~{2}(.*?)\~{2}/gim, '<b>$1</b>') // strikethrough
			.replace(/(^[A-z].+)/gim, '<p>$1</p>') // paragraphs
			//.replace(/\n$/gim, '<br />') // newline
			//.replace(//gim, '')
			;
		return toHTML.trim(); // using trim method to remove whitespace
	}

}
