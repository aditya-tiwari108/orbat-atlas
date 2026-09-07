"""Editable geography for design review, not an application renderer."""
import json,math,pathlib
from shapely.geometry import shape,box
from shapely.ops import transform,unary_union
from pyproj import Transformer
india=shape(json.load(open('public/geography/india-soi-overview.geojson'))['features'][0]['geometry'])
world=json.load(open('/tmp/orbat-audit/world.geojson'))
# Lambert projection supplied by SOI, recentered for the review canvas.
prj=pathlib.Path('/tmp/orbat-audit/soi/Outline_of_India.prj').read_text();tr=Transformer.from_crs('EPSG:4326',prj,always_xy=True)
center=tr.transform(80,23);scale=.000215

def xy(lon,lat):
 x,y=tr.transform(lon,lat);return [round(720+(x-center[0])*scale,1),round(465-(y-center[1])*scale,1)]
def ring(coords):return 'M'+' L'.join(','.join(map(str,xy(p[0],p[1]))) for p in coords)+' Z'
def path(g):
 g=g.simplify(.045,preserve_topology=True)
 if g.is_empty:return ''
 if g.geom_type=='Polygon':return ring(g.exterior.coords)+' '+ ' '.join(ring(a.coords) for a in g.interiors)
 return ' '.join(path(x) for x in g.geoms if x.geom_type in ['Polygon','MultiPolygon'])
parts=['<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="900" viewBox="0 0 1440 900">','<rect width="1440" height="900" fill="#111719"/>']
for f in world['features']:
 if f['properties'].get('ADMIN')=='India':continue
 g=shape(f['geometry'])
 if not g.intersects(box(50,-10,120,50)):continue
 g=g.intersection(box(45,-15,125,55)).difference(india.buffer(.04))
 if not g.is_empty:parts.append(f'<path d="{path(g)}" fill="#1b2224" stroke="#323b3d" stroke-width=".6"/>')
parts.append(f'<path d="{path(india)}" fill="#282e2e" stroke="#8b8c7e" stroke-width="1.1" fill-rule="evenodd"/>')
parts.append('</svg>');pathlib.Path('design/assets/india-context.svg').write_text('\n'.join(parts))
coords={name:xy(lon,lat) for name,lon,lat in [('northern',75.14,32.92),('western',76.89,30.73),('south-western',75.79,26.91),('central',80.95,26.85),('eastern',88.36,22.57),('southern',73.86,18.52),('XII',73.02,26.24),('XXI',77.41,23.26),('mumbai',72.88,19.08),('vizag',83.22,17.69),('kochi',76.27,9.93),('anc',92.74,11.67),('kerala',76.94,8.52),('kollam',76.61,8.89),('ernakulam',76.3,9.98),('kottayam',76.52,9.59),('kozhikode',75.78,11.26)]}
pathlib.Path('design/assets/map-positions.json').write_text(json.dumps(coords,indent=2));print(coords)
