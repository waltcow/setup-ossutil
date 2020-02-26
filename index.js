const core = require("@actions/core");
const { exec } = require("@actions/exec");
const toolCache = require("@actions/tool-cache");
const path = require("path");
const fs = require("fs");

const url = "http://gosspublic.alicdn.com/ossutil/1.6.7/ossutilmac64";

async function main() {
  const ENDPOINT = core.getInput("endpoint");
  const ACCESS_KEY_ID = core.getInput("access-key-id");
  const ACCESS_KEY_SECRET = core.getInput("access-key-secret");
  const STS_TOKEN = core.getInput("sts-token");

  let toolPath = toolCache.find("ossutilmac64", "1.6.7");

  if (!toolPath) {
    core.info(`downloading from ${url}`);
    toolPath = await toolCache.downloadTool(url);
    core.info(`downloaded to ${toolPath}`);
  }

  const bin = path.join(__dirname, ".bin");
  if (!fs.existsSync(bin)) {
    fs.mkdirSync(bin, {
      recursive: true
    });
  }

  fs.copyFileSync(toolPath, path.join(bin, "ossutilmac64"));
  fs.chmodSync(path.join(bin, "ossutilmac64"), 0o755);

  core.addPath(bin);

  await exec("ossutilmac64", [
    "config",
    "-e",
    ENDPOINT,
    "-i",
    ACCESS_KEY_ID,
    "-k",
    ACCESS_KEY_SECRET,
    ...(STS_TOKEN ? ["-t", STS_TOKEN] : []),
    "-L",
    "CH"
  ]);
}

main().catch(error => {
  core.setFailed(error.message);
});
