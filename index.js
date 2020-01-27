const fs = require('fs');
const tmp = require('tmp');
const util = require('util');
const io = require('@actions/io');
const core = require('@actions/core');
const exec = util.promisify(require('child_process').exec);

async function run() {
  const json = core.getInput('json-file', { required: true });
  const expression = core.getInput('expression', { required: true });
  await transform(json, expression)
    .then(file => core.setOutput('file', file))
    .catch(err => core.setFailed(err.message));
}

async function transform(json, expression) {
  const jq = await io.which('jq', true);
  const { stdout, stderr } = await exec(`${jq} '${expression}' ${json}`);

  if (stderr) {
    throw Error(stderr);
  }

  const file = tmp.fileSync({
    dir: process.env.RUNNER_TEMP,
    prefix: 'file-',
    postfix: '.json',
    keep: true,
    discardDescriptor: true
  });

  const content = JSON.stringify(stdout, null, 2);
  fs.writeFileSync(file.name, content);
  return file.name;
}

module.exports = run;
if (require.main === module) {
  run();
}
