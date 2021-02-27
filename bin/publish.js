const fs = require('fs');

const [, , argument] = process.argv;
const CONSTANTS = {
  ProjectsDirPath: './projects',
};
const availableProjects = fs.readdirSync(CONSTANTS.ProjectsDirPath);

if (!argument) {
  console.error('Missing required parameter "project".');
  process.exit(1);
} else if (!availableProjects.includes(argument)) {
  console.error(`Unknown project "${argument}".`);
  process.exit(1);
}

const project = argument;

class Task {
  constructor() {
    this.name = '';
  }

  /**
   * @return {Promise<void>}
   */
  execute() {
  }
}

class BuildProjectTask extends Task {
  constructor() {
    super();
    this.name = `Building projects`;
  }

  execute() {
    const {exec} = require('child_process');
    return new Promise((resolve, reject) => {
      const childProcess = exec(`node bin/build.js ${project}`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
      childProcess.stdout.on('data', process.stdout.write);
    });
  }
}

class CheckGitDiffTask extends Task {
  constructor() {
    super();
    this.name = 'Check git diff';
  }

  execute() {
    const {exec} = require('child_process');
    return new Promise((resolve, reject) => {
      exec('git diff', (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          if (stdout) {
            reject('You have uncommited changes');
          } else {
            resolve();
          }
        }
      });
    });
  }
}

class GitTagVersionTask extends Task {
  constructor() {
    super();
    this.name = 'Tagging commit';
  }

  execute() {
    const fs = require('fs');
    const packageJson = JSON.parse(fs.readFileSync(`./dist/${project}/package.json`));
    const tagName = `${project}.${packageJson.version}`;
    return new Promise((resolve, reject) => {
      this.isExistsTag(tagName).then(isExistingTag => {
        if (isExistingTag) {
          reject('Publishing process aborted. Please change the package version.');
        } else {
          this.createTag(tagName).then(resolve).catch(reject);
        }
      }).catch(reject);
    });
  }

  /**
   * @param tagName {string}
   * @return Promise<void>
   */
  async createTag(tagName) {
    const {exec} = require('child_process');
    await new Promise((resolve, reject) => {
      exec(`git tag ${tagName}`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
    await new Promise((resolve, reject) => {
      exec(`git push --tags`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * @param tagName {string}
   * @return Promise<boolean>
   */
  isExistsTag(tagName) {
    const {exec} = require('child_process');
    return new Promise((resolve, reject) => {
      exec(`git tag --list ${tagName}`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          if (stdout) {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      });
    });
  }
}

class PublishProjectTask extends Task {
  constructor() {
    super();
    this.name = 'Publishing project';
  }

  execute() {
    const {exec} = require('child_process');
    return new Promise((resolve, reject) => {
      exec(`cd dist/${project} && npm publish`, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
}

/**
 * @param tasks {Function<Task>}
 * @return {Promise<void>}
 */
async function runTasks(...tasks) {
  for (const taskConstructor of tasks) {
    const task = new taskConstructor();
    console.log(task.name);
    try {
      await task.execute();
    } catch (e) {
      if (e) {
        console.error('\n---------\n  ERROR\n---------');
        console.error(e);
        console.error('---------');
      }
      return;
    }
  }
}

runTasks(
  CheckGitDiffTask,
  BuildProjectTask,
  PublishProjectTask,
  GitTagVersionTask,
);
