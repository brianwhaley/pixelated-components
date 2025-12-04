"use client";

import React from "react";
import { PageSectionHeader } from "@brianwhaley/pixelated-components";
import { Callout } from "@brianwhaley/pixelated-components";
import { SmartImage } from "@brianwhaley/pixelated-components";

export default function Home() {

	return (
		<>
            <div className="row-2col">
                <div className="gridItem">
                    <Callout
                        aboveFold={true}
                        variant='boxed'
                        layout="vertical"
                        title="Mary Ann Sarao, Principal" 
                        img="/images/mas-sq.jpg"
                        imgShape="square"
                        content="Mary Ann Sarao is an expert in establishing and managing Corporate Competitive Intelligence Units in the areas of:
                            Pharmaceuticals and Therapeutic Areas, Health Care, Medical Devices, Consumer Health,
                            Manufacturing, Regulatory, Research & Development, Corporate Global Security Platforms,
                            Anti-Counterfeiting, Brand Protection, Investor Relations, and Communications."/>
                </div>
                <div className="gridItem">
                    <Callout
                        aboveFold={true}
                        variant='boxed'
                        layout="vertical"
                        title="Our Goal" 
                        img="/images/informationfocus-sq.png"
                        imgShape="square"
                        subtitle="Good CI can be done within legal and ethical guidelines.
                            Information Focus will help guide you every step of the way to building
                            a valuable and sustainable CI unit with the right people,
                            processes, and technologies."
                        content="Global Corporations need Competitive Intelligence (CI) to advance their business strategies.
                            Information Focus has over 30 years of experience in building large, mid-size,
                            and one-person CI units." />
                </div>
            </div>

            <div>
                <PageSectionHeader title="Capabilities" />
                <div className="row-4col">
                    <div className="gridItem if callout">
                        <p>Building a New CI Unit from the Ground Up</p>
                    </div>
                    <div className="gridItem if callout">
                        <p>Corporate CI Policies & Guidelines</p>
                    </div>
                    <div className="gridItem if callout">
                        <p>Corporate CI Training Programs and Counterintelligence Programs</p>
                    </div>
                    <div className="gridItem if callout">
                        <p>CI Department Resource Development & Budget</p>
                    </div>
                    <div className="gridItem if callout">
                        <p>Re-branding Established CI Units</p>
                    </div>
                    <div className="gridItem if callout">
                        <p>Auditing Established CI Units for Gaps</p>
                    </div>
                    <div className="gridItem if callout">
                        <p>Recommendations for New CI Platforms</p>
                    </div>
                    <div className="gridItem if callout">
                        <p>Team Training on Corporate War Gaming Events/Scenario Simulations</p>
                    </div>
                    <div className="gridItem if callout">
                        <p>CI Leadership Mentorship &amp; Metrics</p>
                    </div>
                    <div className="gridItem if callout">
                        <p>CI Consulting with Corporate Legal Departments</p>
                    </div>
                    <div className="gridItem if callout">
                        <p>Expert Network Consulting</p>
                    </div>
                    <div className="gridItem if callout">
                        <p>Experience with: Pfizer, Johnson &amp; Johnson, Merck,
                            Bristol-Myers Squibb, Bayer, DSM, and Abbvie</p>
                    </div>
                </div>
            </div>

                <br />
                <br />

            <div>
                <div className="logo-row">
                    <SmartImage src="/images/logo-pfizer.png" alt="Pfizer" />
                    <SmartImage src="/images/logo-jnj.svg.png" alt="Johnson & Johnson" />
                    <SmartImage src="/images/logo-merck.png" alt="Merck" />
                    <SmartImage src="/images/logo-bms.svg.png" alt="Bristol-Myers Squibb" />
                    <SmartImage src="/images/logo-bayer.svg.png" alt="Bayer" />
                    <SmartImage src="/images/logo-dsm.svg.png" alt="DSM" />
                    <SmartImage src="/images/logo-abbvie.png" alt="Abbvie" />
                </div>
            </div>

		</>
	);
}
