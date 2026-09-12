"""Derive cartographic label boxes INSIDE published regions, never HQ locations.
Run with pyproj + shapely. Largest land polygon represents disjoint territories;
full territorial names remain in the dossier. Horizontal text rectangles are
optimized inside each polygon in Web Mercator, matching the map projection.
"""
import json
from pathlib import Path
from shapely.geometry import shape
from shapely.ops import transform, polylabel
from pyproj import Transformer

forward = Transformer.from_crs(4326, 3857, always_xy=True).transform
back = Transformer.from_crs(3857, 4326, always_xy=True).transform
labels = {
 'jammu-kashmir': ['Jammu, Kashmir', '& Ladakh'],
 'punjab': ['Punjab, Haryana', '& Himachal'],
 'delhi': ['Delhi'], 'uttarakhand': ['Uttarakhand'],
 'uttar-pradesh': ['Uttar Pradesh'], 'bihar': ['Bihar &', 'Jharkhand'],
 'west-bengal': ['West Bengal', '& Sikkim'], 'north-east': ['North Eastern', 'Region'],
 'odisha': ['Odisha'], 'mp-cg': ['Madhya Pradesh', '& Chhattisgarh'],
 'rajasthan': ['Rajasthan'], 'gujarat': ['Gujarat', '& DNH / DD'],
 'maharashtra': ['Maharashtra'], 'karnataka-goa': ['Karnataka', '& Goa'],
 'telangana': ['Andhra Pradesh', '& Telangana'],
 'tamil-nadu': ['Tamil Nadu', 'Puducherry / A&N'],
 'kerala': ['Kerala &', 'Lakshadweep'],
}
data = json.loads(Path('public/geography/india-ncc-regions.geojson').read_text())
result = []
for f in data['features']:
    org = f['properties'].get('organizationId')
    if not org:
        continue
    geom = transform(forward, shape(f['geometry']))
    polygon = max(geom.geoms, key=lambda p: p.area) if geom.geom_type == 'MultiPolygon' else geom
    lines = labels[org.removeprefix('in-ncc-')]
    aspect = max(map(len, lines)) * .56 / (len(lines) * 1.3)
    # Optimize a horizontal text rectangle, rather than a square/circle that
    # wastes most of a long region's usable interior.
    from shapely.geometry import box, Point
    x0,y0,x1,y1 = polygon.bounds
    candidates = [polylabel(polygon, tolerance=100), polygon.representative_point()]
    candidates += [Point(x0+(x1-x0)*i/35, y0+(y1-y0)*j/35) for i in range(1,35) for j in range(1,35)]
    best = (0, candidates[0])
    for point in candidates:
        if not polygon.contains(point): continue
        low, high = 0, min(x1-x0, (y1-y0)*aspect)/2
        for _ in range(12):
            half = (low+high)/2
            rect = box(point.x-half,point.y-half/aspect,point.x+half,point.y+half/aspect)
            if polygon.covers(rect): low=half
            else: high=half
        if low>best[0]: best=(low,point)
    half,point=best
    half *= .93
    rect = box(point.x-half,point.y-half/aspect,point.x+half,point.y+half/aspect)
    assert polygon.covers(rect), org
    compact = {
        'jammu-kashmir':['J&K','Ladakh'], 'punjab':['PB/HR/HP'],
        'uttarakhand':['UK'], 'uttar-pradesh':['UP'], 'bihar':['BR/JH'],
        'mp-cg':['MP & CG'], 'north-east':['NER'], 'gujarat':['Gujarat'],
        'karnataka-goa':['KA/GA'], 'telangana':['AP & T'],
        'tamil-nadu':['TN/P/AN'], 'west-bengal':['WB'],
        'kerala':['KL']}.get(org.removeprefix('in-ncc-'),lines)
    compact_aspect = max(map(len, compact)) * .56 / (len(compact) * 1.3)
    low, high = 0, min(x1-x0, (y1-y0)*compact_aspect)/2
    for _ in range(16):
        half = (low+high)/2
        compact_rect = box(point.x-half,point.y-half/compact_aspect,point.x+half,point.y+half/compact_aspect)
        if polygon.covers(compact_rect): low=half
        else: high=half
    half = low * .93
    compact_rect = box(point.x-half,point.y-half/compact_aspect,point.x+half,point.y+half/compact_aspect)
    assert polygon.covers(compact_rect), org
    result.append(dict(organizationId=org, coordinates=back(point.x,point.y),
        bounds=[*back(rect.bounds[0],rect.bounds[1]), *back(rect.bounds[2],rect.bounds[3])],
        compactBounds=[*back(compact_rect.bounds[0],compact_rect.bounds[1]), *back(compact_rect.bounds[2],compact_rect.bounds[3])],
        lines=lines, compactLines=compact))
Path('public/geography/india-ncc-labels.json').write_text(json.dumps(result,indent=2)+'\n')
print(f'{len(result)} label boxes verified inside their own region')
