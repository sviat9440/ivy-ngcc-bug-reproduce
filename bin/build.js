const [, , argument, secondArgument] = process.argv;
const fs = require('fs');
const path = require('path');
const semver = require('semver');
const {exec} = require('child_process');
const CONSTANTS = {
  ProjectsDirPath: './projects',
  DistDirPath: './dist',
};

let availableProjects = getAvailableProjects();

if (argument === '--all') {

} else if (argument) {
  if (!availableProjects.find(item => item.name === argument)) {
    console.error(`Project with name "${argument}" was not found.`);
    process.exit(1);
  }
  let neededProjects = [];
  if (secondArgument === '--without-deps') {
    neededProjects = getNeededProjectsWithoutDeps(argument);
  } else if (secondArgument === '--all-deps') {
    neededProjects = getNeededProjectsAllDeps(argument);
  } else {
    neededProjects = getNeededProjectsSmartDeps(argument);
  }
  availableProjects = availableProjects.filter(project => neededProjects.includes(project.name));
} else {
  console.error('Required argument "project" is missing.');
  process.exit(1);
}

buildProjects();

/**
 * @param projectName {string}
 * @returns {Promise<void>}
 */
function buildProject(projectName) {
  return new Promise((resolve, reject) => {
    exec(`ng build ${projectName} --prod`, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

async function buildProjects() {
  for (const project of availableProjects) {
    console.log(`Building project: ${project.name}`);
    try {
      await buildProject(project.name);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  }
}

/**
 * @returns {Array<{name: string, version: string, deps: object}>}
 */
function getAvailableProjects() {
  const projectNamesList = fs.readdirSync(CONSTANTS.ProjectsDirPath);
  const projects = projectNamesList.map(projectName => {
    /**
     * @type {{version: string, peerDependencies: object}}
     */
    const packageJson = JSON.parse(fs.readFileSync(path.join(CONSTANTS.ProjectsDirPath, projectName, 'package.json')));
    return {
      name: projectName,
      version: packageJson.version,
      deps: Object.keys(
        packageJson.peerDependencies,
      ).filter(
        dependency => projectNamesList.includes(dependency.replace('@front-polis/', '')),
      ).reduce(
        (a, dependency) => Object.assign(a, {[dependency.replace('@front-polis/', '')]: packageJson.peerDependencies[dependency]}),
        {},
      ),
    };
  });

  projects.forEach(project => checkCircularDependencies(projects, project.name));
  checkProjectDependenciesVersion(projects);

  const sortedProjects = [];

  function insert(project, index = sortedProjects.length) {
    sortedProjects.splice(index, 0, project);
    projects.splice(projects.indexOf(project), 1);
  }

  function skip(project) {
    projects.splice(projects.indexOf(project), 1);
    projects.push(project);
  }

  while (sortedProjects.length < projectNamesList.length) {
    const project = projects[0];
    if (Object.keys(project.deps).length === 0) {
      insert(project);
    } else {
      const depsIndexes = Object.keys(project.deps).map(
        dependency => sortedProjects.findIndex(item => item.name === dependency),
      );
      if (depsIndexes.includes(-1)) {
        skip(project);
      } else {
        const maxDepsIndex = Math.max(...depsIndexes);
        insert(project, maxDepsIndex + 1);
      }
    }
  }

  return sortedProjects;
}

/**
 * @param projects {Array<{name: string, version: string, deps: object}>}
 * @param projectName {string}
 * @param deps {Array<string>}
 */
function checkCircularDependencies(projects, projectName, deps = []) {
  if (deps.includes(projectName)) {
    deps = deps.slice();
    deps.push(projectName);
    console.error(`Circular dependencies found:\n\n\t${deps.join(' => ')}`);
    process.exit(1);
  }
  deps = deps.slice();
  deps.push(projectName);
  const project = projects.find(item => item.name === projectName);
  Object.keys(project.deps).forEach(dependency => checkCircularDependencies(projects, dependency, deps));
}

/**
 * @param projects {Array<{name: string, version: string, deps: object}>}
 */
function checkProjectDependenciesVersion(projects) {
  let isHasInvalidDeps = false;
  projects.forEach(
    project => Object.entries(project.deps).forEach(
      ([dependencyKey, dependencyVersion]) => {
        const dependencyProject = projects.find(item => item.name === dependencyKey);
        if (!semver.satisfies(dependencyProject.version, dependencyVersion)) {
          console.error(`Project ${project.name} depends on ${dependencyKey}@${dependencyVersion}. ` +
            `But actual dependency version is ${dependencyProject.version}.`);
          isHasInvalidDeps = true;
        }
      },
    ),
  );
  if (isHasInvalidDeps) {
    process.exit(1);
  }
}

/**
 * @param projectName {string}
 * @returns {Array<string>}
 */
function getNeededProjectsWithoutDeps(projectName) {
  return [projectName];
}

/**
 * @param projectName {string}
 * @returns {Array<string>}
 */
function getNeededProjectsAllDeps(projectName) {
  const result = [];

  function findNeededProject(projectName) {
    result.push(projectName);
    const project = availableProjects.find(item => item.name === projectName);
    Object.keys(project.deps).forEach(findNeededProject);
  }

  findNeededProject(argument);
  return result;
}


/**
 * @param projectName {string}
 * @returns {Array<string>}
 */
function getNeededProjectsSmartDeps(projectName) {
  const result = getNeededProjectsAllDeps(projectName);
  if (!fs.existsSync(CONSTANTS.DistDirPath)) {
    return result;
  }
  const buildProjects = fs.readdirSync(CONSTANTS.DistDirPath).filter(project => result.includes(project));
  return result.filter(project => {
    if (project === projectName || !buildProjects.includes(project)) {
      return true;
    } else {
      const packageJsonPath = path.join(CONSTANTS.DistDirPath, project, 'package.json');
      if (!fs.existsSync(packageJsonPath)) {
        return true;
      }
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath));
      const currentVersion = availableProjects.find(item => item.name === project).version;
      return packageJson.version !== currentVersion;
    }
  });
}
