/**
 * CloudWatch Health Check Integration Services
 * Server-side utilities for Route53 health check data retrieval via CloudWatch
 */

"use server";

import { CloudWatchClient, GetMetricDataCommand } from '@aws-sdk/client-cloudwatch';
import { RouteCache } from './site-health-cache';
import { getFullPixelatedConfig } from '../../config/config';

export interface CloudwatchHealthCheckConfig {
  healthCheckId: string;
  region?: string;
}

export interface HealthCheckDataPoint {
	date: string;
	successCount: number;
	failureCount: number;
	totalChecks: number;
	successRate: number;
}

export interface CloudwatchHealthCheckResponse {
	success: boolean;
	data?: HealthCheckDataPoint[];
	error?: string;
}

// Cache for health check data (15 minutes)
const healthCheckCache = new RouteCache(15 * 60 * 1000);

/**
 * Get health check data for a site using CloudWatch metrics
 */
export async function getCloudwatchHealthCheckData(
	config: CloudwatchHealthCheckConfig,
	siteName: string,
	startDate?: string,
	endDate?: string
): Promise<CloudwatchHealthCheckResponse> {
	try {
		// Check cache first
		const cacheKey = `cloudwatch-${siteName}-${config.healthCheckId}-${startDate || 'default'}-${endDate || 'default'}`;
		const cached = healthCheckCache.get(cacheKey);
		if (cached) {
			return { success: true, data: cached };
		}

		// Use CloudWatch to get historical health check data
		// Prefer credentials from unified config (pixelated.config.json) when present (avoids env vars)
		const fullCfg = getFullPixelatedConfig();
		const awsCfg = fullCfg?.aws;
		const cloudWatchClient = new CloudWatchClient({
			region: config.region || awsCfg?.region || 'us-east-1',
			credentials: (awsCfg?.access_key_id && awsCfg?.secret_access_key) ? {
				accessKeyId: awsCfg.access_key_id,
				secretAccessKey: awsCfg.secret_access_key!,
				sessionToken: awsCfg.session_token
			} : undefined
		});

		// Set up date range
		const endTime = endDate ? new Date(endDate) : new Date();
		const startTime = startDate ? new Date(startDate) : new Date(endTime.getTime() - (30 * 24 * 60 * 60 * 1000)); // 30 days ago

		// Add 1 day to end time to include the full end date
		const endTimePlusOne = new Date(endTime);
		endTimePlusOne.setDate(endTimePlusOne.getDate() + 1);

		const metricDataQuery = {
			MetricDataQueries: [
				{
					Id: 'healthCheckStatus',
					MetricStat: {
						Metric: {
							Namespace: 'AWS/Route53',
							MetricName: 'HealthCheckStatus',
							Dimensions: [
								{
									Name: 'HealthCheckId',
									Value: config.healthCheckId
								}
							]
						},
						Period: 3600, // 1 hour intervals
						Stat: 'Average'
					},
					ReturnData: true
				}
			],
			StartTime: startTime,
			EndTime: endTimePlusOne
		};

		const command = new GetMetricDataCommand(metricDataQuery);
		const response = await cloudWatchClient.send(command);

		if (!response.MetricDataResults || response.MetricDataResults.length === 0) {
			return {
				success: false,
				error: 'No health check metric data found'
			};
		}

		const metricResult = response.MetricDataResults[0];
		if (!metricResult.Timestamps || !metricResult.Values) {
			return {
				success: false,
				error: 'No health check metric data available'
			};
		}

		// Group data by date
		const dateGroups: Record<string, { success: number; failure: number }> = {};

		metricResult.Timestamps.forEach((timestamp: Date, index: number) => {
			const date = timestamp.toISOString().split('T')[0]; // YYYY-MM-DD
			const value = metricResult.Values![index];

			if (!dateGroups[date]) {
				dateGroups[date] = { success: 0, failure: 0 };
			}

			// CloudWatch returns 1 for healthy, 0 for unhealthy
			if (value >= 0.5) { // Consider >= 0.5 as success
				dateGroups[date].success++;
			} else {
				dateGroups[date].failure++;
			}
		});

		// Convert to data points
		const data: HealthCheckDataPoint[] = Object.entries(dateGroups)
			.map(([date, counts]) => {
				const total = counts.success + counts.failure;
				const successRate = total > 0 ? (counts.success / total) * 100 : 0;
				return {
					date,
					successCount: counts.success,
					failureCount: counts.failure,
					totalChecks: total,
					successRate: Math.round(successRate * 100) / 100 // Round to 2 decimal places
				};
			})
			.sort((a, b) => a.date.localeCompare(b.date));

		// Fill in the date range with data points for each day
		let filledData: HealthCheckDataPoint[] = [];
		if (startDate && endDate) {
			const start = new Date(startDate);
			const end = new Date(endDate);
			const dataMap = new Map(data.map(d => [d.date, d]));

			for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
				const dateStr = date.toISOString().split('T')[0];
				const existingData = dataMap.get(dateStr);
				if (existingData) {
					filledData.push(existingData);
				} else {
					filledData.push({
						date: dateStr,
						successCount: 0,
						failureCount: 0,
						totalChecks: 0,
						successRate: 0
					});
				}
			}
		} else {
			filledData = data;
		}

		// Cache the result
		healthCheckCache.set(cacheKey, filledData);

		return { success: true, data: filledData };

	} catch (error) {
		console.error('CloudWatch error:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to fetch health check data from CloudWatch'
		};
	}
}