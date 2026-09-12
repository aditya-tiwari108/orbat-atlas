import ms from 'milsymbol';
import {writeFileSync} from 'node:fs';
const symbols = {};
for (const level of ['corps', 'division']) for (const type of ['headquarters', 'infantry', 'armor', 'artillery']) {
 const functionId = {headquarters:'U-----', infantry:'UCI---', armor:'UCA---', artillery:'UCF---'}[type];
 const sidc = `SFGP${functionId}A${level === 'corps' ? 'J' : 'I'}---`;
 const symbol = new ms.Symbol(sidc, {size:26, standard:'APP6', monoColor:'#ded7c0', fillColor:'#1d2428', outlineColor:'#12191d', outlineWidth:2});
 symbols[`${level}-${type}`] = {sidc, svg:symbol.asSVG(), anchor:symbol.getAnchor(), size:symbol.getSize()};
}
writeFileSync('data/symbols.json', JSON.stringify(symbols, null, 2)+'\n');
