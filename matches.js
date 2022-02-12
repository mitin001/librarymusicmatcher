const util = require("util");
const express = require("express");

const router = express.Router();
const exec = util.promisify(require("child_process").exec);

async function executeCommand(cmd) {
  return await exec(cmd, {
    maxBuffer: 8 * 1024 * 1024
  });
}

router.get("/", async (request, response) => {
  try {
    executeCommand(`grep -B 2 Matched -h public/lookups/*.txt`).then((std) => {
      const {stdout} = std || {};
      response.type("txt").send(stdout);
    }).catch();
  } catch(error) {
    response.status(500).send(error.toString());
  }
});

router.get("/:file", async (request, response) => {
  try {
    const {params} = request || {};
    const {file} = params || {};
    executeCommand(`head -n 4 public/lookups/${file} && grep -B 2 Matched public/lookups/${file}`).then((std) => {
      const {stdout} = std || {};
      response.type("txt").send(stdout);
    }).catch();
  } catch(error) {
    response.status(500).send(error.toString());
  }
});

module.exports = {router};
