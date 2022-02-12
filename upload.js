const fs = require("fs");
const util = require("util");
const express = require("express");

const router = express.Router();
const exec = util.promisify(require("child_process").exec);

WARNING = "Bookmark this page. It will be updated as the sample is checked against more databases. Reload to see updates.";

async function executeCommand(cmd) {
  return await exec(cmd, {
    maxBuffer: 8 * 1024 * 1024
  });
}

router.post("/", async (request, response) => {
  try {
    const {files} = request || {};
    const {audio} = files || {};
    const {name, size, encoding, tempFilePath, truncated, mimetype, md5, mv} = audio || {}; // see docs/file.json5
    const relPath = `tmp/${md5}`;
    await mv(relPath);

    const uploadInfo = JSON.stringify({
      name, size, encoding, truncated, mimetype, md5
    });
    const txtPublicFilePath = `lookups/${md5}.txt`;
    const txtFilePath = `public/${txtPublicFilePath}`;

    const txt = `${WARNING}\n\nUpload info: ${uploadInfo}\n\n`;
    fs.writeFileSync(txtFilePath, txt);

    await executeCommand(`python3.9 audfprint/audfprint.py precompute ${relPath} -p precompute --shifts 4 2>&1 >> ${txtFilePath}`);
    await executeCommand(`for p in $(ls pklz/*.pklz); do echo >> ${txtFilePath} && python3.9 audfprint/audfprint.py match --dbase $p precompute/${relPath}.afpt -R 2>&1 >> ${txtFilePath}; done`);

    response.redirect(txtPublicFilePath);

  } catch(error) {
    response.status(500).send(error.toString());
  }
});

router.post("/unzip", async (request, response) => {
  try {
    const {files} = request || {};
    const {zip} = files || {};
    const {name, size, encoding, tempFilePath, truncated, mimetype, md5} = zip || {}; // see docs/file.json5
    response.json({name, size, encoding, tempFilePath, truncated, mimetype, md5});

  } catch(error) {
    response.status(500).send(error.toString());
  }
});

module.exports = {router};
