const fs = require('fs');
const { exec } = require('child_process');
const CONSTANTS = {
  ProjectsDirPath: './projects',
};

const availableProjects = fs.readdirSync(CONSTANTS.ProjectsDirPath);
testProjects();

/**
 * @param projectName {string}
 * @returns {Promise<void>}
 */
async function testProject(projectName) {
  await new Promise((resolve, reject) => {
    console.log(`Testing project: ${projectName}`);
    exec(`ng test ${projectName} --no-watch`, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

async function testProjects() {
  for (const project of availableProjects) {
    try {
      await testProject(project);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  }
}
