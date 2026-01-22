declare module '@pixelated-tech/components';

// Allow imports of the injected runtime config during compile-time (CI/Amplify)
// The real JSON is injected at release/deploy time; this declaration stops
// TS2307 in environments where the JSON is not present.
declare module '@/config/pixelated.config.json' {
  const value: Record<string, any>;
  export default value;
}

declare module '@/config/*.json' {
  const value: Record<string, any>;
  export default value;
}
