"""Build the static WebGL fallback from the checked-in Natural Earth geometry."""
import json, math
from pathlib import Path
geo = json.loads(Path('public/geography/pakistan-natural-earth.geojson').read_text())
def project(p):
    return p[0], math.degrees(math.log(math.tan(math.pi / 4 + math.radians(p[1]) / 2)))
rings = []
for feature in geo['features']:
    geom = feature['geometry']
    polygons = geom['coordinates'] if geom['type'] == 'MultiPolygon' else [geom['coordinates']]
    rings.extend(projected for polygon in polygons for ring in polygon if (projected := [project(p) for p in ring]))
xs = [p[0] for r in rings for p in r]; ys = [p[1] for r in rings for p in r]
x0,x1,y0,y1=min(xs),max(xs),min(ys),max(ys)
scale = min(900/(x1-x0),700/(y1-y0))
path = ' '.join('M'+' L'.join(f'{50+(x-x0)*scale:.2f},{50+(y1-y)*scale:.2f}' for x,y in ring)+' Z' for ring in rings)
Path('public/geography/pakistan-context.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 800"><title>Pakistan: Natural Earth de facto outline</title><path d="{path}" fill="#253034" stroke="#80877e" stroke-width="1.5" fill-rule="evenodd"/></svg>\n')
