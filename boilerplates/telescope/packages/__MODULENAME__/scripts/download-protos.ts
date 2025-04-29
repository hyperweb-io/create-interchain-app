// @ts-ignore
import downloadProtos from '@cosmology/telescope/main/commands/download'

const config = {
  repos: [
    { owner: "cosmos", repo: "cosmos-sdk", branch: "release/v0.50.x" },
    { owner: "cosmos", repo: "ibc-go" },
  ],
  protoDirMapping: {
    "gogo/protobuf/master": ".",
    "googleapis/googleapis/master": ".",
    "protocolbuffers/protobuf/main": "src"
  },
  outDir: "protos",
  ssh: false,
  tempRepoDir: "git-modules",
  targets: [
    "cosmos/**/*.proto",
    "ibc/**/*.proto",
  ]
};

downloadProtos(config)
  .then(() => console.log('✅ Proto download completed'))
  // @ts-ignore
  .catch((error) => {
    console.error('❌ Proto download failed:', error);
    process.exit(1);
  });