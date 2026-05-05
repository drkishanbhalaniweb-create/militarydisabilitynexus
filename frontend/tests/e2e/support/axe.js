const fs = require('fs');

const axeSource = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

async function findCriticalAxeViolations(page) {
  await page.addScriptTag({ content: axeSource });

  return page.evaluate(async () => {
    const results = await window.axe.run(document, {
      resultTypes: ['violations'],
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
      },
    });

    return results.violations
      .filter((violation) => violation.impact === 'critical')
      .map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        help: violation.help,
        nodes: violation.nodes.slice(0, 5).map((node) => ({
          target: node.target,
          failureSummary: node.failureSummary,
        })),
      }));
  });
}

function formatAxeViolations(violations) {
  return violations
    .map((violation) => {
      const targets = violation.nodes
        .map((node) => `${node.target.join(', ')}: ${node.failureSummary || ''}`)
        .join('\n');

      return `${violation.id} (${violation.impact}) - ${violation.help}\n${targets}`;
    })
    .join('\n\n');
}

module.exports = {
  findCriticalAxeViolations,
  formatAxeViolations,
};
