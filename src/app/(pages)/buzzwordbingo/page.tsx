"use client";

import React from "react";
import { PageHeader } from "@pixelated-tech/components";
import { PageSection } from "@pixelated-tech/components";
import { CalloutHeader } from "@pixelated-tech/components";
import { BuzzwordBingo } from "@pixelated-tech/components";
import { buzzwords } from "@/app/data/buzzwords";

export default function BuzzWordBingo () {
	return (
		<PageSection columns={1}id="customs-section">
			<PageHeader title="Buzzword Bingo" />
			<BuzzwordBingo buzzwords={buzzwords} />
			<br /><br />
			<CalloutHeader title="Instructions : " />
			<div>
			According to <a href="https://en.wikipedia.org/wiki/Buzzword_bingo" target="_blank">Wikipedia</a> : 
				<blockquote cite="https://en.wikipedia.org/wiki/Buzzword_bingo">
					<p>
						Buzzword bingo, also known as bullshit bingo, is a bingo-style game 
						where participants prepare bingo cards with buzzwords and tick them 
						off when they are uttered during an event, such as a meeting or speech. 
						The goal of the game is to tick off a predetermined number of words 
						in a row and then signal bingo to other players.
					</p>
				</blockquote>
			</div>
		</PageSection>
	);
}