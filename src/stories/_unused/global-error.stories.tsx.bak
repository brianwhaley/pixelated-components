import React from 'react';
import { within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { GlobalErrorUI } from '@/components/general/global-error';

export default { title: 'General/GlobalError', component: GlobalErrorUI };

export const Default = (args: any) => <GlobalErrorUI {...args} />;
Default.args = { error: new Error('Test error'), siteInfo: { email: 'hello@example.com' } };

export const NoContact = () => <GlobalErrorUI error={new Error('no contact')} />;

export const DetailsToggle = (args: any) => <GlobalErrorUI {...args} />;
DetailsToggle.args = { error: new Error('Details test') };
DetailsToggle.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
	const canvas = within(canvasElement);
	const btn = await canvas.getByRole('button', { name: /show details/i });
	const user = userEvent.setup();
	await user.click(btn);
	const details = await canvas.getByTestId('error-details');
	expect(details).toBeInTheDocument();
};
