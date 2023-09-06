import { generateMigration, revertLastMigration, runMigrations } from '@vendure/core';
import program from 'commander';

import { config } from './src/vendure-config';

program
  .command('generate <name>')
  .description('Generate a new migration file with the given name')
  .action((name) => generateMigration(config, { name, outputDir: './src/migrations' }));

program
  .command('run')
  .description('Run all pending migrations')
  .action(() => runMigrations(config));

program
  .command('revert')
  .description('Revert the last applied migration')
  .action(() => revertLastMigration(config));

program.parse(process.argv);
