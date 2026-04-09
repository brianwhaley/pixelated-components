import React from 'react';
import renderer from 'react-test-renderer';
import Carousel, { /* CarouselSlider, */ CarouselSliderImage, CarouselSliderArrow, CarouselSliderDetails, /* CarouselHero, */ CarouselHeroImage, CarouselHeroDetails } from '../components/carousel1/pixelated.carousel';

const image = {
	id: '42079144500',
	owner: '15473210@N04',
	secret: 'c28146304a',
	server: '852',
	farm: 1,
	title: 'Sunflower Picking at Alstede Farm 2018-07-30',
	ispublic: 1,
	isfriend: 0,
	isfamily: 0,
	description: 'Sunflower Picking at Alstede Farm 2018-07-30 via 5…ift.tt/2MoNJlH',
	datetaken: '2018-07-30 15:21:06',
	datetakengranularity: '0',
	datetakenunknown: '0',
	ownername: 'brianwhaley'
};

describe('Carousel', () => {
	test('Carousel snapshot renders', () => {
		const cCarousel = renderer.create(<Carousel />);
		const tree = cCarousel.toJSON();
		expect(tree).toMatchSnapshot();
	});

	/*
	test('Carousel Slider snapshot renders', () => {
		const cCarouselSlider = renderer.create(<CarouselSlider />);
		let tree = cCarouselSlider.toJSON();
		expect(tree).toMatchSnapshot();
	});
	*/

	test('Carousel Slider Image snapshot renders', () => {
		const direction = 'next';
		const activeIndex = 0;
		const index = 1;
		const imagesLength = 135;
		const size = '_b';
		const cCarouselImage = renderer.create(<CarouselSliderImage direction={direction} activeIndex={activeIndex} index={index} imagesLength={imagesLength} image={image} size={size}/>);
		const tree = cCarouselImage.toJSON();
		expect(tree).toMatchSnapshot();
	});

	test('Carousel Slider Arrow Next snapshot renders', () => {
		const direction = 'next';
		const glyph = '&#9654;';
		const cCarousel = renderer.create(<Carousel />);
		cCarousel.nextImage = jest.fn();
		const cCarouselArrow = renderer.create(<CarouselSliderArrow direction={direction} clickFunction={cCarousel.nextImage} glyph={glyph} />);
		const tree = cCarouselArrow.toJSON();
		expect(tree).toMatchSnapshot();
	});

	test('Carousel Slider Arrow Prev snapshot renders', () => {
		const direction = 'prev';
		const glyph = '&#9664;';
		const cCarousel = renderer.create(<Carousel />);
		cCarousel.nextImage = jest.fn();
		const cCarouselArrow = renderer.create(<CarouselSliderArrow direction={direction} clickFunction={cCarousel.nextImage} glyph={glyph} />);
		const tree = cCarouselArrow.toJSON();
		expect(tree).toMatchSnapshot();
	});

	test('Carousel Slider Details snapshot renders', () => {
		const index = 1;
		const length = 135;
		const cCarouselDetails = renderer.create(<CarouselSliderDetails index={index} length={length} image={image}/>);
		const tree = cCarouselDetails.toJSON();
		expect(tree).toMatchSnapshot();
	});

	test('Carousel Hero Image snapshot renders', () => {
		const direction = 'next';
		const activeIndex = 0;
		const index = 1;
		const imagesLength = 135;
		const size = '_b';
		const cCarouselImage = renderer.create(<CarouselHeroImage direction={direction} activeIndex={activeIndex} index={index} imagesLength={imagesLength} image={image} size={size}/>);
		const tree = cCarouselImage.toJSON();
		expect(tree).toMatchSnapshot();
	});

	test('Carousel Hero Details snapshot renders', () => {
		const index = 1;
		const length = 135;
		const cCarouselDetails = renderer.create(<CarouselHeroDetails index={index} length={length} image={image}/>);
		const tree = cCarouselDetails.toJSON();
		expect(tree).toMatchSnapshot();
	});
});
