const fs = require("fs");
const util = require("util");
const express = require("express");

const router = express.Router();
const exec = util.promisify(require("child_process").exec);

WARNING = "Bookmark this page. It will be updated as the sample is checked against more databases. Reload to see updates.";
ZIP_WARNING = "The following resources have been created and will be processed sequentially:";

async function executeCommand(cmd) {
  return await exec(cmd, {
    maxBuffer: 8 * 1024 * 1024
  });
}

router.post("/", async (request, response) => {
  try {
    const {files} = request || {};
    const {audio} = files || {};
    const {name, size, encoding, truncated, mimetype, md5, mv} = audio || {}; // see docs/file.json5
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
    executeCommand(`for p in $(ls pklz/*.pklz); do echo >> ${txtFilePath} && python3.9 audfprint/audfprint.py match --dbase $p precompute/${relPath}.afpt -R 2>&1 >> ${txtFilePath}; done`).then().catch();

    response.redirect(txtPublicFilePath);

  } catch(error) {
    response.status(500).send(error.toString());
  }
});

router.post("/archive", async (request, response) => {
  try {
    const host = request.get("host");
    const {files, protocol} = request || {};
    const {zip} = files || {};
    const {name: zipName, md5: zipMd5, tempFilePath} = zip || {}; // see docs/file.json5
    const {stdout} = await executeCommand(`unzip -o ${tempFilePath} -d tmp`) || {};

    const filenames = [];
    stdout.split("\n").map(line => {
      const [, filename] = line.match(/inflating: (.+?)\s*$/) || [];
      if (filename) {
        filenames.push(filename);
      }
    });
    let zipTxt = `${ZIP_WARNING}\n\n`;
    const zipTxtPublicFilePath = `archives/${zipMd5}.txt`;
    const zipTxtFilePath = `public/${zipTxtPublicFilePath}`;

    const commands = [];
    await Promise.all(filenames.map(async name => {
      const {stdout: md5line} = await executeCommand(`md5sum ${JSON.stringify(name)} | awk '{print $1}'`) || {};
      const md5 = md5line.trim();

      const relPath = `tmp/${md5}`;
      const txtPublicFilePath = `lookups/${md5}.txt`;
      const txtFilePath = `public/${txtPublicFilePath}`;

      const uploadInfo = JSON.stringify({
        name, md5, zipName
      });
      const txt = `${WARNING}\n\nArchive asset info: ${uploadInfo}\n\n`;
      fs.writeFileSync(txtFilePath, txt);
      zipTxt += `${protocol}://${host}/${txtPublicFilePath}\t${name}\n`;

      await executeCommand(`mv ${JSON.stringify(name)} ${relPath}`);
      await executeCommand(`ts sh sh/precompute.sh ${relPath} ${txtFilePath}`);
      await executeCommand(`ts sh sh/match.sh ${relPath} ${txtFilePath}`);
    }));

    fs.writeFileSync(zipTxtFilePath, zipTxt);
    response.redirect(`/${zipTxtPublicFilePath}`);

  } catch(error) {
    response.status(500).send(error.toString());
  }
});

module.exports = {router};
