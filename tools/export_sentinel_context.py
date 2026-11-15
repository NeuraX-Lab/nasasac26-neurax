"""Export a provenance-checked Sentinel false-colour visual, never an analytical label."""
import argparse, hashlib, json
from pathlib import Path
import numpy as np
import rasterio
from rasterio.warp import transform
from PIL import Image

parser = argparse.ArgumentParser()
parser.add_argument('--lab', type=Path, required=True)
parser.add_argument('--out', type=Path, required=True)
a = parser.parse_args()
manifest = json.loads((a.lab/'docs/post-review/eo-source-manifest.json').read_text())
scene = next(s for s in manifest['scenes'] if s['date']=='2025-01-04')
folder = a.lab/'runs/post-review/eo-native-02/sentinel'/scene['scene_id']
arrays=[]; sources=[]
for band in ['B08','B04','B03']:
    record=next(x for x in scene['assets'] if x['band']==band)
    p=folder/(band+'.tif')
    assert hashlib.sha256(p.read_bytes()).hexdigest()==record['sha256'], band
    with rasterio.open(p) as ds:
        if arrays: assert ds.transform==grid and ds.shape==shape and ds.crs==crs
        grid,shape,crs=ds.transform,ds.shape,ds.crs
        raw=ds.read(1); arrays.append(np.where(raw!=0,np.clip((raw.astype(float)-1000)/10000/0.5,0,1),0))
        corners=[grid*(0,0),grid*(ds.width,0),grid*(ds.width,ds.height),grid*(0,ds.height)]
    sources.append({k:record[k] for k in ['band','sha256','public_source_locator']})
lon,lat=transform(crs,'EPSG:4326',*[list(v) for v in zip(*corners)])
a.out.mkdir(parents=True,exist_ok=True)
Image.fromarray((np.stack(arrays,axis=-1)*255).astype('uint8')).save(a.out/'my-thanh-sentinel-false-colour.png')
meta=dict(scene_id=scene['scene_id'],date=scene['date'],coordinates=list(map(list,zip(lon,lat))),resolution_m=10,qa_resolution_m=20,
 attribution='Contains modified Copernicus Sentinel data (2025), processed by NeuraX',
 license_url='https://dataspace.copernicus.eu/terms-and-conditions',bands=['B08','B04','B03'],
 display='False colour NIR/red/green; reflectance offset -1000, scale 10000, fixed display clip 0–0.5; not natural colour or crop classification',
 qa=scene['qa_and_features'],sources=sources,
 limitation='Historical 220×210 m crop; mixed pixels; not current conditions, soil test, or proof of crop identity')
(a.out/'sentinel-manifest.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'scene':scene['scene_id'],'shape':shape,'hashes_verified':3,'corners':meta['coordinates']}))
