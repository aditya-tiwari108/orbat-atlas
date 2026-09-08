"""Build NCC administrative regions from the official SOI ABDB state shapefile.
Usage: python scripts/prepare-ncc-regions.py path/to/State-Boundary-directory
Requires pyshp, pyproj and shapely. State remit is separately reviewed in the mapping.
Disputed interstate polygons in SOI are retained as neutral/unassigned.
"""
import sys,json,pathlib
import shapefile
from pyproj import Transformer
from shapely.geometry import shape,mapping,Point
from shapely.ops import unary_union,transform
from shapely import make_valid
root=pathlib.Path(sys.argv[1]);out=pathlib.Path('public/geography');data=pathlib.Path('data/india.json')
remit={
'in-ncc-telangana':['ANDHRA PRADESH','TELANGANA'],
'in-ncc-bihar':['BIHAR','JHARKHAND'],
'in-ncc-delhi':['DELHI'],
'in-ncc-gujarat':['GUJARAT','DADRA & NAGAR HAVELI & DAMAN & DIU'],
'in-ncc-jammu-kashmir':['JAMMU AND KASHMIR','LADAKH'],
'in-ncc-karnataka-goa':['KARNATAKA','GOA'],
'in-ncc-kerala':['KERALA','LAKSHADWEEP'],
'in-ncc-mp-cg':['MADHYA PRADESH','CHHATTISGARH'],
'in-ncc-maharashtra':['MAHARASHTRA'],
'in-ncc-north-east':['ARUNACHAL PRADESH','ASSAM','MANIPUR','MEGHALAYA','MIZORAM','NAGALAND','TRIPURA'],
'in-ncc-odisha':['ODISHA'],
'in-ncc-punjab':['PUNJAB','HARYANA','HIMACHAL PRADESH','CHANDIGARH'],
'in-ncc-rajasthan':['RAJASTHAN'],
'in-ncc-tamil-nadu':['TAMIL NADU','PUDUCHERRY','ANDAMAN & NICOBAR'],
'in-ncc-uttarakhand':['UTTARAKHAND'],
'in-ncc-uttar-pradesh':['UTTAR PRADESH'],
'in-ncc-west-bengal':['WEST BENGAL','SIKKIM'],
}
r=shapefile.Reader(str(root/'State Boundary.shp'))
t=Transformer.from_crs((root/'State Boundary.prj').read_text(),'EPSG:4326',always_xy=True)
states={sr.record['STATE']:make_valid(shape(sr.shape.__geo_interface__)) for sr in r.iterShapeRecords()}
assert len([s for v in remit.values() for s in v])==36
assert len(set(s for v in remit.values() for s in v))==36
catalog=json.loads(data.read_text());byid={o['id']:o for o in catalog['organizations']}
colors=['#786f8d','#648888','#8a7667','#778567','#6d7d95','#9282a7','#668d82','#858297','#7e829a','#758674','#8d7f94','#6b898e','#94866a','#7b8c9b','#849570','#938579','#8b7590']
features=[]
for i,(oid,names) in enumerate(remit.items()):
 projected=unary_union([states[s] for s in names])
 geom=transform(t.transform,projected.simplify(250,preserve_topology=True))
 org=byid[oid];lat,lng=org['location']['coordinates']
 assert geom.buffer(.02).covers(Point(lng,lat)),(oid,'HQ outside its administrative remit')
 bounds=[round(n,5) for n in geom.bounds]
 features.append(dict(type='Feature',id=oid,properties=dict(organizationId=oid,name=org['name'],states=names,color=colors[i],source='Survey of India ABDB, 2025 edition',generalizationMetres=250),geometry=mapping(geom)))
 org['geographicCoverage']=dict(kind='published-area',sourceIds=['soi-abdb-states-2025','ncc-state-remit'],description='Administrative remit: '+', '.join(s.title() for s in names)+'. State boundaries are generalized for overview display; no group territories are inferred.',geometryPath='/geography/india-ncc-regions.geojson',bounds=bounds,asOf='2026-09-08')
 org.setdefault('evidence',{})['coverage']=dict(status='supported',sourceIds=['soi-abdb-states-2025','ncc-state-remit'],checkedAt='2026-09-08',note='Published directorate state/UT remit joined to separately sourced SOI state geometry. Interstate disputed areas remain unassigned. Newly approved AP/Jharkhand reorganizations are not treated as operational.')
 org['verificationGaps']=[g for g in org.get('verificationGaps',[]) if g!='Geographic coverage is distinct from headquarters location.']
for name,g in states.items():
 if name.startswith('DISPUTED'):
  features.append(dict(type='Feature',properties=dict(name=name,color='#596064',unassigned=True,source='Survey of India ABDB, 2025 edition'),geometry=mapping(transform(t.transform,g.simplify(250,preserve_topology=True)))))
for s in [dict(id='soi-abdb-states-2025',title='State boundaries of India — SOI ABDB 2025 edition; metadata published 6 May 2026',url='https://surveyofindia.gov.in/pages/administrative-boundary-data-base-abdb-',publisher='Survey of India',accessed='2026-09-08',published='2026-05-06',kind='official'),dict(id='ncc-state-remit',title='NCC organization: directorate state and union-territory remit',url='https://bmsce.ac.in/home/About-NCC',publisher='B.M.S. College of Engineering — NCC',accessed='2026-09-08',kind='official')]:
 if not any(x['id']==s['id'] for x in catalog['sources']):catalog['sources'].append(s)
(out/'india-ncc-regions.geojson').write_text(json.dumps(dict(type='FeatureCollection',features=features),separators=(',',':')))
data.write_text(json.dumps(catalog,indent=2,ensure_ascii=False)+'\n')
print(f'{len(remit)} directorate regions; 36 states/UTs; 4 neutral disputed features; {len(features)} total features')
