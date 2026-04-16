import React from 'react';
import { FourOhFour } from "@/components/foundation/404";
import data404 from "@/data/404-data.json";
import '@/css/pixelated.global.css';

const images = data404.images;

export default {
    title: 'General/404',
    component: FourOhFour,
};

export const NotFound = {
    args: {
        images: images
    }
};
