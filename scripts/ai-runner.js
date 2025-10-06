#!/usr/bin/env node
const fs = require('fs/promises');
const path = require('path');

const {
  GITHUB_REPOSITORY = '', // owner/repo
  GITHUB_TOKEN,
  PR_NUMBER, // target PR number
  ALLOW_WRITE_DIRS = 'tests,docs',
} = process.env;

if (!GITHUB_TOKEN || !GITHUB_REPOSITORY || !PR_NUMBER) {
  console.error('Missing env: GITHUB_TOKEN/GITHUB_REPOSITORY/PR_NUMBER');
  process.exit(1);
}

const [owner, repo] = GITHUB_REPOSITORY.split('/');
const allowDirs = ALLOW_WRITE_DIRS.split(',').map(s => s.trim());

async function gh(pathname) {
  const r = await fetch(`https://api.github.com${pathname}`, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'ai-mvp-runner'
    }
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`GitHub API ${pathname} -> ${r.status} ${txt}`);
  }
  return r.json();
}

function deduceClassName(file) {
  const base = path.basename(file).replace(/\.php$/, '');
  return base.replace(/[^A-Za-z0-9_]/g, '');
}

function testTemplate(phpClass, ns = 'App') {
  return `<?php

use ${ns}\\\\${phpClass};

class ${phpClass}Test extends \\\\Codeception\\\\Test\\\\Unit
{
    public function testSample()
    {
        $obj = new ${phpClass}();
        $this->assertTrue(method_exists($obj, '__construct'));
    }
}
`;
}

(async () => {
  // 1) PR files
  const files = await gh(`/repos/${owner}/${repo}/pulls/${PR_NUMBER}/files`);
  const phpSrc = files.map(f => f.filename).filter(f => f.startsWith('src/') && f.endsWith('.php'));
  if (phpSrc.length === 0) {
    console.log('No PHP source changes detected, skip.');
    return;
  }

  await fs.mkdir('tests/unit', { recursive: true });

  const created = [];
  for (const f of phpSrc) {
    const cls = deduceClassName(f);
    const p = path.join('tests', 'unit', `${cls}Test.php`);
    try {
      await fs.access(p);
      // already exists
    } catch {
      await fs.writeFile(p, testTemplate(cls), 'utf8');
      created.push(p);
    }
  }

  const whitelisted = created.filter(p => allowDirs.some(dir => p.startsWith(dir + '/')));
  console.log('Created test skeletons:', whitelisted);
})().catch(err => { console.error(err); process.exit(1); });
