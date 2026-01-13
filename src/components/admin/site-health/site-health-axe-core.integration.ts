"use server";

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const debug = false;

/**
 * Axe-Core Accessibility Analysis Integration Services
 * Server-side utilities for performing comprehensive accessibility analysis on websites
 * Note: This makes external HTTP requests and should only be used server-side
 */

interface AxeNode {
  target: string[];
  html: string;
  failureSummary?: string;
  ancestry?: string[];
}

interface AxeViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  nodes: AxeNode[];
  tags: string[];
}

interface AxeResult {
  violations: AxeViolation[];
  passes: AxeViolation[];
  incomplete: AxeViolation[];
  inapplicable: AxeViolation[];
  testEngine: {
    name: string;
    version: string;
  };
  testRunner: {
    name: string;
  };
  testEnvironment: {
    userAgent: string;
    windowWidth: number;
    windowHeight: number;
    orientationAngle?: number;
    orientationType?: string;
  };
  timestamp: string;
  url: string;
}

export interface AxeCoreData {
  site: string;
  url: string;
  result: AxeResult;
  summary: {
    violations: number;
    passes: number;
    incomplete: number;
    inapplicable: number;
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
  };
  timestamp: string;
  status: 'success' | 'error';
  warnings?: string[];
  error?: string;
  injectionSource?: string;
}

export async function performAxeCoreAnalysis(url: string, runtime_env: 'auto' | 'local' | 'prod' = 'auto'): Promise<AxeCoreData> {
	try {
		if (debug) console.info('Axe-core performAxeCoreAnalysis called with runtime_env:', runtime_env);
		// Run axe-core analysis
		const { result: axeResult, injectionSource } = await runAxeCoreAnalysis(url, runtime_env) as { result: AxeResult, injectionSource?: string };

		// Calculate summary
		const summary = {
			violations: axeResult.violations.length,
			passes: axeResult.passes.length,
			incomplete: axeResult.incomplete.length,
			inapplicable: axeResult.inapplicable.length,
			critical: axeResult.violations.filter(v => v.impact === 'critical').length,
			serious: axeResult.violations.filter(v => v.impact === 'serious').length,
			moderate: axeResult.violations.filter(v => v.impact === 'moderate').length,
			minor: axeResult.violations.filter(v => v.impact === 'minor').length,
		};

		return {
			site: '', // Will be set by the caller
			url: url,
			result: axeResult,
			summary,
			timestamp: new Date().toISOString(),
			status: 'success',
			injectionSource: injectionSource,
		};
	} catch (error) {
		console.error('Axe-core analysis failed:', error);

		return {
			site: '', // Will be set by the caller
			url: url,
			result: {
				violations: [],
				passes: [],
				incomplete: [],
				inapplicable: [],
				testEngine: { name: 'axe-core', version: 'unknown' },
				testRunner: { name: 'unknown' },
				testEnvironment: {
					userAgent: 'unknown',
					windowWidth: 0,
					windowHeight: 0,
				},
				timestamp: new Date().toISOString(),
				url: url,
			},
			summary: {
				violations: 0,
				passes: 0,
				incomplete: 0,
				inapplicable: 0,
				critical: 0,
				serious: 0,
				moderate: 0,
				minor: 0,
			},
			timestamp: new Date().toISOString(),
			status: 'error',
			error: error instanceof Error ? error.message : 'Unknown error occurred during axe-core analysis',
		};
	}
}

import { getFullPixelatedConfig } from '../../config/config';

/**
 * runAxeCoreAnalysis(url, runtime_env)
 *
 * Puppeteer runtime modes:
 * - 'local': intended for local development. Uses lighter launch args and prefers
 *   the `PUPPETEER_EXECUTABLE_PATH` environment variable so developers can use
 *   their local Chrome/Chromium installation.
 * - 'prod': intended for production (e.g., Amplify). Uses conservative sandboxing
 *   args and prefers the build-time configured executable path at
 *   `cfg.puppeteer.executable_path`.
 *
 * Recommended Amplify preBuild steps (examples):
 * - PUPPETEER_CACHE_DIR=./.puppeteer-cache npx puppeteer browsers install chrome
 * - mkdir -p ./puppeteer-binary && ln -s <installed_chrome_path> ./puppeteer-binary/chrome
 * - Patch decrypted `pixelated.config.json` with `puppeteer.executable_path: './puppeteer-binary/chrome'`
 *
 * The function selects executable path and args based on `runtime_env` and will
 * log additional diagnostics when `debug` is enabled.
 */
async function runAxeCoreAnalysis(url: string, runtime_env: 'auto' | 'local' | 'prod' = 'auto'): Promise<{ result: AxeResult; injectionSource?: string }> {
	let browser;
	try {
		// Build launch options for Puppeteer and prefer configured executable path when available
		const cfg = getFullPixelatedConfig();
		let execPath: string | undefined;
		if (runtime_env === 'local') {
			// In local mode, prefer environment overrides but do not force config-provided executable
			execPath = process.env.PUPPETEER_EXECUTABLE_PATH;
		} else if (runtime_env === 'prod') {
			// In production, prefer the build-time configured executable path, fall back to env
			execPath = cfg?.puppeteer?.executable_path || process.env.PUPPETEER_EXECUTABLE_PATH;
		} else {
			// auto: prefer config if present, otherwise env
			execPath = cfg?.puppeteer?.executable_path || process.env.PUPPETEER_EXECUTABLE_PATH;
		}
		// Build launch options for Puppeteer. Use conservative/sandboxed args in prod, but keep local runs lighter to avoid sandbox permission issues during local dev
		const prodArgs = [
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-dev-shm-usage',
			'--disable-accelerated-2d-canvas',
			'--no-first-run',
			'--no-zygote',
			'--single-process', // <- this one doesn't work in Windows
			'--disable-gpu'
		];
		const localArgs = [
			'--disable-accelerated-2d-canvas',
			'--disable-gpu'
		];
		const launchOpts: any = {
			headless: true,
			args: runtime_env === 'local' ? localArgs : prodArgs
		};
		if (execPath && fs.existsSync(execPath)) {
			launchOpts.executablePath = execPath;
			if (debug) console.info('Using Puppeteer executablePath from config/env:', execPath);
		} else {
			if (debug) console.info('No Puppeteer executablePath found for runtime_env:', runtime_env, 'resolved execPath:', execPath);
		}
		try {
			browser = await puppeteer.launch(launchOpts);
		} catch (err) {
			// Provide a clearer error message for missing Chrome/Chromium binaries
			const original = err instanceof Error ? err.message : String(err);
			const hint = `Could not launch Chrome/Chromium. Ensure Puppeteer browsers are installed (run 'npx puppeteer browsers install chrome') and that the browser binary is accessible. You can also set PUPPETEER_EXECUTABLE_PATH to the installed browser binary or adjust PUPPETEER_CACHE_DIR to point to a writable cache directory. Original error: ${original}`;
			if (debug) console.error('Puppeteer launch failed:', err);
			throw new Error(hint);
		}

		const page = await browser.newPage();

		// Set viewport for consistent results
		await page.setViewport({ width: 1280, height: 720 });

		// Capture console messages from the page for debugging
		if (debug) { 
			page.on('console', msg => {
				try {
					console.info('PAGE CONSOLE:', msg.text());
				} catch (e) {
					console.warn('PAGE CONSOLE (error reading):', e);
				}
			});
			// Capture failed requests (esp. script loads) and successful script responses
			page.on('requestfailed', req => {
				try {
					if (req.resourceType && req.resourceType() === 'script') {
						console.warn('PAGE REQUEST FAILED:', req.url(), req.failure()?.errorText);
					}
				} catch (e) {
					// ignore
				}
			});
			page.on('response', resp => {
				try {
					if (resp.request && resp.request().resourceType() === 'script') {
						console.info('PAGE SCRIPT RESPONSE:', resp.url(), resp.status());
					}
				} catch (e) {
					// ignore
				}
			});
		}
		

		
		// Set user agent to avoid bot detection
		await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

		// Navigate to the page with timeout
		await page.goto(url, {
			waitUntil: 'networkidle2',
			timeout: 30000
		});

		// Wait a bit for dynamic content to load
		await new Promise(resolve => setTimeout(resolve, 2000));

		// Try to inject axe-core via CDN first; if that fails (network restrictions), fall back to several local strategies
		let injectionSource = 'none';
		try {
			await page.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/axe-core/axe.min.js' });
			// Wait a bit for axe to load
			await new Promise(resolve => setTimeout(resolve, 1000));
			injectionSource = 'cdn';
		} catch (err) {
			let injected = false;

			// Try common local node_modules locations relative to process.cwd() and __dirname
			const possiblePaths = [
				path.join(process.cwd(), 'node_modules', 'axe-core', 'axe.min.js'),
				path.join(process.cwd(), '..', 'node_modules', 'axe-core', 'axe.min.js'),
				path.join(__dirname, '..', '..', 'node_modules', 'axe-core', 'axe.min.js')
			];
			for (const p of possiblePaths) {
				try {
					if (fs.existsSync(p)) {
						const fileSrc = fs.readFileSync(p, 'utf8');
						await page.addScriptTag({ content: fileSrc });
						injected = true;
						injectionSource = 'local-inline';
						break;
					}
				} catch (e) {
					// ignore local file read errors
				}
			}

			// Last resort: require.resolve
			if (!injected) {
				try {
					const axePath = require.resolve('axe-core/axe.min.js');
					const axeSrc = fs.readFileSync(axePath, 'utf8');
					await page.addScriptTag({ content: axeSrc });
					injected = true;
					injectionSource = 'require-resolve';
				} catch (e) {
					// ignore
				}
			}

			if (!injected) {
				throw new Error('Could not load axe-core via CDN or local inline injection');
			}
		}

		// Run axe-core analysis (poll across frames for availability after injection)
		// Wait up to 10s total for window.axe to appear (check every 200ms across frames)
		const timeoutMs = 10000;
		const intervalMs = 200;
		const start = Date.now();
		let axeResults: any = null;
		let frameWithAxe: any = null;

		while (!frameWithAxe && Date.now() - start < timeoutMs) {
			const frames = page.frames();
			for (const f of frames) {
				try {
					const hasAxe = await f.evaluate(() => typeof (window as any).axe !== 'undefined').catch(() => false);
					if (hasAxe) {
						frameWithAxe = f;
						break;
					}
				} catch (e) {
					// ignore frame evaluation errors
				}
			}
			if (!frameWithAxe) await new Promise(resolve => setTimeout(resolve, intervalMs));
		}

		if (!frameWithAxe) {
			// Collect some debug info to help identify why axe didn't attach
			try {
				const scripts = await page.evaluate(() => Array.from(document.querySelectorAll('script')).map(s => ((s as HTMLScriptElement).src || ((s as HTMLScriptElement).innerText || '').slice(0, 200))));
				const csp = await page.evaluate(() => document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.getAttribute('content') || null);
				const pageDiag = await page.evaluate(() => ({ hasAxe: typeof (window as any).axe !== 'undefined', axeKeys: Object.keys(window).filter(k => /axe/i.test(k)), windowHasAxeRun: typeof (window as any).axe?.run === 'function' }));
			} catch (e) {
				// ignore diagnostic errors
			}
			// Diagnostic: no axe found in any frame
			throw new Error('axe-core not loaded');
		}

		// Run axe in the frame that has it
		try {
			axeResults = await frameWithAxe.evaluate(async () => {
				return await (window as any).axe.run(document, {
					rules: {},
					runOnly: undefined,
					reporter: 'v2'
				});
			});
		} catch (e) {
			if (debug) console.error('Axe run failed:', e);
			throw e;
		}

		return { result: axeResults, injectionSource };

	} finally {
		if (browser) {
			await browser.close();
		}
	}
}