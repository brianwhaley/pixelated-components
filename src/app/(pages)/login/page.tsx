import { PageSection } from '@pixelated-tech/components';
import Login from '../../components/Login';

export default function LoginPage() {
	return (
		<PageSection maxWidth="1024px" columns={1}>
			<Login />
		</PageSection>
	);
}