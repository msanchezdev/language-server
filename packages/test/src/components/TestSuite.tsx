import spinners from 'cli-spinners';
import { Task } from 'ink-task-list';
import { useTest } from '~/context';
import { Test } from './Test';
import { Box } from 'ink';

export interface TestSuiteProps {
  path: number[];
  isRoot?: boolean;
}

/**
 * The TestSuite component is responsible for rendering the test suite and
 * controlling the test execution.
 */
export function TestSuite({ path }: TestSuiteProps) {
  const isRoot = path.length === 0;
  const suite = useTest(path);
  const testList = Object.values(suite.tests);

  const children = testList.map((test) =>
    'tests' in test ? (
      <TestSuite key={test.id} path={[...path, test.id]} />
    ) : (
      <Test key={test.id} path={[...path, test.id]} />
    ),
  );

  return isRoot ? (
    <Box flexDirection="column">{children}</Box>
  ) : (
    <Task
      label={suite.name}
      state={
        {
          running: 'loading' as const,
          success: 'success' as const,
          failed: 'error' as const,
          pending: 'pending' as const,
        }[suite.status]
      }
      spinner={spinners.dots}
      isExpanded
    >
      {children}
    </Task>
  );
}
