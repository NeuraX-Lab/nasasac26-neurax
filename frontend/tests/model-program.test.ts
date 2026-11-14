// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest';
import { createElement } from 'react';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { ModelProgramEvidence, ModelProgramSchema } from '../src/features/analysis/ModelProgramEvidence';
vi.mock('react-i18next', () => ({useTranslation: () => ({i18n:{language:'en'}})}));
const fixture = JSON.parse(readFileSync('public/research/model-program.json', 'utf8'));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

test('schema rejects runtime-inference or promotion disguised as research report', () => {
  expect(ModelProgramSchema.parse(fixture).tasks).toHaveLength(4);
  expect(() => ModelProgramSchema.parse({...fixture, production_inference:true})).toThrow();
  expect(() => ModelProgramSchema.parse({...fixture, tasks:[{...fixture.tasks[0],status:'PROMOTED'}]})).toThrow();
});
test('report loads through API and stops displaying it when geometry is unsupported', async () => {
  const fetcher = vi.fn().mockResolvedValue({ok:true,json:async()=>fixture});
  vi.stubGlobal('fetch', fetcher);
  const view = render(createElement(ModelProgramEvidence, {aoiId:'my-thanh',supported:true}));
  await waitFor(() => expect(screen.getByText(/Recorded evaluation results/)).toBeTruthy());
  expect(fetcher.mock.calls[0][0]).toContain('aoi_id=MT-BLOCK-01');
  view.rerender(createElement(ModelProgramEvidence, {aoiId:'my-thanh',supported:false}));
  expect(screen.queryByTestId('model-program-evidence')).toBeNull();
});
test('API failure produces honest unavailable and no invented metrics', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ok:false}));
  render(createElement(ModelProgramEvidence, {aoiId:'my-thanh',supported:true}));
  await waitFor(() => expect(screen.getByRole('status').textContent).toContain('unavailable'));
  expect(screen.queryByRole('table')).toBeNull();
});
