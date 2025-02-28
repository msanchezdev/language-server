import { Task } from 'ink-task-list';
import spinners from 'cli-spinners';
import { useTest } from '~/context';

export interface TestProps {
  path: number[];
}

export function Test({ path }: TestProps) {
  const test = useTest(path);

  return (
    <Task
      label={test.name}
      state={
        {
          running: 'loading' as const,
          success: 'success' as const,
          failed: 'error' as const,
          pending: 'pending' as const,
        }[test.status]
      }
      spinner={spinners.dots}
      output={`${test.details instanceof Error ? test.details.stack : test.details || ''}`}
    />
  );
}
