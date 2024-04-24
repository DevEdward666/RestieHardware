const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

(async () => {
  try {
    const { data: { sha } } = await octokit.repos.getContent({
      owner: 'DevEdward666',
      repo: 'RestieHardware',
      path: 'RestieHardware/restie/src/Helpers/environment.prod.ts'
    });

    const { data: { content } } = await octokit.repos.createOrUpdateFileContents({
      owner: 'DevEdward666',
      repo: 'RestieHardware',
      path: 'RestieHardware/restie/src/Helpers/environment.prod.ts',
      message: 'Update prodBaseUrl value',
      content: Buffer.from('', 'utf-8').toString('base64'),
      sha: sha,
      branch: 'release'
    });

    console.log(content); // Output the result for debugging
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
