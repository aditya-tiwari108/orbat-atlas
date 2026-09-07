"""Portable editable SVG review boards. These are design artifacts, not the app UI."""
from pathlib import Path
from html import escape
import base64,json,re
from PIL import Image
OUT=Path('design/review');OUT.mkdir(exist_ok=True)
MAP=Path('design/assets/india-context.svg').read_text();MAP=re.sub(r'^<svg[^>]*>|</svg>$','',MAP.strip())
P={'bg':'#111719','panel':'#181f22','raised':'#242e31','line':'#3b4546','text':'#edece6','muted':'#a6b0ad','subtle':'#75827f','army':'#cbbd91','navy':'#95bdc9','ncc':'#b9add1'}
S=[];seq=0

def add(s):S.append(s)
def rect(x,y,w,h,fill='panel',r=0,stroke=None):add(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{P.get(fill,fill)}"'+(f' stroke="{P.get(stroke,stroke)}"' if stroke else '')+'/>')
def text(x,y,t,size=14,color='text',font='IBM Plex Sans',weight=400,spacing=None):
 for i,l in enumerate(t.split('\n')):add(f'<text x="{x}" y="{y+i*size*1.35}" font-family="{font}" font-size="{size}" font-weight="{weight}" fill="{P.get(color,color)}"'+(f' letter-spacing="{spacing}"' if spacing else '')+f'>{escape(l)}</text>')
def meta(x,y,t,color='muted'):text(x,y,t,11,color,'IBM Plex Mono')
def line(x,y,x2,y2,color='line',dash=None):add(f'<path d="M{x},{y} L{x2},{y2}" stroke="{P.get(color,color)}" fill="none"'+(f' stroke-dasharray="{dash}"' if dash else '')+'/>')
def icon(n,x,y,size=18):
 s=Path('design/assets/icon-'+n+'.svg').read_text();s=re.sub(r'<svg[^>]*>',f'<svg x="{x}" y="{y}" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="#a6b0ad" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">',s);add(s)
def button(x,y,w,label,ic=None,active=False):
 rect(x,y,w,44,'raised' if active else 'panel',5,'army' if active else 'line');off=14
 if ic:icon(ic,x+14,y+13);off=40
 text(x+off,y+27,label,13,'text' if active else 'muted')
def photograph(x,y,w,h,path,fx=.5,fy=.5):
 global seq
 seq+=1;im=Image.open(path);iw,ih=im.size;k=max(w/iw,h/ih)*2.4;ix=max(x+w-iw*k,min(x,x+w/2-iw*k*fx));iy=max(y+h-ih*k,min(y,y+h/2-ih*k*fy));b=base64.b64encode(Path(path).read_bytes()).decode();add(f'<defs><clipPath id="photo{seq}"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="4"/></clipPath></defs><image x="{ix}" y="{iy}" width="{iw*k}" height="{ih*k}" href="data:image/jpeg;base64,{b}" clip-path="url(#photo{seq})"/>')
def symbol(name,x,y,scale=.8):
 s=Path('design/assets/'+name+'.svg').read_text();add(f'<g transform="translate({x} {y}) scale({scale})">{s}</g>')
def hq(x,y,label,color='army',side='right'):
 add(f'<circle cx="{x}" cy="{y}" r="5" fill="{P["bg"]}" stroke="{P[color]}" stroke-width="1.5"/><circle cx="{x}" cy="{y}" r="1.5" fill="{P[color]}"/>');meta(x+12 if side=='right' else x-120,y+4,'HQ · '+label,color)
def start(w=1440,h=900,transform=None):
 global S,seq
 S=[];seq=0;add(f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><title>ORBAT Atlas — proposed design, not approved</title>');rect(0,0,w,h,'bg');add(f'<g transform="{transform or "translate(0 0)"}">{MAP}</g>')
def end(name):add('</svg>');(OUT/(name+'.svg')).write_text(''.join(S))
def chrome(service='Army',title='Command atlas',sub='Select a command to explore',selected=False):
 rect(0,0,1440,90,'#111719');line(28,88,1412,88,'#283234');text(28,55,'ORBAT',27,'text','Barlow Condensed',500,1);text(100,55,'ATLAS',27,'army','Barlow Condensed',500,1);line(186,34,186,60);meta(207,52,'INDIA');icon('ChevronDown',252,39,16)
 rect(539,24,362,50,'panel',6,'line');x=543
 for n,w in [('Army',76),('Navy',76),('Air Force',112),('NCC',90)]:
  if n==service:rect(x,28,w,42,'raised',4);rect(x+12,68,w-24,2,{'Navy':'navy','NCC':'ncc'}.get(service,'army'))
  text(x+18,54,n,13,'text' if n==service else 'muted',weight=500);x+=w
 button(1112,28,300,'Search organizations','Search');meta(1369,55,'⌘ K')
 if title:
  meta(32,142,{'Army':'INDIAN ARMY','Navy':'INDIAN NAVY','NCC':'NATIONAL CADET CORPS'}.get(service,'INDIAN AIR FORCE'),{'Navy':'navy','NCC':'ncc'}.get(service,'army'));text(32,180,title,27,weight=500);text(32,208,sub,13,'muted')
 bx=956 if selected else 1364
 for i,ic in enumerate(['Plus','Minus','LocateFixed']):rect(bx,662+i*48,44,44,'panel',5,'line');icon(ic,bx+13,675+i*48)
 button(28,806,135,'Hierarchy','ListTree');button(171,806,105,'Layers','Layers');meta(28,880,'Survey of India · Natural Earth');meta(1132,880,'Sources & map key  ↗');meta(bx+12,139,'N ↑')
 if not selected:text(346,655,'ARABIAN\nSEA',17,'subtle','IBM Plex Mono',spacing=3);text(854,680,'BAY OF\nBENGAL',17,'subtle','IBM Plex Mono',spacing=3)
def region(name,x,y,city,px,py,color='army'):
 text(x,y,name.upper(),30,color,'Barlow Condensed',500,1.2);hq(px,py,city,color)
def dossier(title,eyebrow='COMMAND',color='army'):
 rect(1032,108,380,742,'#080e10',8);rect(1024,100,388,750,'panel',7,'line');meta(1048,130,eyebrow,color);icon('X',1368,114);text(1048,175,title,28,weight=500);line(1048,218 if '\n' in title else 195,1388,218 if '\n' in title else 195)
def detailrow(y,main,small,tag=None):
 line(1048,y-18,1388,y-18);text(1048,y+4,main,15,weight=500);text(1048,y+26,small,12,'muted');icon('ChevronRight',1366,y-1)
 if tag:meta(1270,y+25,tag,'army')
# National overview
start();chrome();region('Northern',554,206,'Udhampur',623,231);region('Western',632,319,'Chandimandir',657,283,'#x' if False else 'army');region('South Western',533,429,'Jaipur',632,372);region('Central',742,352,'Lucknow',740,375);region('Eastern',884,446,'Kolkata',901,470);region('Southern',638,642,'Pune',583,567)
meta(923,221,'CHINA','subtle');meta(390,245,'PAKISTAN','subtle');meta(730,827,'SRI LANKA','subtle');button(28,742,315,'Training command   ·   Shimla','ArrowUpRight');end('01-army-national')
# Selected Southern command
start(transform='translate(-290 -140) scale(1.3)');chrome(title='Southern Command',sub='Army  /  Commands',selected=True);button(32,239,144,'All commands','ArrowLeft');region('Southern Command',396,647,'Pune',468,597)
for name,x,y,city in [('XII Corps',455,362,'Jodhpur'),('XXI Corps',573,456,'Bhopal')]:symbol('corps-hq',x,y);text(x+49,y+28,name,19,'army','Barlow Condensed',500);meta(x+49,y+49,city)
dossier('Southern Command');photograph(1048,218,112,140,'public/portraits/portrait-in-army-southern.jpg',.465,.47);meta(1180,236,'GOC-IN-C','army');text(1180,263,'Lt Gen\nRajesh Pushkar',18,weight=500);text(1180,331,'Since 01 Jul 2026',12,'muted');meta(1048,380,'HEADQUARTERS');text(1048,406,'Pune, Maharashtra',18,weight=500);text(1048,431,'City-level reference',12,'muted');line(1048,452,1388,452);meta(1048,482,'SUBORDINATE CORPS');detailrow(521,'XII Corps','Konark · Jodhpur');detailrow(589,'XXI Corps','Sudarshan · Bhopal');text(1048,661,'Reported public hierarchy',12,'muted');line(1048,686,1388,686);text(1048,715,'About the command',14);icon('ChevronDown',1368,701);line(1048,738,1388,738);text(1048,770,'Sources & image credits',14);icon('ChevronDown',1368,757);meta(1048,827,'MINISTRY OF DEFENCE / PIB');end('02-army-command')
# Selected corps and unmapped divisions
start(transform='translate(-390 -100) scale(1.4)');chrome(title='XII Corps',sub='Army  /  Southern Command  /  XII Corps',selected=True);button(32,240,195,'Southern Command','ArrowLeft');symbol('corps-hq',360,353,1.1);text(418,398,'XII CORPS',31,'army','Barlow Condensed',500);hq(376,442,'Jodhpur');line(430,420,570,420,'army','4 5');line(570,330,570,542,'line');line(570,330,618,330);line(570,542,618,542)
for y,n,nick in [(285,'11 Infantry Division','Golden Katar'),(497,'12 Infantry Division','Battle Axe')]:
 rect(618,y,322,125,'panel',5,'line');symbol('division-infantry',636,y+20,.65);text(690,y+47,n,17,weight=500);text(690,y+70,nick,13,'muted');meta(638,y+105,'TREE ONLY · HQ NOT MAPPED');icon('ChevronRight',906,y+42)
meta(618,252,'ORGANIZATION TREE','army');text(618,677,'Reported relationships · not a live order of battle',12,'muted');dossier('XII Corps','CORPS HEADQUARTERS');symbol('corps-hq',1048,216,1.0);text(1117,248,'Konark Corps',23,'army','Barlow Condensed',500);meta(1048,319,'HEADQUARTERS');text(1048,345,'Jodhpur, Rajasthan',18,weight=500);meta(1048,405,'PARENT COMMAND');detailrow(446,'Southern Command','Pune');meta(1048,526,'DIVISIONS');text(1048,557,'Select a division in the connected tree.',14);text(1048,585,'No headquarters location is asserted\nfor these formations.',13,'muted');line(1048,648,1388,648);text(1048,680,'Relationship evidence',14);text(1048,706,'Public reference · corroboration pending',12,'muted');line(1048,744,1388,744);text(1048,778,'Sources & symbol key',14);icon('ChevronDown',1368,765);end('03-corps-tree')
# Navy organizational assets; ANC explicit tri-service
start(transform='translate(-215 -30) scale(1.04)');chrome('Navy','Naval organization','Commands, fleets and organizational assets',True);region('Western Naval',316,528,'Mumbai',369,545,'navy');region('Eastern Naval',657,552,'Visakhapatnam',609,582,'navy');hq(442,773,'Kochi','navy');text(700,657,'ANDAMAN & NICOBAR',23,'navy','Barlow Condensed',500);meta(700,684,'TRI-SERVICE COMMAND','navy');hq(845,717,'Sri Vijaya Puram','navy','left');button(28,742,335,'Southern Naval   ·   Training command','ArrowUpRight');dossier('Western Naval\nCommand','NAVAL COMMAND','navy');photograph(1048,238,112,130,'public/portraits/portrait-in-navy-western.jpg',.53,.46);meta(1180,253,'FOC-IN-C','navy');text(1180,278,'Vice Admiral\nSanjay Vatsayan',17,weight=500);text(1180,342,'Since 30 May 2026',12,'muted');meta(1048,401,'HEADQUARTERS');text(1048,428,'Mumbai, Maharashtra',18,weight=500);detailrow(482,'Western Fleet','Organizational assets');text(1064,542,'INS Vikramaditya',14);text(1064,575,'INS Vikrant',14);line(1050,522,1050,579);line(1050,538,1059,538);line(1050,570,1059,570);text(1048,618,'Ship locations are not shown.',13,'muted');line(1048,653,1388,653);text(1048,682,'Fleet association evidence',14);text(1048,708,'Public reference · dated snapshot',12,'muted');line(1048,744,1388,744);text(1048,778,'Sources & image credits',14);icon('ChevronDown',1368,764);end('04-navy')
# NCC: directorate-group-unit navigation, explicit missing portrait
start(transform='translate(-840 -1250) scale(2.25)');chrome('NCC','Kerala & Lakshadweep','NCC  /  Directorates',True);button(32,240,163,'All directorates','ArrowLeft');text(307,366,'KERALA',40,'ncc','Barlow Condensed',500,2);text(205,550,'LAKSHADWEEP',20,'ncc','Barlow Condensed',500,1);meta(240,575,'SAME DIRECTORATE','muted')
for city,x,y in [('Kozhikode',557,415),('Ernakulam',582,484),('Kottayam',593,506),('Kollam',597,544),('Thiruvananthapuram',614,564)]:hq(x,y,city,'ncc')
rect(410,644,500,106,'panel',5,'line');meta(431,671,'KOTTAYAM GROUP','ncc');text(431,701,'5 Kerala Naval Unit NCC',16,weight=500);text(431,726,'Group → Unit · organizational record',12,'muted');line(593,521,593,644,'ncc','4 5');dossier('Kerala &\nLakshadweep','NCC DIRECTORATE','ncc');rect(1048,242,94,108,'raised',4);text(1065,286,'Portrait',13,'muted');text(1057,308,'unavailable',12,'muted');meta(1162,253,'ADDITIONAL DG','ncc');text(1162,282,'Maj Gen Arun CG',18,weight=500);text(1162,311,'Official profile checked',12,'muted');text(1162,330,'06 Sep 2026',12,'muted');meta(1048,390,'HEADQUARTERS');text(1048,417,'Thiruvananthapuram',18,weight=500);meta(1048,466,'GROUP HEADQUARTERS');
for i,city in enumerate(['Thiruvananthapuram','Kollam','Kottayam','Ernakulam','Kozhikode']):text(1048,500+i*42,city,14);icon('ChevronRight',1368,486+i*42)
line(1048,717,1388,717);text(1048,752,'Sources & portrait availability',14);icon('ChevronDown',1368,738);text(1048,806,'Separate AP / Jharkhand directorates:\napproved; operational details pending.',12,'muted');end('05-ncc')
# Mobile overview / selected bottom sheet
for selected in [False,True]:
 start(390,844,'translate(-460 -250) scale(1.05)' if selected else 'translate(-190 190) scale(.5)');rect(0,0,390,126,'bg');text(18,37,'ORBAT ATLAS',24,'text','Barlow Condensed',500,1);meta(260,32,'INDIA');icon('Search',350,17,22);rect(14,58,362,49,'panel',5,'line');x=18
 for n,w in [('Army',76),('Navy',76),('Air Force',112),('NCC',90)]:
  if n=='Army':rect(x,62,w,41,'raised',4);rect(x+12,99,w-24,2,'army')
  text(x+18,88,n,13,'text' if n=='Army' else 'muted');x+=w
 meta(18,151,'INDIAN ARMY','army');text(18,179,'Commands',24,weight=500)
 for n,x,y in ([('SOUTHERN COMMAND',90,323)] if selected else [('NORTHERN',89,288),('WESTERN',138,352),('SOUTH WESTERN',65,406),('CENTRAL',209,385),('EASTERN',256,452),('SOUTHERN',119,529)]):text(x,y,n,18 if selected else 16,'army','Barlow Condensed',500,.7)
 if not selected:
  button(18,709,296,'Training command  ·  Shimla','ArrowUpRight');button(18,769,145,'Hierarchy','ListTree');rect(329,769,44,44,'panel',5,'line');icon('Layers',342,782);meta(18,835,'Survey of India · Map key')
 else:
  rect(0,398,390,446,'panel',14,'line');rect(175,409,40,4,'subtle',2);meta(20,444,'SOUTHERN COMMAND','army');icon('X',351,427);text(20,481,'Southern Command',25,weight=500);photograph(20,504,80,100,'public/portraits/portrait-in-army-southern.jpg',.465,.47);meta(118,519,'GOC-IN-C','army');text(118,545,'Lt Gen Rajesh Pushkar',17,weight=500);text(118,570,'Since 01 Jul 2026 · PIB',12,'muted');line(20,626,370,626);meta(20,651,'HEADQUARTERS');text(163,652,'Pune, Maharashtra',14);line(20,671,370,671);text(20,705,'XII Corps',16,weight=500);text(20,728,'Konark · Jodhpur',12,'muted');icon('ChevronRight',347,697);line(20,744,370,744);text(20,777,'XXI Corps',16,weight=500);text(20,800,'Sudarshan · Bhopal',12,'muted');icon('ChevronRight',347,769);rect(132,831,126,4,'muted',2)
 end('07-mobile-selected' if selected else '06-mobile-overview')
print('Created 7 portable review boards')
