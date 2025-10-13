"use client";

import React from "react";
import { Callout, CalloutHeader } from "@brianwhaley/pixelated-components";

export default function Home() {

	return (
		<>
            {/*
            <div>
                Global Corporations need Competitive Intelligence (CI) to advance their business strategies.
                Information Focus has over 30 years of experience in building large, mid-size,
                and one-person CI units.
                <br />
                <br />
                <img src="/images/mas.jpg" className="mas" alt="Mary Ann Sarao" />
                Mary Ann Sarao is an expert in establishing and managing Corporate CI Units in the areas of:
                Pharmaceuticals and Therapeutic Areas, Health Care, Medical Devices, Consumer Health,
                Manufacturing, Regulatory, R&amp;D, Corporate Global Security Platforms,
                Anti-Counterfeiting, Brand Protection, Investor Relations, and Communications.
                <br />
                <br />
                <div className="quote">
                    “Good CI can be done within legal and ethical guidelines.
                    Information Focus will help guide you every step of the way to building
                    a valuable and sustainable CI unit with the right people,
                    processes, and technologies.”
                    {' '}
                    <br />
                    <b>Mary Ann Sarao, Principal Information Focus</b>
                </div>
                <br />
                <br />
                Capabilities
                <ul>
                    <li>Building a New CI Unit from the Ground Up</li>
                    <li>Corporate CI Policies & Guidelines</li>
                    <li>
                    Developing Corporate CI Training Programs and
                    Counterintelligence Programs for Employees
                    </li>
                    <li>CI Department Resource Development & Budget </li>
                    <li>Re-branding Established CI Units</li>
                    <li>Auditing Established CI Units for Gaps</li>
                    <li>Recommendations for New CI Platforms Across Your Organization/AI &amp; NLP</li>
                    <li>Team Training on Corporate War Gaming Events/Scenario Simulations</li>
                    <li>CI Leadership Mentorship &amp; Metrics</li>
                    <li>CI Consulting with Corporate Legal Departments</li>
                    <li>Expert Network Consulting</li>
                    <li>
                    Experience with: Pfizer, Johnson &amp; Johnson, Merck,
                    Bristol-Myers Squibb, Bayer, and DSM
                    </li>
                </ul>
                <br />
                <br />
            </div>
            */}

            <div className="row-2col">
                <div className="griditem">
                    <Callout
                        layout="vertical"
                        isboxed={true}
                        title="Mary Ann Sarao, Principal" 
                        img="/images/mas-sq.jpg"
                        shape="square"
                        content="Mary Ann Sarao is an expert in establishing and managing Corporate CI Units in the areas of:
                            Pharmaceuticals and Therapeutic Areas, Health Care, Medical Devices, Consumer Health,
                            Manufacturing, Regulatory, R&amp;D, Corporate Global Security Platforms,
                            Anti-Counterfeiting, Brand Protection, Investor Relations, and Communications."/>
                </div>
                <div className="griditem">
                    <Callout
                        layout="vertical"
                        isboxed={true}
                        title="Our Goal" 
                        img="/images/informationfocus-sq.png"
                        shape="square"
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
                <CalloutHeader title="Capabilities" />
                <div className="row-4col">
                    <div className="griditem if callout">
                        <p>Building a New CI Unit from the Ground Up</p>
                    </div>
                    <div className="griditem if callout">
                        <p>Corporate CI Policies & Guidelines</p>
                    </div>
                    <div className="griditem if callout">
                        <p>Corporate CI Training Programs and Counterintelligence Programs</p>
                    </div>
                    <div className="griditem if callout">
                        <p>CI Department Resource Development & Budget</p>
                    </div>
                    <div className="griditem if callout">
                        <p>Re-branding Established CI Units</p>
                    </div>
                    <div className="griditem if callout">
                        <p>Auditing Established CI Units for Gaps</p>
                    </div>
                    <div className="griditem if callout">
                        <p>Recommendations for New CI Platforms</p>
                    </div>
                    <div className="griditem if callout">
                        <p>Team Training on Corporate War Gaming Events/Scenario Simulations</p>
                    </div>
                    <div className="griditem if callout">
                        <p>CI Leadership Mentorship &amp; Metrics</p>
                    </div>
                    <div className="griditem if callout">
                        <p>CI Consulting with Corporate Legal Departments</p>
                    </div>
                    <div className="griditem if callout">
                        <p>Expert Network Consulting</p>
                    </div>
                    <div className="griditem if callout">
                        <p>Experience with: Pfizer, Johnson &amp; Johnson, Merck,
                            Bristol-Myers Squibb, Bayer, DSM, and Abbvie</p>
                    </div>
                </div>
            </div>

                <br />
                <br />

            <div>
                <div className="logo-row">
                    <img src="/images/logo-pfizer.png" alt="Pfizer" />
                    <img src="/images/logo-j&j.svg.png" alt="Johnson & Johnson" />
                    <img src="/images/logo-merck.png" alt="Merck" />
                    <img src="/images/logo-bms.svg.png" alt="Bristol-Myers Squibb" />
                    <img src="/images/logo-bayer.svg.png" alt="Bayer" />
                    <img src="/images/logo-dsm.svg.png" alt="DSM" />
                    <img src="/images/logo-abbvie.png" alt="Abbvie" />
                </div>
            </div>

		</>
	);
}
