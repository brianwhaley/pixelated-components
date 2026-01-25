import React, { useState, useEffect } from 'react';
import { Tiles } from "@/components/general/tiles";
import { FlickrWrapper } from "@/components/integrations/flickr";
import { usePixelatedConfig } from '@/components/config/config.client';
import '@/css/pixelated.global.css';

// Single-flight Flickr loader shared by all stories (fetch once per Storybook session).
// Returns a promise that resolves to an array of tile-like card objects or [] on failure.
let _flickrPromise = null;
function fetchFlickrOnce(cfg) {
	if (_flickrPromise) return _flickrPromise;
	_flickrPromise = new Promise(async (resolve) => {
		if (!cfg || !cfg.flickr) return resolve([]);
		const props = {
			method: 'flickr.photosets.getPhotos',
			api_key: cfg.flickr.urlProps.api_key,
			user_id: cfg.flickr.urlProps.user_id,
			photoset_id: '72157712416706518',
			photoSize: 'Large',
			callback: (cards) => resolve(cards || []),
		};
		try {
			await FlickrWrapper(props);
		} catch (err) {
			// swallow network errors in Storybook — fall back to sample data
			resolve([]);
		}
	});
	return _flickrPromise;
};

export default {
	title: 'General',
	component: Tiles,
};

const sampleTiles = [
	{
		index: 0, cardIndex: 0, cardLength: 3,
		link: "https://www.linkedin.com",
		image: "https://res.cloudinary.com/dlbon7tpq/image/fetch/f_auto,q_auto,dpr_auto/https://www.pixelated.tech/images/logos/linkedin-logo.png",
		imageAlt: "Linkedin",
	},
    {
		index: 1, cardIndex: 1, cardLength: 3,
		link: "https://www.facebook.com",
		image: "https://res.cloudinary.com/dlbon7tpq/image/fetch/f_auto,q_auto,dpr_auto/https://www.pixelated.tech/images/logos/facebook-logo.png",
		imageAlt: "Facebook",
	},
	{
		index: 2, cardIndex: 2, cardLength: 3,
		link: "https://www.instagram.com",
		image: "https://res.cloudinary.com/dlbon7tpq/image/fetch/f_auto,q_auto,dpr_auto/https://www.pixelated.tech/images/logos/instagram-logo.jpg",
		imageAlt: "Instagram",
	}, 
];

const FlickrTiles = () => {
	const [ flickrCards, setFlickrCards ] = useState([]);
	const config = usePixelatedConfig();

	useEffect(() => {
		let mounted = true;
		fetchFlickrOnce(config).then(cards => { if (mounted) setFlickrCards(cards); }).catch(() => { if (mounted) setFlickrCards([]); });
		return () => { mounted = false; };
	}, [config]); 

	return (
		<>
			<section id="customflickrtiles-section">
				<div className='section-container'>
					<Tiles cards={sampleTiles} rowCount={3}/>
				</div>
			</section>

			<section id="flickrtiles-section">
				<div className='section-container'>
					<Tiles cards={flickrCards} rowCount={3}/>
				</div>
			</section>
		</>
	);
};

export const TilesStory = () => <FlickrTiles />;

// Playground: use the same Flickr data as the FlickrTiles story so reviewers can
// interact with live/gallery data via the playground panel.
export const TilesPlayground = () => {
  const [ flickrCards, setFlickrCards ] = useState([]);
  const config = usePixelatedConfig();

  useEffect(() => {
    let mounted = true;
    fetchFlickrOnce(config).then(cards => { if (mounted) setFlickrCards(cards); }).catch(() => { if (mounted) setFlickrCards([]); });
    return () => { mounted = false; };
  }, [config]);

  return (
    <div style={{ padding: 20 }}>
      <Tiles cards={flickrCards.length ? flickrCards : sampleTiles} rowCount={3} />
    </div>
  );
};

TilesPlayground.storyName = 'Tiles — playground';

export const Caption = () => {
  const [ cards, setCards ] = useState([]);
  const config = usePixelatedConfig();

  useEffect(() => {
    let mounted = true;
    fetchFlickrOnce(config).then(c => { if (mounted) setCards(c); }).catch(() => { if (mounted) setCards([]); });
    return () => { mounted = false; };
  }, [config]);

  const tilesForCaption = (cards && cards.length) ? cards : sampleTiles;

  return (
    <div style={{ padding: 20 }}>
      <Tiles cards={tilesForCaption} rowCount={3} variant="caption" />
    </div>
  );
};

Caption.storyName = 'Tiles — caption variant';

Caption.play = async ({ canvasElement }) => {
  const canvas = canvasElement;
  // poll for multiple tiles to appear (robust without Storybook testing libs)
  const waitForMany = async (selector, minCount = 2, timeout = 2500) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const els = Array.from(canvas.querySelectorAll(selector));
      if (els.length >= minCount) return els;
      // eslint-disable-next-line no-await-in-loop
      await new Promise(r => setTimeout(r, 50));
    }
    return [];
  };

  const tiles = await waitForMany('.tile.caption, .tile', 2, 2500);
  if (!tiles.length) throw new Error('Expected multiple tile elements for caption variant');

  // ensure at least the first few tiles have data-caption (accept fallback sample or Flickr titles)
  const sample = 'Visible body caption that should be clamped to three lines in the UI.';
  const checks = tiles.slice(0, 3).map(t => (t.getAttribute('data-caption') || '').trim());
  const hasValid = checks.some(c => c === sample || c.length > 0);
  if (!hasValid) throw new Error('No tile had a visible/derived caption (data-caption missing)');
};
