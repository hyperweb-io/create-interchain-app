import { CIA_URL } from "./constants";
import { createGitApp } from "./git-cia-template";
export const cli = async (argv, version) => {
  const repo = argv.repo ?? CIA_URL;
  const createCosmosApp = createGitApp(repo, version);
  await createCosmosApp(argv);
};