import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { LanguageServerClient } from '@language-server/client';
import { deepMerge } from './utils/deep-merge';
import { useMemo } from 'react';
import type { InitializeParams } from 'node_modules/@language-server/client/dist/types/protocol/requests';
import type { Config } from './config';

const nextId = (
  (counter) => () =>
    ++counter
)(0);

export const useTestStore = create(
  immer<{
    root: TestSuiteConfig;
    setStatus: (path: number[], status: TestStatus, details?: any) => void;
    setOverrides: (path: number[], overrides: NonNullable<TestConfig['overrides']>) => void;
  }>((set) => ({
    root: {
      id: 0,
      name: 'Root',
      tests: {},
      status: 'pending',
      details: null,
      overrides: {},
    },
    setStatus: (path: number[], status: TestStatus, details?: any) => {
      set((draft) => {
        const test = getTest(path, draft.root);
        if (!test) {
          return;
        }

        test.status = status;
        test.details = details;
      });
    },
    setOverrides: (path: number[], overrides: NonNullable<TestConfig['overrides']>) => {
      set((draft) => {
        const test = getTest(path, draft.root);
        if (!test) {
          return;
        }

        test.overrides = overrides;
      });
    },
  })),
);

let currentSuite = useTestStore.getState().root as TestSuiteConfig;
export function useTest(path: number[]) {
  const suite = useTestStore((s) => {
    const suite = getTest(path, s.root);
    if (!suite) {
      throw new Error(`Could not find test with path ${path.join('.')}`);
    }

    return suite;
  });

  const root = useTestStore((s) => s.root);
  const overrides = useMemo(() => getOverrides(path, root), [path, root]);

  return useMemo(
    () => ({ ...suite, overrides, localOverrides: suite.overrides }),
    [suite, overrides],
  );
}

export function getTest(path: number[], suite: TestSuiteConfig = useTestStore.getState().root) {
  let currentSuite = suite;
  for (const id of path) {
    currentSuite = currentSuite.tests[id] as any;

    if (!currentSuite) {
      throw new Error(`Could not find test with id ${id} in path ${path.join('.')}`);
    }
  }

  if (!currentSuite) {
    return null;
  }

  return currentSuite;
}

export function getOverrides(
  path: number[],
  suite: TestSuiteConfig = useTestStore.getState().root,
): ResolvedTestOverrides {
  let current = suite as TestSuiteConfig | TestConfig;
  let overrides: ResolvedTestOverrides = deepMerge({}, current.overrides);
  for (const id of path) {
    if ('tests' in current) {
      current = current.tests[id];
    } else {
      throw new Error(`Could not find test ${id}`);
    }

    deepMerge(overrides, current.overrides);
  }

  return overrides;
}

// ----------------------------------------------------------------------------
// Describe
// ----------------------------------------------------------------------------

export function describe(
  name: string,
  overrides: TestSuiteConfig['overrides'],
  fn: DescribeFunction,
): void;
export function describe(name: string, fn: DescribeFunction): void;
export function describe(
  name: string,
  overrides: TestSuiteConfig['overrides'] | DescribeFunction,
  fn?: DescribeFunction,
) {
  if (typeof overrides === 'function') {
    fn = overrides;
    overrides = {};
  }
  if (!fn) {
    throw new Error('Missing describe function');
  }

  const id = nextId();
  const previousSuite = useTestStore.getState().root;
  currentSuite.tests[id] = {
    id,
    name,
    tests: {},
    overrides,
    status: 'pending',
    details: undefined,
  };
  currentSuite = currentSuite.tests[id];
  const result = fn();
  // @ts-expect-error - result is supposed to be void
  if (result instanceof Promise || result?.then) {
    throw new Error('Cannot use async on describe');
  }
  currentSuite = previousSuite;
}

// ----------------------------------------------------------------------------
// Test
// ----------------------------------------------------------------------------

export function test(name: string, fn: TestFunction): void;
export function test(name: string, overrides: TestConfig['overrides'], fn: TestFunction): void;
export function test(
  name: string,
  overrides: TestConfig['overrides'] | TestFunction,
  fn?: TestFunction,
) {
  if (typeof overrides === 'function') {
    fn = overrides;
    overrides = {};
  }
  if (!fn) {
    throw new Error('Missing test function');
  }

  const id = nextId();
  currentSuite.tests[id] = {
    id,
    name,
    fn,
    status: 'pending',
    overrides,
    details: undefined,
  };
}

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export type TestFunction = (server: LanguageServerClient) => Promise<void> | void;

export type TestStatus = 'running' | 'success' | 'failed' | 'pending';

export type TestConfig = {
  id: number;
  name: string;
  fn: TestFunction;

  overrides?: TestOverrides;

  status: TestStatus;

  details: any;
};

/**
 * Config override to cascade for a test or all tests in a suite.
 */
export type TestOverrides = Partial<Pick<Config, 'server' | 'args' | 'transport'>> & {
  /**
   * Timeout in milliseconds
   * @default 10000
   */
  timeout?: number;

  /**
   * LSP `initialize` request parameters
   * @default Initialize with all capabilities
   */
  initialize?: boolean | InitializeParams;
};

export type ResolvedTestOverrides = Required<TestOverrides>;

export function isTest(test: TestConfig | TestSuiteConfig): test is TestConfig {
  return !('tests' in test);
}

export type DescribeFunction = () => void;

export type TestSuiteConfig = {
  id: number;
  name: string;
  tests: Record<number, TestConfig | TestSuiteConfig>;
  status: TestStatus;
  overrides?: TestOverrides;
  details: any;
};

export function isTestSuite(test: TestConfig | TestSuiteConfig): test is TestSuiteConfig {
  return 'tests' in test;
}

type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
