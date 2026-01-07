/* eslint-disable */

import React from "react";
import PropTypes, { InferProps } from "prop-types";
import { format } from "date-fns";
import { usePixelatedConfig } from "../config/config.client";
import { SmartImage } from "./smartimage";
import "../../css/pixelated.grid.scss";
import "./resume.css";

/* 
Resume Microformat - https://microformats.org/wiki/h-resume
Details Summary Expand Collapse - https://www.w3schools.com/tags/tag_details.asp
*/

function isValidDate(dateString: string) {
	let date = new Date(dateString);
	return !isNaN(date.getTime());
}

/* function isStr(str) {
	const myStr = String(str).trim();
	return myStr != null && myStr !== "" && myStr.length > 0 && typeof myStr !== 'undefined';
} */

// type IObj = { [key: string]: any }

const defaultDateFormat = 'MM/yyyy';
/* type resumeProps = {
	title: string
	data: any
	dateFormat?: string
	collapsible?: boolean
}

type simpleResumeProps = {
	data: any
} */

Resume.propTypes = {
	data: PropTypes.any.isRequired,
};
export type ResumeType = InferProps<typeof Resume.propTypes>;
export function Resume (props: ResumeType) {
	return (
		<section className="p-resume" id="resume-section">
			<div className="section-container">
				<div className="row-12col">
					<div className="p-name grid-s1-e13">
						<ResumeName data={props.data?.items?.[0]?.properties?.name || ''} />
					</div>
					<div className="divider grid-s1-e4">
						<div className="p-contact">
							<ResumeContact title="Contact Information" data={props.data?.items?.[0]?.properties?.contact || []} />
						</div>
						<div className="p-education">
							<ResumeEvents title="Education" data={props.data?.items?.[0]?.properties?.education || []} dateFormat="MM/yyyy" collapsible={false} />
						</div>
						<div className="p-skills">
							<ResumeSkills title="Skills" data={props.data?.items?.[0]?.properties?.skills || []} />
						</div>
					</div>
					<div className="grid-s4-e13">
						<div className="p-summary">
							<ResumeSummary title="Professional Summary" data={props.data?.items?.[0]?.properties?.summary || ''} />
						</div>
						<div className="p-qualifications">
							<ResumeQualifications title="Professional Qualifications" data={props.data?.items?.[0]?.properties?.qualifications || []} />
						</div>
						<div className="p-experience">
							<ResumeEvents title="Work History" data={props.data?.items?.[0]?.properties?.experience || []} dateFormat="MM/yyyy" collapsible={false} />
						</div>
						<div className="p-projects">
							<ResumeProjects title="Projects" data={props.data?.items?.[0]?.properties?.experience || []} collapsible={true} />
						</div>

						<div className="p-volunteer">
							<ResumeEvents title="Volunteer Work" data={props.data?.items?.[0]?.properties?.volunteer || []} dateFormat="MM/yyyy" collapsible={true} />
						</div>

						<div className="p-certifications">
							<ResumeEvents title="Certifications" data={props.data?.items?.[0]?.properties?.certifications || []} dateFormat="MM/yyyy" collapsible={true} />
						</div>
						<div className="p-awards">
							<ResumeEvents title="Honors & Awards" data={props.data?.items?.[0]?.properties?.awards || []} dateFormat="MM/yyyy" collapsible={true} />
						</div>

						<div className="p-training">
							<ResumeEvents title="Training & Conferences" data={props.data?.items?.[0]?.properties?.training || []} dateFormat="MM/dd/yyyy" collapsible={true} />
						</div>

						<div className="p-references">
							<ResumeReferences title="References" data={props.data?.items?.[0]?.properties?.references || []} collapsible={true} />
						</div>

					</div>
				</div>
			</div>
		</section>
	);
}

ResumeName.propTypes = {
	data: PropTypes.any.isRequired,
};
export type ResumeNameType = InferProps<typeof ResumeName.propTypes>;
export function ResumeName(props: ResumeNameType) {
	const myName = props.data[0];
	return (
		<>
			<h1 className="p-name">{myName}</h1>
		</>
	);
}

ResumeContact.propTypes = {
	data: PropTypes.any.isRequired,
	title: PropTypes.string.isRequired,
};
export type ResumeContactType = InferProps<typeof ResumeContact.propTypes>;
export function ResumeContact(props: ResumeContactType) {
	const myContact = props.data[0];
	return (
		<>
			<h2>{ props.title }</h2>
			<ul>
				<li><span className="p-email"><a href={`mailto:${myContact?.properties.email[0]}`} target="_blank" rel="noopener noreferrer" >{myContact?.properties.email[0]}</a></span></li>
				<li><span className="p-street-address">{myContact?.properties.adr[0].properties["street-address"]}, </span>
					<span className="p-locality">{myContact?.properties.adr[0].properties.locality}, </span>
					<span className="p-region">{myContact?.properties.adr[0].properties.region} </span>
					<span className="p-postal-code">{myContact?.properties.adr[0].properties["postal-code"]}</span></li>
				<li><span className="p-tel">{myContact?.properties.tel[0]}</span></li>
				<li><span className="p-url"><a href={myContact?.properties.url[0]}target="_blank" rel="noopener">{myContact?.properties.url[0]}</a></span></li>
			</ul>
		</>
	);
}

ResumeEvents.propTypes = {
	data: PropTypes.any.isRequired,
	dateFormat: PropTypes.string.isRequired,
	collapsible: PropTypes.bool,
	title: PropTypes.string.isRequired,
};
export type ResumeEventsType = InferProps<typeof ResumeEvents.propTypes>;
export function ResumeEvents(props: ResumeEventsType) {
	const config = usePixelatedConfig();
	const myElems = [];
	const myEvents = props.data;
	// SORT EVENTS DESCENDING BY END DATE
	myEvents.sort((a: any, b: any) => {
		if (a.properties.end[0] < b.properties.end[0]) { return 1; }
		if (a.properties.end[0] > b.properties.end[0]) { return -1; }
		return 0;
	});
	for (const iKey in myEvents) {
		// PRE-LOAD SOME VALUES
		const myEvent = myEvents[iKey].properties;
		const myStartDate = isValidDate(myEvent.start[0]) ? format(new Date(myEvent.start[0]), props.dateFormat || defaultDateFormat) : myEvent.start[0] ;
		const myEndDate = isValidDate(myEvent.end[0]) ? format(new Date(myEvent.end[0]), props.dateFormat || defaultDateFormat) : myEvent.end[0] ;
		const myLocation = myEvent.location[0].properties;
		const myElemDt = <span>
			{ (myStartDate) ? <span className="dt-start">{myStartDate}</span> : null }
			{ (myStartDate && myEndDate) ? <span> - </span> : null }
			{ (myEndDate) ? <span className="dt-end">{myEndDate}</span> : null }
			<span> : </span>
		</span>;
		// CREATE THE NEW ELEMENT
		const myElem = <li key={iKey}>
			{ (props.dateFormat) ? myElemDt : null }
			{ (myLocation["job-title"]) ? (<span className="p-job-title">{myLocation["job-title"]}, </span> ) : null }
			<span className="p-org">{myLocation.org}</span>	
			{ (myLocation.locality[0]) ? <span className="p-locality">, {myLocation.locality[0]}</span> : null }
			{ (myLocation.region[0]) ? <span className="p-region">, {myLocation.region[0]} </span> : null }
			{ (myLocation.url[0]) 
				? <a href={myLocation.url[0]} target="_blank" rel="noreferrer">
						{ /* <img src="/images/icons/link.png" title={myLocation.url[0]} alt={myLocation.url[0]} className='u-url-icon' /> */ }
						<SmartImage src="/images/icons/link.png" title={myLocation.url[0]} alt={myLocation.url[0]} className='u-url-icon' 
							cloudinaryEnv={config?.cloudinary?.product_env}
							cloudinaryDomain={config?.cloudinary?.baseUrl}
							cloudinaryTransforms={config?.cloudinary?.transforms} />
				</a> : null }
		</li>;
		// ADD TO THE ARRAY
		myElems.push(myElem);
	}
	if(props.collapsible && props.collapsible == true) {
		return (
			<>
				<details>
					<summary><h2>{ props.title }</h2></summary>
					<ul>{ myElems }</ul>
				</details>
			</>
		);
	} else {
		return (
			<>
				<h2>{ props.title }</h2>
				<ul>{ myElems }</ul>
			</>
		);
	}
}

ResumeQualifications.propTypes = {
	data: PropTypes.any.isRequired,
	title: PropTypes.string.isRequired,
};
export type ResumeQualificationsType = InferProps<typeof ResumeQualifications.propTypes>;
export function ResumeQualifications(props: ResumeQualificationsType) {
	const myElems = [];
	const myQual = props.data;
	for (const iKey in myQual) {
		const qual = myQual[iKey];
		const myElem = <h3 key={iKey}>{iKey}</h3>;
		const quals = qual.map((qualItem: any, iKey: string) =>
			<li key={"i" + iKey} className="p-qualification">{qualItem}</li>
		);
		myElems.push(myElem);
		myElems.push(<ul key={"q-" + iKey}>{quals}</ul>);
	}
	return (
		<>
			<h2>{ props.title }</h2>
			{myElems}
		</>
	);
}

ResumeSkills.propTypes = {
	data: PropTypes.any.isRequired,
	title: PropTypes.string.isRequired,
};
export type ResumeSkillsType = InferProps<typeof ResumeSkills.propTypes>;
export function ResumeSkills (props: ResumeSkillsType) {
	const myElems = [];
	const mySkills = props.data[0];
	for (const skill in mySkills) {
		const myElem = <h3 key={"c-" + skill} className="p-skill-category">{skill} : </h3>;
		myElems.push(myElem);
		const myElem2 = <span key={"s-" + skill} className="p-skill">{mySkills[skill]}<br /></span>;
		myElems.push(myElem2);
	}
	return (
		<>
			<h2>{props.title}</h2>
			<div className="p-skills">
				{ myElems }
			</div>
		</>
	);
}

ResumeSummary.propTypes = {
	data: PropTypes.any.isRequired,
	title: PropTypes.string.isRequired,
};
export type ResumeSummaryType = InferProps<typeof ResumeSummary.propTypes>;
export function ResumeSummary (props: ResumeSummaryType) {
	const myElems = [];
	const mySummary = props.data;
	for (const iKey in mySummary) {
		const summary = mySummary[iKey];
		const myElem = <li key={iKey}>{summary}</li>;
		myElems.push(myElem);
	}
	return (
		<>
			<h2>{props.title}</h2>
			<ul className="p-summary">{myElems}</ul>
		</>
	);
}

ResumeReferences.propTypes = {
	data: PropTypes.any.isRequired,
	title: PropTypes.any.isRequired,
	collapsible: PropTypes.bool,
};
export type ResumeReferencesType = InferProps<typeof ResumeReferences.propTypes>;
export function ResumeReferences (props: ResumeReferencesType) {
	const myElems = [];
	const myReferences = props.data;
	for (const iKey in myReferences) {
		const myReference = myReferences[iKey];
		// const myElem = <li key={iKey}>{myReference[iKey]}</li>;
		const myElem = <ResumeReference data={myReference} key={iKey} />;
		myElems.push(myElem);
	}
	if(props.collapsible && props.collapsible == true) {
		return (
			<>
				<details>
					<summary><h2>{ props.title }</h2></summary>
					<div>{ myElems }</div>
				</details>
			</>
		);
	} else {
		return (
			<>
				<h2>{ props.title }</h2>
				<div>{ myElems }</div>
			</>
		);
	}
}

ResumeReference.propTypes = {
	data: PropTypes.any.isRequired,
};
export type ResumeReferenceType = InferProps<typeof ResumeReference.propTypes>;
export function ResumeReference (props: ResumeReferenceType) {
	const myReference = props.data.properties;
	return (
		<>
			<div>
				{(myReference?.url[0]) ? <a href={myReference?.url[0]} target="_blank" className="u-url" rel="noopener noreferrer"><span className="p-name">{myReference?.name[0]}</span></a> : <span className="p-name">{myReference?.name[0]}</span>}, 
				{' '} <span className="p-locality">{myReference?.locality[0]}</span>, 
				{' '} <span className="p-region">{myReference?.region[0]}</span>
			</div>
			<div> 
				<span className="p-job-title">{myReference["job-title"][0]}</span>, 
				{' '} <span className="p-org">{myReference?.org[0]}</span>
			</div>
			<div>
				email : <a href={`mailto:${myReference?.email[0]}`} target="_blank" rel="noopener noreferrer" className="u-email" >{myReference?.email[0]}</a>
				{' '} || phone : <a href={`tel:${myReference?.tel[0]}`} className="p-tel">{myReference?.tel[0]}</a>
			</div>
			<br /><hr /><br />
		</>
	);
}

ResumeProjects.propTypes = {
	data: PropTypes.any.isRequired,
	title: PropTypes.any.isRequired,
	collapsible: PropTypes.bool,
};
export type ResumeProjectsType = InferProps<typeof ResumeProjects.propTypes>;
export function ResumeProjects(props: ResumeProjectsType) {
	const config = usePixelatedConfig();
	const myElems = [];
	const myEvents = props.data;
	for (const iKey in myEvents) {
		const myEvent = myEvents[iKey];
		const myOrg = <h3 key={iKey}>{myEvent.properties.location[0].properties.org[0]}</h3>;
		const myProjects = myEvent.properties.projects;
		const projects = myProjects?.map((project: any, iKey: string) =>
			<li key={"i" + iKey} className="p-project">
				{ (project.properties.url[0]) 
					? <a href={project.properties.url[0]} target="_blank" className="u-url" rel="noreferrer">
						<span className="p-name">{project.properties.name[0]}</span>
					</a> 
					: <span className="p-name">{project.properties.name[0]}</span> }
				{' '} { (project.properties.photo[0]) 
					? <a href={project.properties.photo[0]} target="_blank" className="u-photo" rel="noreferrer">
						{ /* <img src='/images/icons/img.png' title={project.properties.name[0]} alt={project.properties.name[0]} className='u-photo-icon' /> */ }
						<SmartImage src='/images/icons/img.png' title={project.properties.name[0]} alt={project.properties.name[0]} className='u-photo-icon' 
							cloudinaryEnv={config?.cloudinary?.product_env}
							cloudinaryDomain={config?.cloudinary?.baseUrl}
							cloudinaryTransforms={config?.cloudinary?.transforms} />
					</a> 
					: null}
				{ (project.properties.note[0]) ? <div className="p=note">{project.properties.note[0]}</div> : null}
			</li>
		);
		if (myProjects) {
			myElems.push(myOrg);
			myElems.push(<ul key={"q-" + iKey}>{projects}</ul>);
		}
	}
	if(props.collapsible && props.collapsible == true) {
		return (
			<>
				<details>
					<summary><h2>{ props.title }</h2></summary>
					<ul>{ myElems }</ul>
				</details>
			</>
		);
	} else {
		return (
			<>
				<h2>{ props.title }</h2>
				{ myElems }
			</>
		);
	}
}

