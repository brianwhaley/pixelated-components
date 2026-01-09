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

// Sample resume data
const sampleResumeData = {
  items: [{
    properties: {
      name: ['John Doe'],
      contact: [{
        properties: {
          email: ['john@example.com'],
          tel: ['555-1234'],
          url: ['https://johndoe.com'],
          adr: [{
            properties: {
              'street-address': '123 Main St',
              locality: 'Springfield',
              region: 'IL',
              'postal-code': '62701'
            }
          }]
        }
      }],
      summary: ['Professional developer', 'Full-stack engineer'],
      qualifications: {
        'Languages': ['JavaScript', 'Python', 'TypeScript'],
        'Frameworks': ['React', 'Node.js']
      },
      skills: [{
        'Frontend': 'React, Vue, Angular',
        'Backend': 'Node.js, Python, Java',
        'Database': 'MongoDB, PostgreSQL'
      }],
      education: [{
        properties: {
          start: ['2010-01-01'],
          end: ['2014-05-31'],
          location: [{
            properties: {
              'job-title': 'Bachelor of Science',
              org: ['State University'],
              locality: ['Springfield'],
              region: ['IL'],
              url: ['https://university.edu']
            }
          }]
        }
      }],
      experience: [{
        properties: {
          start: ['2018-06-01'],
          end: ['2023-12-31'],
          location: [{
            properties: {
              'job-title': 'Senior Developer',
              org: ['Tech Company'],
              locality: ['Chicago'],
              region: ['IL'],
              url: ['https://techcompany.com']
            }
          }],
          projects: [{
            properties: {
              name: ['Mobile App'],
              url: ['https://app.example.com'],
              photo: ['https://example.com/app.jpg'],
              note: ['Cross-platform mobile application']
            }
          }]
        }
      }],
      volunteer: [{
        properties: {
          start: ['2019-01-01'],
          end: ['2020-12-31'],
          location: [{
            properties: {
              'job-title': 'Code Mentor',
              org: ['Code for Good'],
              locality: ['Remote'],
              region: [''],
              url: ['']
            }
          }]
        }
      }],
      certifications: [{
        properties: {
          start: ['2021-03-15'],
          end: ['2024-03-15'],
          location: [{
            properties: {
              'job-title': 'AWS Solutions Architect',
              org: ['Amazon Web Services'],
              locality: [''],
              region: [''],
              url: ['https://aws.amazon.com']
            }
          }]
        }
      }],
      awards: [{
        properties: {
          start: ['2022-01-01'],
          end: ['2022-12-31'],
          location: [{
            properties: {
              'job-title': 'Developer of Year',
              org: ['Tech Magazine'],
              locality: [''],
              region: [''],
              url: ['']
            }
          }]
        }
      }],
      training: [{
        properties: {
          start: ['2023-01-15'],
          end: ['2023-01-17'],
          location: [{
            properties: {
              'job-title': 'Advanced React',
              org: ['Tech Academy'],
              locality: [''],
              region: [''],
              url: ['']
            }
          }]
        }
      }],
      references: [{
        properties: {
          name: ['Jane Smith'],
          url: ['https://janesmith.com'],
          locality: ['Chicago'],
          region: ['IL'],
          'job-title': ['CTO'],
          org: ['Innovation Corp'],
          email: ['jane@corp.com'],
          tel: ['555-5678']
        }
      }]
    }
  }]
};

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
      expect(h1).toHaveTextContent('John Doe');
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
      expect(emailLink).toHaveTextContent('john@example.com');
    });

    it('should render address information', () => {
      render(
        <ResumeContact 
          title="Contact Information" 
          data={sampleResumeData.items[0].properties.contact} 
        />
      );
      expect(screen.getByText(/123 Main St/)).toBeInTheDocument();
      expect(screen.getByText(/Springfield/)).toBeInTheDocument();
    });

    it('should render phone number', () => {
      render(
        <ResumeContact 
          title="Contact Information" 
          data={sampleResumeData.items[0].properties.contact} 
        />
      );
      expect(screen.getByText('555-1234')).toBeInTheDocument();
    });

    it('should render website URL link', () => {
      const { container } = render(
        <ResumeContact 
          title="Contact Information" 
          data={sampleResumeData.items[0].properties.contact} 
        />
      );
      const urlLink = container.querySelector('.p-url a');
      expect(urlLink).toHaveAttribute('href', 'https://johndoe.com');
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
      render(
        <ResumeEvents 
          title="Work History" 
          data={sampleResumeData.items[0].properties.experience}
          dateFormat="MM/yyyy"
          collapsible={false}
        />
      );
      expect(screen.getByText(/Senior Developer/)).toBeInTheDocument();
    });

    it('should render organization name', () => {
      render(
        <ResumeEvents 
          title="Work History" 
          data={sampleResumeData.items[0].properties.experience}
          dateFormat="MM/yyyy"
          collapsible={false}
        />
      );
      const orgSpan = document.querySelector('.p-org');
      expect(orgSpan?.textContent).toContain('Tech Company');
    });

    it('should render location', () => {
      render(
        <ResumeEvents 
          title="Work History" 
          data={sampleResumeData.items[0].properties.experience}
          dateFormat="MM/yyyy"
          collapsible={false}
        />
      );
      expect(screen.getByText(/Chicago/)).toBeInTheDocument();
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
      render(
        <ResumeQualifications 
          title="Professional Qualifications"
          data={sampleResumeData.items[0].properties.qualifications}
        />
      );
      expect(screen.getByText('Languages')).toBeInTheDocument();
      expect(screen.getByText('Frameworks')).toBeInTheDocument();
    });

    it('should render qualifications under categories', () => {
      render(
        <ResumeQualifications 
          title="Professional Qualifications"
          data={sampleResumeData.items[0].properties.qualifications}
        />
      );
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
      expect(screen.getByText('Python')).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();
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
      expect(screen.getByText('Frontend :')).toBeInTheDocument();
      expect(screen.getByText('Backend :')).toBeInTheDocument();
    });

    it('should render skills under categories', () => {
      render(
        <ResumeSkills 
          title="Skills"
          data={sampleResumeData.items[0].properties.skills}
        />
      );
      expect(screen.getByText(/React/)).toBeInTheDocument();
      expect(screen.getByText(/Node.js/)).toBeInTheDocument();
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
      expect(screen.getByText('Professional developer')).toBeInTheDocument();
      expect(screen.getByText('Full-stack engineer')).toBeInTheDocument();
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
      render(
        <ResumeReference 
          data={sampleResumeData.items[0].properties.references[0]}
        />
      );
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should render reference location', () => {
      render(
        <ResumeReference 
          data={sampleResumeData.items[0].properties.references[0]}
        />
      );
      expect(screen.getByText(/Chicago/)).toBeInTheDocument();
      expect(screen.getByText(/IL/)).toBeInTheDocument();
    });

    it('should render job title and organization', () => {
      const { container } = render(
        <ResumeReference 
          data={sampleResumeData.items[0].properties.references[0]}
        />
      );
      const jobTitle = container.querySelector('.p-job-title');
      const org = container.querySelector('.p-org');
      expect(jobTitle?.textContent).toContain('CTO');
      expect(org?.textContent).toContain('Innovation Corp');
    });

    it('should render email link', () => {
      const { container } = render(
        <ResumeReference 
          data={sampleResumeData.items[0].properties.references[0]}
        />
      );
      const emailLink = container.querySelector('a[href*="mailto"]');
      expect(emailLink).toBeInTheDocument();
      expect(emailLink).toHaveTextContent('jane@corp.com');
    });

    it('should render phone link', () => {
      const { container } = render(
        <ResumeReference 
          data={sampleResumeData.items[0].properties.references[0]}
        />
      );
      const phoneLink = container.querySelector('a[href*="tel"]');
      expect(phoneLink).toBeInTheDocument();
      expect(phoneLink).toHaveTextContent('555-5678');
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
      const headings = container.querySelectorAll('h3');
      let found = false;
      headings.forEach(h => {
        if (h.textContent?.includes('Tech Company')) {
          found = true;
        }
      });
      expect(found).toBe(true);
    });

    it('should render project name', () => {
      render(
        <ResumeProjects 
          title="Projects"
          data={sampleResumeData.items[0].properties.experience}
          collapsible={false}
        />
      );
      expect(screen.getByText('Mobile App')).toBeInTheDocument();
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
      render(
        <ResumeReferences 
          title="References"
          data={dataWithMultipleReferences.items[0].properties.references}
          collapsible={false}
        />
      );
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('John Manager')).toBeInTheDocument();
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
