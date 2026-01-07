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

BuzzwordBingo.propTypes = {
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



BingoHeader.propTypes = {
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


BingoBox.propTypes = {
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

