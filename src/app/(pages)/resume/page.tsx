"use client";

import React, { useState } from "react";

import { ResumeName, ResumeContact, ResumeQualifications, ResumeSkills, 
	ResumeSummary, ResumeEvents, ResumeProjects, ResumeReferences } from "@brianwhaley/pixelated-components";
import { Modal, handleModalOpen } from "@brianwhaley/pixelated-components";
import ResumeData from "@/app/data/resume.json";
// import ReferencesData from '@/app/data/references.json';

// ResumeData.items[0].properties.references = ReferencesData.items[0].properties.references;

/* 
import ReferencesData from "@/app/data/references.json";
<ResumeReferences title="References" data={ReferencesData.items[0].properties.references} collapsible={true} />
*/

export default function Resume() {

	const [modalContent, setModalContent] = useState<React.JSX.Element | undefined>();

	if (typeof window !== 'undefined') {
		const images = document.querySelectorAll('.u-photo-icon');
		images.forEach(image => {
			image.addEventListener('click', (e) => {
				handleImageClick(e, (e.target as HTMLElement).parentElement?.getAttribute('href') || '');
			});
		});
	}
	const handleImageClick = (event: Event, url: string) => {
		event.preventDefault();
		const myContent: React.JSX.Element = <img src={url} alt="Modal Image" />;
		setModalContent(myContent);
		handleModalOpen(event as MouseEvent);
	};

	/* 
	if (typeof window !== 'undefined') {
		const urls = document.querySelectorAll('.u-url-icon');
		urls.forEach(url => {
			url.addEventListener('click', (e) => {
				handleUrlClick(e, (e.target as HTMLElement).parentElement?.getAttribute('href') || '');
			});
		});
	}
	const handleUrlClick = (event: React.MouseEvent, url: string) => {
		event.preventDefault();
		const myContent = <iframe src={url} width="80%" height="80%" /> ;
		setModalContent(myContent);
		handleModalOpen(event);
	};
	*/


	return (
		<>
			<section className="p-resume" id="resume-section">
				<div className="section-container">
					<div className="row-12col">
						<div className="p-name grid-s1-e12">
							<ResumeName data={ResumeData.items[0].properties.name} />
						</div>
						<div className="grid-s1-e3 bigpad divider">
							<div className="p-contact">
								<ResumeContact title="Contact Information" data={ResumeData.items[0].properties.contact} />
							</div>
							<div className="p-education">
								<ResumeEvents title="Education" data={ResumeData.items[0].properties.education} dateFormat="MM/yyyy" collapsible={false} />
							</div>
							<div className="p-skills">
								<ResumeSkills title="Skills" data={ResumeData.items[0].properties.skills} />
							</div>
						</div>
						<div className="grid-s4-e9 bigpad">
							<div className="p-summary">
								<ResumeSummary title="Professional Summary" data={ResumeData.items[0].properties.summary} />
							</div>
							<div className="p-qualifications">
								<ResumeQualifications title="Professional Qualifications" data={ResumeData.items[0].properties.qualifications} />
							</div>
							<div className="p-experience">
								<ResumeEvents title="Work History" data={ResumeData.items[0].properties.experience} dateFormat="MM/yyyy" collapsible={false} />
							</div>
							<div className="p-projects">
								<ResumeProjects title="Projects" data={ResumeData.items[0].properties.experience} collapsible={true} />
							</div>
							<div className="p-volunteer">
								<ResumeEvents title="Volunteer Work" data={ResumeData.items[0].properties.volunteer} dateFormat="MM/yyyy" collapsible={true} />
							</div>
							<div className="p-certifications">
								<ResumeEvents title="Certifications" data={ResumeData.items[0].properties.certifications} dateFormat="MM/yyyy" collapsible={true} />
							</div>
							<div className="p-awards">
								<ResumeEvents title="Honors & Awards" data={ResumeData.items[0].properties.awards} dateFormat="MM/yyyy" collapsible={true} />
							</div>
							<div className="p-training">
								<ResumeEvents title="Training & Conferences" data={ResumeData.items[0].properties.training} dateFormat="MM/dd/yyyy" collapsible={true} />
							</div>
							<div className="p-references">
								<ResumeReferences title="References" data={ResumeData.items[0].properties.references} collapsible={true} />
							</div>
						</div>
					</div>
				</div>
			</section>

			<Modal modalContent={modalContent} />
		</>
  	);
}
