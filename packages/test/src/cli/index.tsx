import React, { useEffect } from 'react';
import packageJson from '../../package.json';
import { Command } from 'commander';
import { Glob } from 'bun';
import { render, useApp } from 'ink';
import type { Config } from '~/config';
import { useTestStore } from '~/context';
import { useRunner } from '~/runner';
import { Runner } from '~/views/runner';

await new Command()
  .name('testls')
  .version(packageJson.version)
  .usage('testls [options] -- [lsp command]')
  .description(packageJson.description)
  .option('-a, --all', 'Run all tests')
  .option(
    '-t, --transport <transport>',
    `Transport to use for sending and receiving messages.
Indicate url to use:
- stdio
- tcp://127.0.0.1:8080
- ws://127.0.0.1:8080`, // - unix:///tmp/lsp.sock
    (value) => {
      if (value === 'stdio') {
        return 'stdio';
      }

      const url = new URL(value);
      if (['tcp:', 'ws:', 'wss:'].indexOf(url.protocol) === -1) {
        throw new Error(`Unsupported protocol ${url.protocol}`);
      }

      return {
        protocol: url.protocol.slice(0, -1),
        host: url.hostname,
        port: url.port,
        path: url.pathname,
      };
    },
    'stdio',
  )
  // .option('--no-header', 'Do not send headers, just the body', false) // TODO: to conform with tsserver
  .allowExcessArguments()
  .passThroughOptions()
  .action(main)
  .parseAsync();

type CliOptions = Config;

async function main(options: CliOptions, program: Command) {
  console.log(options);
  const [server, ...args] = program.args;

  const bin = Bun.which(server);
  if (!bin) {
    throw new Error(`Could not find executable ${server}`);
  }

  const config: Config = {
    all: options.all,
    server: bin,
    args,
    transport: options.transport,
  };

  const glob = new Glob(__dirname + '/../tests/*.ts');
  for await (const file of glob.scan()) {
    await import(file);
  }

  useTestStore.getState().setOverrides([], {
    server: config.server,
    args: config.args,
    transport: config.transport,
  });
  const app = render(<App norender={true} config={config} />);
  await app.waitUntilExit();
}

// ------------------------------------------------------------------------

function App({ config, norender }: { config: Config; norender: boolean }) {
  const app = useApp();
  const runner = useRunner();

  useEffect(() => {
    runner.start().then(() => {
      app.exit();
    });
  }, []);

  if (norender) {
    return null;
  }

  return <Runner config={config} />;
}
