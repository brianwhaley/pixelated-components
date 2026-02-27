import React from 'react';
import { render } from '@testing-library/react';
import { SchemaFAQ } from '@/components/general/schema-faq';

describe('SchemaFAQ normalization', () => {
  it('merges multiple acceptedAnswer objects into single text', () => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Q1',
          acceptedAnswer: {
            '@type': 'Answer',
            text: ['first', 'second'],
          },
        },
      ],
    };

    const { container } = render(<SchemaFAQ faqsData={data} />);
    const script = container.querySelector('script');
    expect(script).not.toBeNull();
    const json = JSON.parse(script!.textContent || '');
    expect(Array.isArray(json.mainEntity)).toBe(true);
    expect(json.mainEntity[0].acceptedAnswer.text).toBe('first second');
  });

  it('leaves single answers untouched', () => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Q2',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'only one',
          },
        },
      ],
    };
    const { container } = render(<SchemaFAQ faqsData={data} />);
    const script = container.querySelector('script');
    const json = JSON.parse(script!.textContent || '');
    expect(json.mainEntity[0].acceptedAnswer.text).toBe('only one');
  });
});
