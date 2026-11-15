import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as maplibregl from 'maplibre-gl';
import type { Geometry } from '../../core/contracts';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';
maplibregl.setWorkerUrl(workerUrl);
export function FieldContextMap({geometry}:{geometry:Geometry}) {
  const host=useRef<HTMLDivElement>(null),[error,setError]=useState(false),[retry,setRetry]=useState(0);
  const {i18n}=useTranslation(),vi=i18n.language.startsWith('vi'),m=(en:string,vn:string)=>vi?vn:en;
  useEffect(()=>{
    if(!host.current)return;
    const c=new AbortController();let map:maplibregl.Map|undefined;
    setError(false);
    fetch('/imagery/context/sentinel-manifest.json',{signal:c.signal}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(meta=>{
      if(c.signal.aborted)return;
      map=new maplibregl.Map({container:host.current!,center:[106.021621,10.479098],zoom:17,pitch:0,bearing:0,
        style:{version:8,sources:{satellite:{type:'image',url:'/imagery/context/my-thanh-sentinel-false-colour.png',coordinates:meta.coordinates},
          field:{type:'geojson',data:geometry}},layers:[{id:'background',type:'background',paint:{'background-color':'#dce3d9'}},
          {id:'historical-satellite',type:'raster',source:'satellite',paint:{'raster-resampling':'nearest','raster-fade-duration':0}},
          {id:'research-boundary',type:'line',source:'field',paint:{'line-color':'#fff6b0','line-width':3}}]},attributionControl:{compact:false,customAttribution:meta.attribution}});
      map.addControl(new maplibregl.NavigationControl({showCompass:false}),'top-right');
      const bounds=new maplibregl.LngLatBounds();meta.coordinates.forEach((p:[number,number])=>bounds.extend(p));map.fitBounds(bounds,{padding:24,duration:0});
      map.on('error',()=>setError(true));
    }).catch(()=>{if(!c.signal.aborted)setError(true);});
    return()=>{c.abort();map?.remove();};
  },[geometry,retry]);
  return <section className="field-context"><h2>{m('Locate the study block','Nhận diện vùng nghiên cứu')}</h2><div className="field-context-map" ref={host} role="region" aria-label={m('Historical Sentinel-2 imagery and research boundary','Ảnh Sentinel-2 lịch sử và ranh nghiên cứu')}/>
    {error&&<p role="alert">{m('Imagery unavailable. The study geometry remains unverified.','Không tải được ảnh. Ranh nghiên cứu vẫn chưa được khảo sát xác nhận.')} <button onClick={()=>setRetry(n=>n+1)}>{m('Retry imagery','Tải lại ảnh')}</button></p>}
    <p>{m('Sentinel-2 · 04 Jan 2025 · 10 m pixels · false colour (NIR/red/green). Yellow: digitised research boundary, ≈2 ha.','Sentinel-2 · 04/01/2025 · pixel 10 m · màu giả (cận hồng ngoại/đỏ/xanh lục). Vàng: ranh nghiên cứu digitized, ≈2 ha.')}</p>
    <small>{m('Historical image, not live. Red tones do not identify a crop, soil condition or current water status. This image is separate from NASA climate evidence.','Ảnh lịch sử, không phải live. Màu đỏ không xác định cây, đất hoặc tình trạng nước hiện tại. Ảnh này tách biệt bằng chứng khí hậu NASA.')} <a href="/imagery/context/sentinel-manifest.json">{m('Image source and QA','Nguồn ảnh và QA')}</a></small>
  </section>;
}
