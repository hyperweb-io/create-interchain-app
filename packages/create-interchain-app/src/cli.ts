import { CIA_URL } from "./constants";
import { createGitApp } from "./git-cia-template";
import protodCommand from '@cosmology/telescope/main/commands/download'
export const cli = async (argv, version) => {
  switch (argv._[0]) {
    case 'protod':
      await protodCommand(argv);
      break;
    default: {
      const repo = argv.repo ?? CIA_URL;
      const createCosmosApp = createGitApp(repo, version);
      await createCosmosApp(argv);
      break;
    }
  }
};