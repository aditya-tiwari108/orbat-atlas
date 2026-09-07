const created=[];
const fonts=[['IBM Plex Sans','Regular'],['IBM Plex Sans','Medium'],['IBM Plex Sans','SemiBold'],['IBM Plex Mono','Regular'],['Barlow Condensed','Medium'],['Inter','Regular']];
await Promise.all(fonts.map(([family,style])=>figma.loadFontAsync({family,style})));
const vars=(await figma.variables.getLocalVariablesAsync()).filter(v=>v.variableCollectionId==='VariableCollectionId:2:3');
const V=Object.fromEntries(vars.map(v=>[v.name,v]));
const paint=(key)=>figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:0,g:0,b:0}},'color',V[key]);
function track(n){created.push(n.id);return n;}
function label(parent,text,size=14,color='text',family='IBM Plex Sans',style='Regular',width){const n=track(figma.createText());n.name=text.slice(0,64);n.fontName={family,style};n.fontSize=size;n.lineHeight={unit:'PIXELS',value:Math.round(size*1.4)};n.characters=text;n.fills=[paint(color)];parent.appendChild(n);if(width){n.textAutoResize='HEIGHT';n.resize(width,n.height);}return n;}
function stack(parent,name,direction='VERTICAL',gap=12,width){const n=track(figma.createAutoLayout(direction));n.name=name;n.fills=[];n.itemSpacing=gap;if(V['space/'+gap])n.setBoundVariable('itemSpacing',V['space/'+gap]);parent.appendChild(n);if(width){n.resize(width,1);n.layoutSizingHorizontal='FIXED';}n.layoutSizingVertical='HUG';return n;}
function line(parent,width=300){const n=track(figma.createRectangle());n.name='Divider';n.resize(width,1);n.fills=[paint('line')];parent.appendChild(n);return n;}
function box(parent,name,w,h,color='panel'){const n=track(figma.createFrame());n.name=name;n.resize(w,h);n.fills=[paint(color)];parent.appendChild(n);return n;}
function pos(n,x,y){n.x=x;n.y=y;return n;}
function meta(parent,t,color='muted'){return label(parent,t,11,color,'IBM Plex Mono');}
function button(parent,t,active=false,w){const n=stack(parent,'Control / '+t,'HORIZONTAL',8,w);n.paddingLeft=14;n.paddingRight=14;n.paddingTop=12;n.paddingBottom=12;n.cornerRadius=5;n.fills=[paint(active?'raised':'panel')];n.strokes=[paint(active?'army':'line')];n.strokeWeight=1;n.counterAxisAlignItems='CENTER';n.primaryAxisAlignItems='CENTER';label(n,t,13,active?'text':'muted','IBM Plex Sans','Medium');return n;}
function collect(root){return [root.id,...root.findAll(()=>true).map(x=>x.id)];}
