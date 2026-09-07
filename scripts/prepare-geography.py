"""Prepare a generalized, attributed SOI outline. Run with pyshp, pyproj, shapely installed.
Input: downloaded official Outline_of_India shapefile; never reconstruct borders from HQ points.
"""
import sys,json,math,pathlib
import shapefile
from pyproj import Transformer
from shapely.geometry import shape,mapping
from shapely.ops import transform,unary_union
src=pathlib.Path(sys.argv[1]); out=pathlib.Path('public/geography');out.mkdir(exist_ok=True)
r=shapefile.Reader(str(src/'Outline_of_India.shp'))
t=Transformer.from_crs((src/'Outline_of_India.prj').read_text(),'EPSG:4326',always_xy=True)
geoms=[transform(t.transform,shape(s.__geo_interface__)) for s in r.shapes()]
g=unary_union(geoms).simplify(.012,preserve_topology=True)
fc={'type':'FeatureCollection','features':[{'type':'Feature','properties':{'name':'India','source':'Survey of India','sourceUrl':'https://surveyofindia.gov.in/pages/outline-maps-of-india','downloadUrl':'https://surveyofindia.gov.in/documents/Outline_of_India.zip','sourceScale':'1:16,000,000','use':'Generalized national overview, not local boundary precision','checkedAt':'2026-09-06'},'geometry':mapping(g)}]}
(out/'india-soi-overview.geojson').write_text(json.dumps(fc,separators=(',',':')))
print(g.geom_type,g.bounds,len(r.shapes()))
