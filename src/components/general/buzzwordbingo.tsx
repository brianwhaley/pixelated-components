import React, { useState, useEffect } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import "../../css/pixelated.grid.scss";
import './buzzwordbingo.css';
import { buzzwords as defaultBuzzwords } from './buzzwordbingo.words';

function getBingoWords(arr: Array<string>, x: number){
	var myBingoWords =[...arr].sort(() => Math.random() - 0.5); // Shuffle the array
	myBingoWords = myBingoWords.slice(0, x); // Return the first x elements
	myBingoWords.splice(12, 0, "FREE SPACE"); 
	return myBingoWords;
}

/**
 * BuzzwordBingo — renders a bingo-style card populated with provided buzzwords (defaults to an internal list).
 *
 * @param {array} [props.buzzwords] - Array of words (strings) used to populate the bingo card; uses default list when omitted.
 */
BuzzwordBingo.propTypes = {
/** List of buzzwords used to populate the bingo card. */
	buzzwords: PropTypes.array,
};
export type BuzzwordBingoType = InferProps<typeof BuzzwordBingo.propTypes>;
export function BuzzwordBingo(props: BuzzwordBingoType){
	const buzzwords = props.buzzwords || defaultBuzzwords;
	const myBingoHeaders = ["B", "I", "N", "G", "O"];
	const [bingoWords, setBingoWords] = useState <string[]> ([]);
	useEffect(() => { 
		setBingoWords(getBingoWords(buzzwords, 24));
	}, [buzzwords]);
	return (
		<div className="bingoCard rowfix-5col">
			{ myBingoHeaders.map((word) => (
				<BingoHeader word={word} key={word} />
			))}
			{ bingoWords.map((word) => (
				<BingoBox word={word} key={word} /> 
			))}
		</div>
	);
}



/**
 * BingoHeader — renders a single header cell for the bingo card (letters B I N G O).
 *
 * @param {string} [props.word] - Single character header label (e.g., 'B', 'I', 'N', 'G', 'O').
 */
BingoHeader.propTypes = {
/** Header label character. */
	word: PropTypes.string.isRequired,
};
export type BingoHeaderType = InferProps<typeof BingoHeader.propTypes>;
function BingoHeader({ word }: BingoHeaderType) {
	return (
		<div className="bingoHeader gridItem">
			<div className="bingoBoxText">
				{word}
			</div>
		</div>
	);
}


/**
 * BingoBox — renders an individual bingo cell (word or 'FREE SPACE').
 *
 * @param {string} [props.word] - Word displayed in this cell; 'FREE SPACE' is treated specially.
 */
BingoBox.propTypes = {
	/** Word displayed in the bingo cell. */
	word: PropTypes.string.isRequired,
};
export type BingoBoxType = InferProps<typeof BingoBox.propTypes>;
function BingoBox({ word }: BingoBoxType) {
	return (
		<div className="bingoBox gridItem">
			<div className={(word == "FREE SPACE") ? "bingoBoxFreeSpace" : "bingoBoxText" }>
				{word}
			</div>
		</div>
	);
}

