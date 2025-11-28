"use client"; 

import React, { useState, useEffect } from "react";
import { loadAllImagesFromCloudinary } from "@brianwhaley/pixelated-components";
import { MicroInteractions } from "@brianwhaley/pixelated-components";
import { deferAllCSS } from "@brianwhaley/pixelated-components";
import { preloadImages } from "@brianwhaley/pixelated-components";

export default function LayoutClient() {

    useEffect(() => {
            MicroInteractions({ 
                buttonring: true,
                formglow: true,
                imgscale: true,
                simplemenubutton: true,
                scrollfadeElements: '.callout , .calloutSmall , .carouselContainer',
            });
        }, []);
    
        const [ url, setURL ] = useState<string>();
        useEffect(() => {
            document.addEventListener('DOMContentLoaded', deferAllCSS);
            preloadImages();
            deferAllCSS();
            if (typeof window !== "undefined" ) setURL(window.location.href);
            loadAllImagesFromCloudinary({ 
                origin: window.location.origin,
                product_env: "dlbon7tpq"
            });
        }, []);

        return ( <></> );
}