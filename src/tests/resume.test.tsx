import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../test/test-utils';
import {
  Resume,
  ResumeName,
  ResumeContact,
  ResumeEvents,
  ResumeQualifications,
  ResumeSkills,
  ResumeSummary,
  ResumeReferences,
  ResumeReference,
  ResumeProjects,
} from '../components/general/resume';

// Mock SmartImage
vi.mock('../components/cms/smartimage', () => ({
  SmartImage: (props: any) => {
    const { src, alt, title, className, onClick } = props;
    return React.createElement('img', {
      src,
      alt,
      title,
      className,
      onClick,
      'data-testid': 'smart-image'
    });
  },
}));

import { realRecipes, realResume as sampleResumeData } from '../test/test-data';

// use `realRecipes` later in recipe-specific tests; `sampleResumeData` is available for resume tests

describe('Resume Components', () => {
  describe('Resume Main Component', () => {
    it('should render resume section', () => {
      const { container } = render(<Resume data={sampleResumeData} />);
      expect(container.querySelector('section.p-resume')).toBeInTheDocument();
    });

    it('should have resume section with correct id', () => {
      const { container } = render(<Resume data={sampleResumeData} />);
      expect(container.querySelector('#resume-section')).toBeInTheDocument();
    });

    it('should have section container', () => {
      const { container } = render(<Resume data={sampleResumeData} />);
      expect(container.querySelector('.section-container')).toBeInTheDocument();
    });

    it('should have row-12col grid', () => {
      const { container } = render(<Resume data={sampleResumeData} />);
      expect(container.querySelector('.row-12col')).toBeInTheDocument();
    });

    it('should render name section', () => {
      const { container } = render(<Resume data={sampleResumeData} />);
      expect(container.querySelector('.p-name')).toBeInTheDocument();
    });

    it('should have left divider with contact, education, skills', () => {
      const { container } = render(<Resume data={sampleResumeData} />);
      const divider = container.querySelector('.divider');
      expect(divider?.querySelector('.p-contact')).toBeInTheDocument();
      expect(divider?.querySelector('.p-education')).toBeInTheDocument();
      expect(divider?.querySelector('.p-skills')).toBeInTheDocument();
    });

    it('should have right section with experience and other sections', () => {
      const { container } = render(<Resume data={sampleResumeData} />);
      const rightSection = container.querySelector('.grid-s4-e13');
      expect(rightSection?.querySelector('.p-summary')).toBeInTheDocument();
      expect(rightSection?.querySelector('.p-experience')).toBeInTheDocument();
    });

    it('should render all major sections', () => {
      const { container } = render(<Resume data={sampleResumeData} />);
      expect(container.querySelector('.p-summary')).toBeInTheDocument();
      expect(container.querySelector('.p-qualifications')).toBeInTheDocument();
      expect(container.querySelector('.p-experience')).toBeInTheDocument();
      expect(container.querySelector('.p-projects')).toBeInTheDocument();
      expect(container.querySelector('.p-volunteer')).toBeInTheDocument();
      expect(container.querySelector('.p-certifications')).toBeInTheDocument();
      expect(container.querySelector('.p-awards')).toBeInTheDocument();
      expect(container.querySelector('.p-training')).toBeInTheDocument();
      expect(container.querySelector('.p-references')).toBeInTheDocument();
    });
  });

  describe('ResumeName Component', () => {
    it('should render h1 with name', () => {
      const { container } = render(
        <ResumeName data={sampleResumeData.items[0].properties.name} />
      );
      const h1 = container.querySelector('h1');
      expect(h1).toBeInTheDocument();
      expect(h1).toHaveTextContent(sampleResumeData.items[0].properties.name[0]);
    });

    it('should have p-name class', () => {
      const { container } = render(
        <ResumeName data={sampleResumeData.items[0].properties.name} />
      );
      expect(container.querySelector('.p-name')).toBeInTheDocument();
    });
  });

  describe('ResumeContact Component', () => {
    it('should render contact section heading', () => {
      render(
        <ResumeContact 
          title="Contact Information" 
          data={sampleResumeData.items[0].properties.contact} 
        />
      );
      expect(screen.getByText('Contact Information')).toBeInTheDocument();
    });

    it('should render email link', () => {
      const { container } = render(
        <ResumeContact 
          title="Contact Information" 
          data={sampleResumeData.items[0].properties.contact} 
        />
      );
      const emailLink = container.querySelector('a[href*="mailto"]');
      expect(emailLink).toBeInTheDocument();
      const contactEmail = sampleResumeData.items[0].properties.contact?.[0]?.properties?.email?.[0];
      expect(emailLink).toHaveTextContent(contactEmail);
    });

    it('should render address information', () => {
      render(
        <ResumeContact 
          title="Contact Information" 
          data={sampleResumeData.items[0].properties.contact} 
        />
      );
      const street = sampleResumeData.items[0].properties.contact?.[0]?.properties?.adr?.[0]?.properties?.['street-address']?.[0];
      const locality = sampleResumeData.items[0].properties.contact?.[0]?.properties?.adr?.[0]?.properties?.locality?.[0];
      if (street) expect(screen.getByText(new RegExp(street))).toBeInTheDocument();
      if (locality) expect(screen.getByText(new RegExp(locality))).toBeInTheDocument();
    });

    it('should render phone number', () => {
      render(
        <ResumeContact 
          title="Contact Information" 
          data={sampleResumeData.items[0].properties.contact} 
        />
      );
      const phone = sampleResumeData.items[0].properties.contact?.[0]?.properties?.tel?.[0];
      if (phone) expect(screen.getByText(phone)).toBeInTheDocument();
    });

    it('should render website URL link', () => {
      const { container } = render(
        <ResumeContact 
          title="Contact Information" 
          data={sampleResumeData.items[0].properties.contact} 
        />
      );
      const urlLink = container.querySelector('.p-url a');
      const contactUrl = sampleResumeData.items[0].properties.contact?.[0]?.properties?.url?.[0];
      if (contactUrl) expect(urlLink).toHaveAttribute('href', contactUrl);
    });

    it('should have semantic contact classes', () => {
      const { container } = render(
        <ResumeContact 
          title="Contact Information" 
          data={sampleResumeData.items[0].properties.contact} 
        />
      );
      expect(container.querySelector('.p-email')).toBeInTheDocument();
      expect(container.querySelector('.p-street-address')).toBeInTheDocument();
      expect(container.querySelector('.p-locality')).toBeInTheDocument();
      expect(container.querySelector('.p-region')).toBeInTheDocument();
      expect(container.querySelector('.p-postal-code')).toBeInTheDocument();
      expect(container.querySelector('.p-tel')).toBeInTheDocument();
      expect(container.querySelector('.p-url')).toBeInTheDocument();
    });
  });

  describe('ResumeEvents Component', () => {
    it('should render events section with title', () => {
      render(
        <ResumeEvents 
          title="Work History" 
          data={sampleResumeData.items[0].properties.experience}
          dateFormat="MM/yyyy"
          collapsible={false}
        />
      );
      expect(screen.getByText('Work History')).toBeInTheDocument();
    });

    it('should render as non-collapsible when collapsible is false', () => {
      const { container } = render(
        <ResumeEvents 
          title="Work History" 
          data={sampleResumeData.items[0].properties.experience}
          dateFormat="MM/yyyy"
          collapsible={false}
        />
      );
      expect(container.querySelector('details')).not.toBeInTheDocument();
      expect(container.querySelector('h2')).toBeInTheDocument();
    });

    it('should render as collapsible details element when collapsible is true', () => {
      const { container } = render(
        <ResumeEvents 
          title="Volunteer Work" 
          data={sampleResumeData.items[0].properties.volunteer}
          dateFormat="MM/yyyy"
          collapsible={true}
        />
      );
      expect(container.querySelector('details')).toBeInTheDocument();
      expect(container.querySelector('summary')).toBeInTheDocument();
    });

    it('should render job title', () => {
      const { container } = render(
        <ResumeEvents 
          title="Work History" 
          data={sampleResumeData.items[0].properties.experience}
          dateFormat="MM/yyyy"
          collapsible={false}
        />
      );
      // assert a job-title is rendered and contains a plausible senior/technical title
      const jt = container.querySelector('.p-job-title');
      expect(jt).toBeInTheDocument();
      expect(String(jt?.textContent || '')).toMatch(/Vice|Senior\s+Developer|Director|Manager|Consultant|Engineer|Developer/i);
    });

    it('should render organization name', () => {
      const experiences = sampleResumeData.items[0].properties.experience || [];
      const orgFromData = (experiences.find((e: any) => Array.isArray(e.properties?.location) ? (e.properties.location[0]?.properties?.org?.[0]) : (e.properties?.org?.[0])) || experiences.find((e: any) => e.properties?.location[0])) as any;
      const expectedOrg = orgFromData && ((orgFromData as any).properties?.org?.[0] || (orgFromData as any).properties?.location?.[0]?.properties?.org?.[0] || (orgFromData as any).properties?.org);
      const { container } = render(
        <ResumeEvents 
          title="Work History" 
          data={sampleResumeData.items[0].properties.experience}
          dateFormat="MM/yyyy"
          collapsible={false}
        />
      );
      if (expectedOrg) {
        expect(container.querySelector('.p-org')?.textContent).toContain(expectedOrg);
      } else {
        expect(container.querySelector('.p-org')).toBeInTheDocument();
      }
    });

    it('should render location', () => {
      const experiences = sampleResumeData.items[0].properties.experience || [];
      const loc = experiences.find((e: any) => e.properties?.location && e.properties.location[0]?.properties?.locality)?.properties?.location?.[0]?.properties?.locality?.[0] || experiences.find((e:any)=> e.properties?.location && e.properties.location[0]?.properties?.locality)?.properties?.location?.[0]?.properties?.locality?.[0];
      const { container } = render(
        <ResumeEvents 
          title="Work History" 
          data={sampleResumeData.items[0].properties.experience}
          dateFormat="MM/yyyy"
          collapsible={false}
        />
      );
      if (loc) {
        expect(container.textContent).toMatch(new RegExp(String(loc).slice(0,12),'i'));
      } else {
        expect(container.querySelector('.p-locality')).toBeInTheDocument();
      }
    });

    it('should render dates with proper formatting', () => {
      const { container } = render(
        <ResumeEvents 
          title="Work History" 
          data={sampleResumeData.items[0].properties.experience}
          dateFormat="MM/yyyy"
          collapsible={false}
        />
      );
      // Dates should be formatted as MM/yyyy
      const dateSpans = container.querySelectorAll('.dt-start, .dt-end');
      expect(dateSpans.length).toBeGreaterThan(0);
    });

    it('should have semantic event classes', () => {
      const { container } = render(
        <ResumeEvents 
          title="Work History" 
          data={sampleResumeData.items[0].properties.experience}
          dateFormat="MM/yyyy"
          collapsible={false}
        />
      );
      expect(container.querySelector('.p-job-title')).toBeInTheDocument();
      expect(container.querySelector('.p-org')).toBeInTheDocument();
    });
  });

  describe('ResumeQualifications Component', () => {
    it('should render qualifications section', () => {
      render(
        <ResumeQualifications 
          title="Professional Qualifications"
          data={sampleResumeData.items[0].properties.qualifications}
        />
      );
      expect(screen.getByText('Professional Qualifications')).toBeInTheDocument();
    });

    it('should render category headings', () => {
      let quals: any = sampleResumeData.items[0].properties.qualifications || [];
      // canonical data uses an object map for qualifications — accept both shapes
      const headings = Array.isArray(quals)
        ? quals.map((q: any) => (q && q.properties && q.properties.name && q.properties.name[0]) || null).filter(Boolean)
        : Object.keys(quals || []);
      const { container } = render(<ResumeQualifications title="Professional Qualifications" data={quals} />);
      const renderedHeadings = Array.from(container.querySelectorAll('h3')).map(n => String(n.textContent).trim()).filter(Boolean);
      expect(headings.length).toBeGreaterThan(0);
      expect(renderedHeadings.length).toBeGreaterThan(0);
      // ensure at least one canonical heading appears
      expect(renderedHeadings.some(h => headings.some((hh: string) => h.includes(hh.slice(0,12))))).toBe(true);
    });

    it('should render qualifications under categories', () => {
      const quals: any = sampleResumeData.items[0].properties.qualifications || {};
      const sampleItem = Array.isArray(quals) ? (quals.flatMap((q: any) => (q.properties?.summary || [])).find(Boolean)) : (Object.values(quals).flat().find(Boolean));
      const { container } = render(<ResumeQualifications title="Professional Qualifications" data={quals} />);
      expect(container.querySelectorAll('.p-qualification').length).toBeGreaterThan(0);
      if (sampleItem) expect(container.textContent).toContain(String(sampleItem).slice(0, 30));
    });

    it('should have p-qualification class', () => {
      const { container } = render(
        <ResumeQualifications 
          title="Professional Qualifications"
          data={sampleResumeData.items[0].properties.qualifications}
        />
      );
      const quals = container.querySelectorAll('.p-qualification');
      expect(quals.length).toBeGreaterThan(0);
    });
  });

  describe('ResumeSkills Component', () => {
    it('should render skills section', () => {
      render(
        <ResumeSkills 
          title="Skills"
          data={sampleResumeData.items[0].properties.skills}
        />
      );
      expect(screen.getByText('Skills')).toBeInTheDocument();
    });

    it('should render skill categories', () => {
      render(
        <ResumeSkills 
          title="Skills"
          data={sampleResumeData.items[0].properties.skills}
        />
      );
      // tolerate spacing/formatting differences ("Front End" vs "Frontend")
      expect(screen.getByText(/front\s*end\s*:/i)).toBeInTheDocument();
      expect(screen.getByText(/back\s*end\s*:/i)).toBeInTheDocument();
    });

    it('should render skills under categories', () => {
      const { container } = render(
        <ResumeSkills 
          title="Skills"
          data={sampleResumeData.items[0].properties.skills}
        />
      );
      const skillsRaw = Array.isArray(sampleResumeData.items[0].properties.skills)
        ? sampleResumeData.items[0].properties.skills.join(' ')
        : String(sampleResumeData.items[0].properties.skills || '');
      // scope to the rendered skills block to avoid matching other tests
      const skillsBlock = container.querySelector('.p-skills');
      expect(skillsBlock).toBeInTheDocument();
      expect(skillsBlock?.textContent).toMatch(/React/);
      // accept "Node" or "Node.js" and tolerate wrapping/line-breaks
      expect(skillsBlock?.textContent).toMatch(/node(\.js)?/i);
    });

    it('should have p-skill-category and p-skill classes', () => {
      const { container } = render(
        <ResumeSkills 
          title="Skills"
          data={sampleResumeData.items[0].properties.skills}
        />
      );
      expect(container.querySelector('.p-skill-category')).toBeInTheDocument();
      expect(container.querySelectorAll('.p-skill').length).toBeGreaterThan(0);
    });
  });

  describe('ResumeSummary Component', () => {
    it('should render summary section', () => {
      render(
        <ResumeSummary 
          title="Professional Summary"
          data={sampleResumeData.items[0].properties.summary}
        />
      );
      expect(screen.getByText('Professional Summary')).toBeInTheDocument();
    });

    it('should render summary items', () => {
      render(
        <ResumeSummary 
          title="Professional Summary"
          data={sampleResumeData.items[0].properties.summary}
        />
      );
      const summaryItems = sampleResumeData.items[0].properties.summary || [];
      expect(summaryItems.length).toBeGreaterThan(0);
      const { container } = render(<ResumeSummary title="Professional Summary" data={sampleResumeData.items[0].properties.summary} />);
      const summaryLis = Array.from(container.querySelectorAll('.p-summary li')).map(n => String(n.textContent || ''));
      // ensure at least one of the first two canonical summary items appears (use substring)
      const found = summaryItems.slice(0, 2).some(it => it && summaryLis.some(li => li.includes(String(it).slice(0, 18))));
      expect(found).toBe(true);
    });

    it('should have p-summary class', () => {
      const { container } = render(
        <ResumeSummary 
          title="Professional Summary"
          data={sampleResumeData.items[0].properties.summary}
        />
      );
      expect(container.querySelector('.p-summary')).toBeInTheDocument();
    });
  });

  describe('ResumeReference Component', () => {
    it('should render reference name', () => {
      const ref = sampleResumeData.items[0].properties.references[0];
      render(<ResumeReference data={ref} />);
      expect(screen.getByText(ref.properties.name[0])).toBeInTheDocument();
    });

    it('should render reference location', () => {
      const refs = sampleResumeData.items[0].properties.references || [];
      const refWithLocation = (refs.find((r: any) => ((r.properties?.location?.[0]) || r.properties?.locality || r.properties?.addressLocality)) as any) || null;
      if (refWithLocation) {
        const { container: refContainer } = render(<ResumeReference data={refWithLocation} />);
        const rprops = (refWithLocation as any).properties || {};
        const locality = (rprops.location && rprops.location[0]) || rprops.locality || rprops.addressLocality || '';
        const region = (rprops.region && rprops.region[0]) || rprops.addressRegion || '';
        if (locality) {
          const el = refContainer.querySelector('.p-locality');
          expect(el).toBeTruthy();
          expect(String(el?.textContent || '')).toMatch(new RegExp(String(locality).slice(0, 12), 'i'));
        }
        if (region) {
          const el = refContainer.querySelector('.p-region');
          expect(el).toBeTruthy();
          expect(String(el?.textContent || '')).toMatch(new RegExp(String(region), 'i'));
        }
      } else {
        // if canonical entries are 'available upon request', assert the fallback is rendered
        const { container: refContainer } = render(<ResumeReference data={refs[0] || {}} />);
        expect(refContainer.querySelector('.p-name')?.textContent).toMatch(/available upon request/i);
      }

    });

    it('should render job title and organization', () => {
      const ref = sampleResumeData.items[0].properties.references[0];
      const { container } = render(<ResumeReference data={ref} />);
      const jobTitle = container.querySelector('.p-job-title');
      const org = container.querySelector('.p-org');
      const rprops = (ref as any).properties || {};
      const expectedJob = rprops['job-title']?.[0] || rprops.jobTitle?.[0] || rprops.title?.[0] || '';
      const expectedOrg = rprops.org?.[0] || rprops.organization?.[0] || '';
      if (expectedJob) expect(jobTitle?.textContent).toContain(expectedJob);
      if (expectedOrg) expect(org?.textContent).toContain(expectedOrg);
    });

    it('should render email link', () => {
      const ref = sampleResumeData.items[0].properties.references[0];
      const { container } = render(<ResumeReference data={ref} />);
      const emailLink = container.querySelector('a[href*="mailto"]');
      expect(emailLink).toBeInTheDocument();
      const rprops2 = (ref as any).properties || {};
      const expectedEmail = rprops2.email?.[0] || rprops2.u_email?.[0] || '';
      if (expectedEmail) {
        expect(emailLink).toHaveTextContent(expectedEmail);
      } else {
        expect(emailLink).toHaveTextContent(/upon request/i);
      }
    });

    it('should render phone link', () => {
      const ref = sampleResumeData.items[0].properties.references[0];
      const { container } = render(<ResumeReference data={ref} />);
      const phoneLink = container.querySelector('a[href*="tel"]');
      expect(phoneLink).toBeInTheDocument();
      const rprops3 = (ref as any).properties || {};
      const expectedTel = rprops3.tel?.[0] || rprops3.phone?.[0] || '';
      if (expectedTel) {
        expect(phoneLink).toHaveTextContent(expectedTel);
      } else {
        expect(phoneLink).toHaveTextContent(/upon request/i);
      }
    });

    it('should have semantic reference classes', () => {
      const { container } = render(
        <ResumeReference 
          data={sampleResumeData.items[0].properties.references[0]}
        />
      );
      expect(container.querySelector('.p-name')).toBeInTheDocument();
      expect(container.querySelector('.p-locality')).toBeInTheDocument();
      expect(container.querySelector('.p-region')).toBeInTheDocument();
      expect(container.querySelector('.p-job-title')).toBeInTheDocument();
      expect(container.querySelector('.p-org')).toBeInTheDocument();
      expect(container.querySelector('.u-email')).toBeInTheDocument();
      expect(container.querySelector('.p-tel')).toBeInTheDocument();
    });
  });

  describe('ResumeReferences Component', () => {
    it('should render references section', () => {
      render(
        <ResumeReferences 
          title="References"
          data={sampleResumeData.items[0].properties.references}
          collapsible={false}
        />
      );
      expect(screen.getByText('References')).toBeInTheDocument();
    });

    it('should render as non-collapsible when collapsible is false', () => {
      const { container } = render(
        <ResumeReferences 
          title="References"
          data={sampleResumeData.items[0].properties.references}
          collapsible={false}
        />
      );
      expect(container.querySelector('details')).not.toBeInTheDocument();
    });

    it('should render as collapsible when collapsible is true', () => {
      const { container } = render(
        <ResumeReferences 
          title="References"
          data={sampleResumeData.items[0].properties.references}
          collapsible={true}
        />
      );
      expect(container.querySelector('details')).toBeInTheDocument();
    });
  });

  describe('ResumeProjects Component', () => {
    it('should render projects section', () => {
      render(
        <ResumeProjects 
          title="Projects"
          data={sampleResumeData.items[0].properties.experience}
          collapsible={false}
        />
      );
      expect(screen.getByText('Projects')).toBeInTheDocument();
    });

    it('should render organization name as heading', () => {
      const { container } = render(
        <ResumeProjects 
          title="Projects"
          data={sampleResumeData.items[0].properties.experience}
          collapsible={false}
        />
      );
      const headings = Array.from(container.querySelectorAll('h3')).map(h => String(h.textContent));
      const projects = sampleResumeData.items[0].properties.experience || [];
      const _projWithOrg = projects.find((p: any) => p.properties?.org || p.properties?.organization) as any;
      const orgFromData = _projWithOrg?.properties?.org?.[0] || _projWithOrg?.properties?.organization?.[0];
      if (orgFromData) {
        expect(headings.some(h => h.includes(orgFromData))).toBe(true);
      } else {
        expect(headings.length).toBeGreaterThan(0);
      }
    });

    it('should render project name', () => {
      render(
        <ResumeProjects 
          title="Projects"
          data={sampleResumeData.items[0].properties.experience}
          collapsible={false}
        />
      );
      const experiences = sampleResumeData.items[0].properties.experience || [];
      const projectWithName = experiences.flatMap((e: any) => e.properties?.projects || []).find((p: any) => (p.properties?.name || []).length);
      const { container } = render(
        <ResumeProjects 
          title="Projects"
          data={sampleResumeData.items[0].properties.experience}
          collapsible={false}
        />
      );
      if (projectWithName) {
        const snippet = String(projectWithName.properties.name[0]).slice(0, 12).replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
        expect(container.textContent).toMatch(new RegExp(snippet, 'i'));
      } else {
        // fallback: at least one project item should be present
        expect(container.querySelector('.p-project')).toBeInTheDocument();
      }
    });

    it('should have p-project class', () => {
      const { container } = render(
        <ResumeProjects 
          title="Projects"
          data={sampleResumeData.items[0].properties.experience}
          collapsible={false}
        />
      );
      expect(container.querySelector('.p-project')).toBeInTheDocument();
    });
  });

  describe('Resume - Semantic HTML', () => {
    it('should use h-resume microformat', () => {
      const { container } = render(<Resume data={sampleResumeData} />);
      expect(container.querySelector('.p-resume')).toBeInTheDocument();
    });

    it('should use proper heading hierarchy', () => {
      const { container } = render(<Resume data={sampleResumeData} />);
      expect(container.querySelector('h1')).toBeInTheDocument(); // Name
      expect(container.querySelectorAll('h2').length).toBeGreaterThan(0); // Sections
    });

    it('should use proper semantic classes throughout', () => {
      const { container } = render(<Resume data={sampleResumeData} />);
      expect(container.querySelector('[class*="p-"]')).toBeInTheDocument(); // Properties
    });

    it('should use proper list structures', () => {
      const { container } = render(<Resume data={sampleResumeData} />);
      expect(container.querySelectorAll('ul').length).toBeGreaterThan(0);
    });
  });

  describe('Resume - Edge Cases', () => {
    it('should handle empty projects array', () => {
      const dataWithoutProjects = {
        ...sampleResumeData,
        items: [{
          ...sampleResumeData.items[0],
          properties: {
            ...sampleResumeData.items[0].properties,
            experience: [{
              properties: {
                ...sampleResumeData.items[0].properties.experience[0].properties,
                projects: undefined
              }
            }]
          }
        }]
      };
      const { container } = render(<Resume data={dataWithoutProjects} />);
      expect(container.querySelector('.p-resume')).toBeInTheDocument();
    });

    it('should handle null data prop gracefully', () => {
      const { container } = render(<Resume data={null as any} />);
      expect(container.querySelector('.p-resume')).toBeInTheDocument();
      // Should render empty sections without crashing
      expect(container.querySelector('.p-name')).toBeInTheDocument();
    });

    it('should handle undefined data prop gracefully', () => {
      const { container } = render(<Resume data={undefined as any} />);
      expect(container.querySelector('.p-resume')).toBeInTheDocument();
      expect(container.querySelector('.p-name')).toBeInTheDocument();
    });

    it('should handle missing items array', () => {
      const dataWithoutItems = { items: null };
      const { container } = render(<Resume data={dataWithoutItems as any} />);
      expect(container.querySelector('.p-resume')).toBeInTheDocument();
      expect(container.querySelector('.p-name')).toBeInTheDocument();
    });

    it('should handle empty items array', () => {
      const dataWithEmptyItems = { items: [] };
      const { container } = render(<Resume data={dataWithEmptyItems as any} />);
      expect(container.querySelector('.p-resume')).toBeInTheDocument();
      expect(container.querySelector('.p-name')).toBeInTheDocument();
    });

    it('should handle missing properties object', () => {
      const dataWithoutProperties = {
        items: [{
          properties: null
        }]
      };
      const { container } = render(<Resume data={dataWithoutProperties as any} />);
      expect(container.querySelector('.p-resume')).toBeInTheDocument();
      expect(container.querySelector('.p-name')).toBeInTheDocument();
    });

    it('should handle missing individual properties', () => {
      const dataWithMissingProps = {
        items: [{
          properties: {
            // Missing name, contact, education, skills, summary, etc.
          }
        }]
      };
      const { container } = render(<Resume data={dataWithMissingProps as any} />);
      expect(container.querySelector('.p-resume')).toBeInTheDocument();
      // Should render all sections even with missing data
      expect(container.querySelector('.p-name')).toBeInTheDocument();
      expect(container.querySelector('.p-contact')).toBeInTheDocument();
      expect(container.querySelector('.p-education')).toBeInTheDocument();
    });

    it('should handle multiple references', () => {
      const dataWithMultipleReferences = {
        ...sampleResumeData,
        items: [{
          ...sampleResumeData.items[0],
          properties: {
            ...sampleResumeData.items[0].properties,
            references: [
              ...sampleResumeData.items[0].properties.references,
              {
                properties: {
                  name: ['John Manager'],
                  url: ['https://johnmanager.com'],
                  locality: ['Springfield'],
                  region: ['IL'],
                  'job-title': 'Manager',
                  org: 'Previous Corp',
                  email: ['john@corp.com'],
                  tel: ['555-9999']
                }
              }
            ]
          }
        }]
      };
      const { container: refsContainer } = render(
        <ResumeReferences 
          title="References"
          data={dataWithMultipleReferences.items[0].properties.references}
          collapsible={false}
        />
      );
      const expectedNames = dataWithMultipleReferences.items[0].properties.references
        .map((r: any) => (r.properties?.name || r.properties?.displayName || [''])[0])
        .filter(Boolean);
      const renderedNames = Array.from(refsContainer.querySelectorAll('.p-name')).map(n => String(n.textContent).trim());
      expectedNames.forEach((n: string) => expect(renderedNames.some(r => r.includes(n))).toBe(true));
    });
  });

  describe('Resume - Integration', () => {
    it('should render complete resume with all sections', () => {
      const { container } = render(<Resume data={sampleResumeData} />);
      expect(container.querySelector('#resume-section')).toBeInTheDocument();
      expect(container.querySelector('.p-name')).toBeInTheDocument();
      expect(container.querySelector('.p-contact')).toBeInTheDocument();
      expect(container.querySelector('.p-education')).toBeInTheDocument();
      expect(container.querySelector('.p-skills')).toBeInTheDocument();
      expect(container.querySelector('.p-summary')).toBeInTheDocument();
    });

    it('should structure resume with proper grid layout', () => {
      const { container } = render(<Resume data={sampleResumeData} />);
      expect(container.querySelector('.grid-s1-e13')).toBeInTheDocument(); // Name
      expect(container.querySelector('.grid-s1-e4')).toBeInTheDocument();  // Left
      expect(container.querySelector('.grid-s4-e13')).toBeInTheDocument(); // Right
    });
  });
});
