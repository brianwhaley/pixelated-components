"use client"; 

import React, { useEffect } from "react";
import { loadAllImagesFromCloudinary } from "@pixelated-tech/components";
import { MicroInteractions } from "@pixelated-tech/components";
import { deferAllCSS } from "@pixelated-tech/components";
import { preloadImages } from "@pixelated-tech/components";

export default function LayoutClient() {

    useEffect(() => {
            MicroInteractions({ 
                buttonring: true,
                formglow: true,
                imgscale: true,
                simplemenubutton: true,
                scrollfadeElements: '.callout , .calloutSmall , .carousel-container',
            });
        }, []);
    
        useEffect(() => {
            document.addEventListener('DOMContentLoaded', deferAllCSS);
            preloadImages();
            deferAllCSS();
            loadAllImagesFromCloudinary({ 
                origin: window.location.origin,
                product_env: "dlbon7tpq"
            });
        }, []);

        return ( <></> );
}