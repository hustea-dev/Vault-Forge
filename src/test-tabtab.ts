import tabtab from 'tabtab';

const install = async () => {
  await tabtab.install({
    name: 'vf-test',
    completer: 'vf-test'
  });
};

const uninstall = async () => {
  await tabtab.uninstall({
    name: 'vf-test'
  });
};

const run = async () => {
  const env = tabtab.parseEnv(process.env);

  if (!env.complete) return;


  if (env.prev === '-m' || env.prev === '--model') {
    return tabtab.log([
      'gpt-4',
      'gemini-pro',
      'claude-3-opus'
    ]);
  }

  if (env.prev === 'ai') {
    return tabtab.log([
      '-m',
      '--model',
      '-s',
      '--strategy'
    ]);
  }

  if (env.words === 1) {
    return tabtab.log([
      'ai',
      'diary',
      'find'
    ]);
  }
};

const args = process.argv.slice(2);
if (args[0] === 'install') {
  install();
} else if (args[0] === 'uninstall') {
  uninstall();
} else {
  run();
}
