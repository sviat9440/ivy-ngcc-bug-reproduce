let step = 1;

function executeStep(title, cmd) {
  const {execSync} = require('child_process');
  const currentStep = step++;
  console.log('-----------');
  console.log(`Step ${currentStep}: ${title}`);
  console.log('-----------');
  if (typeof cmd === "string") {
    execSync(cmd, {
      stdio: "inherit",
    });
  } else if (typeof cmd === "function") {
    cmd();
  }
}

executeStep('Install npm dependencies', 'npm i');

executeStep('Remove dist if exists', () => {
  const {existsSync, rmdirSync} = require('fs');
  if (existsSync('./dist')) {
    rmdirSync('./dist', {
      recursive: true,
    });
  }
});

executeStep('Build all projects', 'node bin/build.js --all');

try {
  executeStep('Test ui-count-to project', 'ng test ui-count-to --no-watch');
} catch (e) {
  console.error('Tests failed, because ui-pipes-testing not exists in ui-pipes/__ivy_ngcc__/');
}
