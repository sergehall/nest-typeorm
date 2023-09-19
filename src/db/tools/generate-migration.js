let exec;
({ exec } = require('child_process'));
let fs;
fs = require('fs');
let glob;
glob = require('glob');

// Check if a migration name has been provided
if (process.argv.length < 3) {
  console.log("You're almost there! Just one more thing... 🚀");
  console.error('Please provide a migration name.');
  process.exit(1);
}

const migrationName = process.argv[2];
const sourceFile = './src/db/data-source.ts';

// Check if the source file exists
if (!fs.existsSync(sourceFile)) {
  console.error(`Source file ${sourceFile} does not exist.`);
  process.exit(1);
}

const command = `typeorm-ts-node-esm migration:generate ./src/db/migrations/${migrationName} -d ${sourceFile}`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
  if (stderr) {
    console.error(`Error: ${stderr}`);
    process.exit(1);
  }
  console.log(stdout);

  // After generating the migration, add all new migration files to the Git staging area
  const migrationWildcard = './src/db/migrations/*.ts';
  glob(migrationWildcard, (globError, files) => {
    if (globError) {
      console.error(
        `Error while globbing migration files: ${globError.message}`,
      );
      process.exit(1);
    }
    if (files.length === 0) {
      console.log('No new migration files found to add to Git staging area.');
      return;
    }

    // Get the last created migration file
    const lastCreatedMigration = files[files.length - 1];

    const gitAddCommand = `git add ${lastCreatedMigration}`;

    exec(gitAddCommand, (addError) => {
      if (addError) {
        console.error(
          `Error adding migration files to Git: ${addError.message}`,
        );
        process.exit(1);
      }
      console.log(
        `Added the last created migration file to Git staging area:\n${lastCreatedMigration}`,
      );
    });

    // Run ESLint with --fix on the migration files
    const eslintFixCommand = `npx eslint --fix ${files.join(' ')}`;
    exec(eslintFixCommand, (eslintError) => {
      if (eslintError) {
        console.error(`Error running ESLint: ${eslintError.message}`);
        process.exit(1);
      }
      console.log('ESLint fixes applied to migration files.');
    });
  });
});
