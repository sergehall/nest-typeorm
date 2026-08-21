type RuntimeEnvironment = Readonly<{ NODE_ENV?: string }>;

export function isLocalRuntime(environment: RuntimeEnvironment = process.env): boolean {
  return environment.NODE_ENV === 'development' || environment.NODE_ENV === 'test';
}

/**
 * Security-sensitive features fail closed when NODE_ENV is absent or misspelled.
 */
export function isHardenedRuntime(environment: RuntimeEnvironment = process.env): boolean {
  return !isLocalRuntime(environment);
}
