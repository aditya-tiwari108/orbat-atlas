"""China overview: Natural Earth 1:50m, excluding SOI Ladakh/Arunachal overlap.

Inputs: Natural Earth ne_50m_admin_0_countries.geojson and Survey of India
ABDB 2025 State Boundary shapefile (same input as prepare-ncc-regions.py).
Run with the GIS environment documented in docs/china-audit.md.
The mask is a presentation policy, not a claim about effective control.
"""
import json, math
from pathlib import Path
import shapefile
from shapely.geometry import shape, mapping, Point
from shapely.ops import transform, unary_union
from pyproj import CRS, Transformer

root = Path('work/china')
features = json.loads((root / 'ne-countries.geojson').read_text())['features']
china = shape(next(f['geometry'] for f in features if f['properties']['ADMIN'] == 'China'))
state_path = Path('work/ncc-audit/extracted/State Boundary')
reader = shapefile.Reader(str(state_path) + '.shp')
project = Transformer.from_crs(CRS.from_wkt(Path(str(state_path)+'.prj').read_text()), 4326, always_xy=True).transform
mask = unary_union([transform(project, shape(record.shape.__geo_interface__)) for record in reader.iterShapeRecords() if record.record.as_dict()['STATE'] in ('LADAKH', 'ARUNACHAL PRADESH')])
outline = china.difference(mask).simplify(0.015, preserve_topology=True)
for point in [(79,35), (91.87,27.59), (93.62,27.1)]: assert not outline.covers(Point(point)), point
for point in [(116.4,39.9), (91.13,29.65)]: assert outline.covers(Point(point)), point
props = {'name':'China', 'country':'CN', 'source':'Natural Earth 1:50m; Survey of India ABDB 2025', 'policy':'Excludes SOI Ladakh and Arunachal Pradesh overlap; organizations do not imply territorial sovereignty.', 'checkedAt':'2026-09-19'}
geo = {'type':'FeatureCollection','features':[{'type':'Feature','properties':props,'geometry':mapping(outline)}]}
Path('public/geography/china-overview.geojson').write_text(json.dumps(geo, separators=(',',':'))+'\n')
# Same geometry for a WebGL-independent fallback. Center and preserve aspect ratio.
def mercator(p): return p[0], math.degrees(math.log(math.tan(math.pi/4+math.radians(p[1])/2)))
polygons = geo['features'][0]['geometry']['coordinates']
rings = [[mercator(p) for p in ring] for poly in polygons for ring in poly]
xs=[p[0] for r in rings for p in r]; ys=[p[1] for r in rings for p in r]
x0,x1,y0,y1=min(xs),max(xs),min(ys),max(ys)
scale=min(900/(x1-x0),700/(y1-y0));dx=(1000-(x1-x0)*scale)/2;dy=(800-(y1-y0)*scale)/2
path=' '.join('M'+' L'.join(f'{dx+(x-x0)*scale:.2f},{dy+(y1-y)*scale:.2f}' for x,y in ring)+' Z' for ring in rings)
Path('public/geography/china-context.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 800"><title>China overview with configured disputed-area exclusions</title><path d="{path}" fill="#253034" stroke="#80877e" stroke-width="1.5" fill-rule="evenodd"/></svg>\n')
print('China geometry valid:',outline.is_valid, 'area:',round(outline.area,2))
