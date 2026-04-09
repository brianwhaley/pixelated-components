import { Route53Client, GetHealthCheckStatusCommand } from '@aws-sdk/client-route-53';
import { getFullPixelatedConfig } from '../../config/config';

const debug = false;

export interface UptimeCheckResult {
  status: 'success' | 'error';
  data?: {
    status: string;
    message?: string;
  };
  error?: string;
}

export async function checkUptimeHealth(healthCheckId: string): Promise<UptimeCheckResult> {
	try {
		// Simple Route 53 call (global service). Prefer credentials from pixelated.config.json when present
		const fullCfg = getFullPixelatedConfig();
		const awsCfg = fullCfg?.aws;
		if (debug) {
			if (awsCfg?.access_key_id && awsCfg?.secret_access_key) {
				console.log('Uptime check: using AWS credentials from pixelated.config.json (aws block).');
			} else {
				console.log('Uptime check: no explicit AWS credentials in pixelated.config.json; using default credential provider chain.');
			}
		}

		const client = new Route53Client({
			region: awsCfg?.region || 'us-east-1',
			credentials: (awsCfg?.access_key_id && awsCfg?.secret_access_key) ? {
				accessKeyId: awsCfg.access_key_id,
				secretAccessKey: awsCfg.secret_access_key!,
				sessionToken: awsCfg.session_token
			} : undefined
		});

		const response = await client.send(new GetHealthCheckStatusCommand({
			HealthCheckId: healthCheckId,
		}));

		const rawStatus = response.HealthCheckObservations?.[0]?.StatusReport?.Status;
		const status = rawStatus?.toLowerCase().includes('success') ? 'Healthy' :
			rawStatus?.toLowerCase().includes('failure') ? 'Unhealthy' : 'Unknown';

		return {
			status: 'success',
			data: {
				status
			}
		};

	} catch (error) {
		console.error('Uptime check failed:', error);
		return {
			status: 'success', // Return success with unknown status to match API behavior
			data: {
				status: 'Unknown',
				message: 'Check failed'
			}
		};
	}
}