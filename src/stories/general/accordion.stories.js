import React from 'react';
import { Accordion } from '@/components/general/accordion';

export default {
  title: 'General',
  component: Accordion,
};

const mockItems = [
  {
    title: 'What is React?',
    content: 'React is a JavaScript library for building user interfaces.'
  },
  {
    title: 'How does it work?',
    content: 'React uses a component-based architecture and virtual DOM for efficient rendering.'
  },
  {
    title: 'Why use React?',
    content: 'React provides reusable components, efficient updates, and a large ecosystem.'
  }
];

export const AccordionPlayground  = {
  render: (args) => <Accordion {...args} items={mockItems} />
};
