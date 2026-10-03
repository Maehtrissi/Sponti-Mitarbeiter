import assert from 'node:assert/strict';
import { test } from 'node:test';
import { hasEmployeeAccess } from './employeeAccess.ts';

test('rejects absent users, normal customers and anonymous users', () => {
  assert.equal(hasEmployeeAccess(null), false);
  assert.equal(hasEmployeeAccess({ app_metadata: {} }), false);
  assert.equal(hasEmployeeAccess({ app_metadata: { sponti_employee: 'true' } }), false);
  assert.equal(hasEmployeeAccess({ is_anonymous: true, app_metadata: { sponti_employee: true } }), false);
});
test('only administrator-controlled employee metadata grants access', () => {
  const editable = { app_metadata: {}, user_metadata: { sponti_employee: true } };
  assert.equal(hasEmployeeAccess(editable), false);
  assert.equal(hasEmployeeAccess({ app_metadata: { sponti_employee: true } }), true);
});
