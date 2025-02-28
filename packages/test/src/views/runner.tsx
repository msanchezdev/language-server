import { Box, Text } from 'ink';
import { TestSuite } from '~/components/TestSuite';
import type { Config } from '~/config';

export function Runner({ config }: { config: Config }) {
  return (
    <Box flexDirection="column">
      <Text>
        <Text color="cyan">Binary:</Text> {config.server}
      </Text>

      <Text color="cyan">Arguments:</Text>
      {config.args.map((arg, index) => (
        <Text key={index}>{`  ${arg}`}</Text>
      ))}

      <Box paddingTop={1}>
        <TestSuite path={[]} />
      </Box>
    </Box>
  );
}
