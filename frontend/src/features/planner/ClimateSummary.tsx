import { useTranslation } from 'react-i18next';
import type { AnalysisRun } from '../analysis/contracts';
import type { Inputs } from './model';
export function ClimateSummary({run,input}:{run:AnalysisRun;input:Inputs}){
 const {i18n}=useTranslation(),vi=i18n.language.startsWith('vi'),m=(en:string,vn:string)=>vi?vn:en,fmt=new Intl.NumberFormat(vi?'vi':'en',{maximumFractionDigits:1});
 const wanted=new Set<number>();
 if(input.start&&input.end){const start=new Date(input.start+'-01T00:00:00Z'),end=new Date(input.end+'-01T00:00:00Z');for(let n=0;n<12&&start<=end;n++){wanted.add(start.getUTCMonth()+1);start.setUTCMonth(start.getUTCMonth()+1);}}
 if(!wanted.size)for(let n=1;n<=12;n++)wanted.add(n);
 const rows=run.climate.filter(r=>wanted.has(Number(r.date.slice(5,7)))&&r.qa!=='fail'&&r.coverage===1);
 const rain=rows.map(r=>r.rain).filter((v):v is number=>v!==null),temp=rows.map(r=>r.temp).filter((v):v is number=>v!==null);
 const range=(values:number[])=>values.length?`${fmt.format(Math.min(...values))}–${fmt.format(Math.max(...values))}`:m('Unavailable','Chưa có dữ liệu');
 return <section className="plan-climate-summary" id="plan-climate-summary"><div><h3>{m('Conditions to compare against','Điều kiện để đối chiếu')}</h3><p>{input.start&&input.end?m(`Historical ${input.year} climate for the calendar months in your planned window.`,`Khí hậu năm ${input.year}, xét các tháng tương ứng khoảng vụ bạn chọn.`):m(`Historical climate in ${input.year}. Set a planned window to narrow the comparison.`,`Khí hậu lịch sử năm ${input.year}. Chọn khoảng vụ để xem sát thời điểm hơn.`)}</p><small>NASA POWER · {m('regional estimates, not a forecast','ước lượng vùng, không phải dự báo')}</small></div><dl><div><dt>{m('Monthly rainfall','Mưa theo tháng')}</dt><dd>{range(rain)} <small>mm/{m('month','tháng')}</small></dd></div><div><dt>{m('Monthly mean temperature','Nhiệt độ TB tháng')}</dt><dd>{range(temp)} <small>°C</small></dd></div></dl><small>{m('Complete months','Tháng đầy đủ')}: {rows.length}/{wanted.size}</small></section>;
}
