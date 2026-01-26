/**
 * GitHub-based storage for JSON data files
 * Allows reading and writing to the repository directly via GitHub API
 * This enables the admin panel to work on Vercel (production) by committing changes
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || 'ani-e-e/IntroCar-US';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

/**
 * Get file content from GitHub
 */
export async function getFileFromGitHub(filePath) {
  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}`,
    {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
      cache: 'no-store'
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch file from GitHub: ${response.status}`);
  }

  const data = await response.json();
  const content = Buffer.from(data.content, 'base64').toString('utf-8');

  return {
    content,
    sha: data.sha // Need this for updating
  };
}

/**
 * Update file content on GitHub (creates a commit)
 */
export async function updateFileOnGitHub(filePath, content, commitMessage) {
  if (!GITHUB_TOKEN) {
    throw new Error('GitHub token not configured. Please set GITHUB_TOKEN environment variable.');
  }

  // First get the current file to get its SHA
  const currentFile = await getFileFromGitHub(filePath);

  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: commitMessage,
        content: Buffer.from(content).toString('base64'),
        sha: currentFile.sha,
        branch: GITHUB_BRANCH
      })
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to update file on GitHub: ${error.message || response.status}`);
  }

  return await response.json();
}

/**
 * Check if GitHub storage is configured
 */
export function isGitHubStorageEnabled() {
  return !!GITHUB_TOKEN;
}
