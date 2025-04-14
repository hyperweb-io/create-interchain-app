import { CIA_URL } from "./constants";
import { createGitApp } from "./git-cia-template";
import protodCommand from '@cosmology/telescope/main/commands/download'
export const cli = async (argv, version) => {
  if (argv._[0] === 'protod') {
    console.log('got protod')
    await protodCommand(argv);
  } else {
  const repo = argv.repo ?? CIA_URL;
  const createCosmosApp = createGitApp(repo, version);
  await createCosmosApp(argv);
  }
};