const RELEASE_STEPS = [
  { id: 'code_freeze', label: 'Code freeze' },
  { id: 'unit_tests', label: 'Unit tests passing' },
  { id: 'integration_tests', label: 'Integration tests passing' },
  { id: 'staging_deploy', label: 'Deployed to staging' },
  { id: 'qa_sign_off', label: 'QA sign-off' },
  { id: 'release_notes', label: 'Release notes written' },
  { id: 'db_migrations', label: 'DB migrations applied' },
  { id: 'prod_deploy', label: 'Deployed to production' },
  { id: 'smoke_tests', label: 'Smoke tests passing' },
  { id: 'monitoring', label: 'Monitoring & alerts verified' },
];

function computeStatus(completedSteps) {
  if (!completedSteps || completedSteps.length === 0) return 'planned';
  if (completedSteps.length >= RELEASE_STEPS.length) return 'done';
  return 'ongoing';
}

module.exports = { RELEASE_STEPS, computeStatus };
