// @vitest-environment jsdom
import {afterEach,expect,test,vi} from 'vitest';
import {createElement} from 'react';
import {cleanup,fireEvent,render,screen,waitFor,act} from '@testing-library/react';
import {readFileSync} from 'node:fs';
import {ResearchInference,ResearchInferenceSchema} from '../src/features/analysis/ResearchInference';
vi.mock('react-i18next',()=>({useTranslation:()=>({i18n:{language:'en'}})}));
const output=JSON.parse(readFileSync('tests/fixtures/research-inference.example.json','utf8')).response;
const geometry=JSON.parse(readFileSync('public/analysis/my-thanh.saved.json','utf8')).inputs.geometry;
const cap={schema_version:'agrotwin-research-capabilities-1',available:true,latest_reference_month:'2026-11-01',first_reference_month:'2024-01-01',data_as_of_month:'2026-10-01',production_forecast_available:false,agronomic_integration_eligible:false};
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
test('schema rejects inferred production or agronomic promotion',()=>{
 expect(ResearchInferenceSchema.parse(output).prediction).toBeTypeOf('number');
 expect(()=>ResearchInferenceSchema.parse({...output,production_approved:true})).toThrow();
 expect(()=>ResearchInferenceSchema.parse({...output,agronomic_integration_eligible:true})).toThrow();
});
test('user request reaches API and renders its computed value, not an E1 report',async()=>{
 const fetcher=vi.fn().mockImplementation((url:string)=>Promise.resolve({ok:true,json:async()=>url.includes('capabilities')?cap:output}));
 vi.stubGlobal('fetch',fetcher);render(createElement(ResearchInference,{aoiId:'my-thanh',geometry,supported:true}));
 await waitFor(()=>expect(screen.queryByRole('button',{name:'Run research inference'})).toBeTruthy());
 fireEvent.click(screen.getByRole('button',{name:'Run research inference'}));
 await waitFor(()=>expect(screen.queryByTestId('research-inference-result')).toBeTruthy());
 expect(screen.getByText(/Computed model output/).textContent).toContain(output.prediction.toFixed(2));
 const request=JSON.parse(fetcher.mock.calls[1][1].body);expect(request.reference_month).toBe('2026-11-01');
 expect(request.geometry).toEqual(geometry);expect(request.target).toBe('temp');
});
test('late response cannot show after reference inputs change',async()=>{
 let resolve!: (v:unknown)=>void;
 vi.stubGlobal('fetch',vi.fn().mockImplementation((url:string)=>url.includes('capabilities')?Promise.resolve({ok:true,json:async()=>cap}):new Promise(r=>{resolve=r;})));
 render(createElement(ResearchInference,{aoiId:'my-thanh',geometry,supported:true}));
 await waitFor(()=>expect(screen.queryByRole('button',{name:'Run research inference'})).toBeTruthy());
 fireEvent.click(screen.getByRole('button',{name:'Run research inference'}));
 fireEvent.change(screen.getByLabelText('Research reference month'),{target:{value:'2026-10'}});
 await act(async()=>{resolve({ok:true,json:async()=>output});});
 expect(screen.queryByTestId('research-inference-result')).toBeNull();
});
test('missing model is unavailable with no prediction fallback',async()=>{
 vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({...cap,available:false})}));
 render(createElement(ResearchInference,{aoiId:'my-thanh',geometry,supported:true}));
 await waitFor(()=>expect(screen.getByRole('status').textContent).toContain('No prediction generated'));
 expect(screen.queryByRole('button',{name:'Run research inference'})).toBeNull();
});
test('scope change removes previously computed research output',async()=>{
 vi.stubGlobal('fetch',vi.fn().mockImplementation((url:string)=>Promise.resolve({ok:true,json:async()=>url.includes('capabilities')?cap:output})));
 const view=render(createElement(ResearchInference,{aoiId:'my-thanh',geometry,supported:true}));
 await waitFor(()=>expect(screen.queryByRole('button',{name:'Run research inference'})).toBeTruthy());
 fireEvent.click(screen.getByRole('button',{name:'Run research inference'}));
 await waitFor(()=>expect(screen.queryByTestId('research-inference-result')).toBeTruthy());
 view.rerender(createElement(ResearchInference,{aoiId:'my-thanh',geometry,supported:false}));
 expect(screen.queryByTestId('research-inference-result')).toBeNull();
});
