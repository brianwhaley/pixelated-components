"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import PropTypes, { InferProps } from "prop-types";
import "../../css/pixelated.grid.scss";
import "./nerdjoke.css";

const debug = false;

const TIME_LIMIT = 15;

/**
 * NerdJoke — fetches and displays short Q/A 'nerd' jokes on a timer with controls to pause/advance.
 *
 * Props are primarily internal to the fetching implementation; the component exposes control buttons to pause or fetch the next joke.
 */
/** NerdJoke.propTypes — No props (fetches/show jokes internally).
 * @param {any} [props] - No props are accepted by NerdJoke.
 */
NerdJoke.propTypes = { /** no props */ };    
export type NerdJokeType = InferProps<typeof NerdJoke.propTypes>;
export function NerdJoke(props: NerdJokeType) {
	const [joke, setJoke] = useState({ question: "", answer: "" });
	const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const jokeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const timePassedRef = useRef(0);
	const timePausedRef = useRef(false);
	const timeLeftRef = useRef(TIME_LIMIT);

	const formatTimeLeft = useCallback((time: number) => {
		if (debug) console.log("Formatting Time Left");
		const minutes = Math.floor(time / 60);
		const seconds = time % 60;
		const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
		return `${minutes}:${formattedSeconds}`;
	}, []);

	const updateTimerDisplay = useCallback(() => {
		if (debug) console.log("Updating Timer Display");
		const label = document.getElementById("jokeTimerLabel");
		if (label) {
			label.innerHTML = formatTimeLeft(timeLeftRef.current);
		}
		const elapsedPath = document.getElementById("jokeTimerPathElapsed");
		if (elapsedPath) {
			const myWidth = (((1 / TIME_LIMIT) * timeLeftRef.current) * 100) + "%";
			elapsedPath.style.width = myWidth;
		}
	}, [formatTimeLeft]);

	const loadJoke = useCallback(async () => {
		if (debug) console.log("Loading Joke");
		timePassedRef.current = 0;
		timeLeftRef.current = TIME_LIMIT;
		timerIntervalRef.current = null;

		if (jokeIntervalRef.current) {
			clearInterval(jokeIntervalRef.current);
		}
		jokeIntervalRef.current = setInterval(() => {
			if (!timePausedRef.current) {
				loadJoke();
			}
		}, TIME_LIMIT * 1000);

		const myURL = "https://vvqyc1xpw6.execute-api.us-east-2.amazonaws.com/prod/nerdjokes?";
		const myURLProps = { command: "%2Fnerdjokes", text: "getjokejson" };
		try {
			const url = myURL + "command=" + myURLProps.command + "&text=" + myURLProps.text;
			const response = await fetch(url);
			if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
			const jokeData = await response.json();
			setJoke(jokeData);
		} catch (error) {
			console.error('Failed to fetch joke:', error);
			// Optionally set a fallback joke or handle error
		}
	}, []);

	const startTimer = useCallback(() => {
		if (debug) console.log("Starting Timer");
		if (timerIntervalRef.current) {
			clearInterval(timerIntervalRef.current);
		}
		timerIntervalRef.current = setInterval(() => {
			if (!timePausedRef.current) {
				timePassedRef.current += 1;
				timeLeftRef.current = TIME_LIMIT - timePassedRef.current + 1;
				updateTimerDisplay();
			}
		}, 1000);
	}, [updateTimerDisplay]);

	const pauseTimer = () => {
		if (debug) console.log("Pausing Timer");
		timePausedRef.current = !timePausedRef.current;
	};

	useEffect(() => {
		loadJoke();
		startTimer();
		return () => {
			if (timerIntervalRef.current) {
				clearInterval(timerIntervalRef.current);
			}
			if (jokeIntervalRef.current) {
				clearInterval(jokeIntervalRef.current);
			}
		};
	}, [loadJoke, startTimer]);

	return (
		<div className="nerd-joke">
			<div className="row-12col">
				<div className="grid-s1-e5">
					<div className="left">
						<JokeButton
							clickFunction={pauseTimer}
							buttonText="Pause ||  / Play >"
						/>
					</div>
				</div>
				<div className="grid-s9-e13">
					<div className="right">
						<JokeButton
							clickFunction={loadJoke}
							buttonText="Next Joke ->"
						/>
					</div>
				</div>
				<div className="joke-timer grid-s1-e13">
					<div className="row-12col">
						<div className="grid-s1-e11">
							<svg className="joke-timer-svg" xmlns="http://www.w3.org/2000/svg">
								<rect id="jokeTimerPathElapsed" />
							</svg>
						</div>
						<div className="grid-s11-e13 center" id="jokeTimerLabel">
							{formatTimeLeft(timeLeftRef.current)}
						</div>
					</div>
				</div>
				<div className="joke-text grid-s1-e13">
					<div>
						<span className="label">Q: </span>
						<span className="question"> {joke.question} </span>
					</div>
					<div>
						<span className="label">A: </span>
						<span className="answer"> {joke.answer} </span>
					</div>
				</div>
			</div>
		</div>
	);
}



JokeButton.propTypes = {
/** Click handler invoked when the button is pressed (e.g., pause or fetch next). */
	clickFunction: PropTypes.func.isRequired,
	/** Label text to render inside the button. */
	buttonText: PropTypes.string.isRequired,
};
export type JokeButtonType = InferProps<typeof JokeButton.propTypes>;
function JokeButton(props: JokeButtonType) {
	/* <div className="jokeButton" onClick={props.clickFunction}>
			{props.buttonText}
		</div> */
	return (
		<button className="joke-button" onClick={props.clickFunction}>
			{props.buttonText}
		</button>
	);
}
