const fs = require('fs');
const tmp = require('tmp');
const path = require('path');
const run = require('../index');
const core = require('@actions/core');

jest.mock('tmp');
jest.mock('@actions/core');

const jsonFile = path.join(__dirname, 'input.json');

const setup = () => {
  jest.clearAllMocks();
  tmp.fileSync.mockReturnValue({ dir: '/tmp', name: 'new-file-name' });
};

describe('tranform json', () => {
  beforeEach(setup);

  it('transforms the input json file', async () => {
    core.getInput = jest
      .fn()
      .mockReturnValueOnce(jsonFile)
      .mockReturnValueOnce(
        '.name = "chris" | .props.one = 1 | .props.two.three = 3'
      );

    await run();
    expect(core.setOutput).toHaveBeenNthCalledWith(1, 'file', 'new-file-name');
  });

  it('should set failed on error', async () => {
    core.getInput = jest
      .fn()
      .mockReturnValueOnce(jsonFile)
      .mockReturnValueOnce('.name.doesntexist += {}');

    await run();
    expect(core.setFailed).toHaveBeenNthCalledWith(
      1,
      `Command failed: /usr/local/bin/jq '.name.doesntexist += {}' /Users/martin/code/oforce/action-transform-json/__tests__/input.json
jq: error (at /Users/martin/code/oforce/action-transform-json/__tests__/input.json:9): Cannot index string with string \"doesntexist\"
`
    );
  });
});
