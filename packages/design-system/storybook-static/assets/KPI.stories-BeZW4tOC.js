import{j as e}from"./jsx-runtime-8P-18mTY.js";import{r as F}from"./index-Cs7sjTYM.js";import{c as a}from"./colour-BqQ11GRZ.js";import{s as p}from"./space-CWkbJhBg.js";import{f as o,s as l}from"./style-utils-D7J2RQEk.js";import{c as N}from"./createLucideIcon-C8F4jsE7.js";import{a as R,A as z}from"./arrow-up-DXSady6f.js";import"./_commonjsHelpers-BosuxZz1.js";import"./typography-BMmGoFaS.js";/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const M=N("Minus",[["path",{d:"M5 12h14",key:"1ays0h"}]]),W={up:z,down:R,flat:M};function Y(i,r){return r==="positive"?a.severity.safe:r==="negative"?a.severity.critical:r==="neutral"?a.ink.tertiary:i==="up"?a.severity.safe:i==="down"?a.severity.critical:a.ink.tertiary}const n=F.forwardRef(function({label:r,value:K,unit:m,trend:t,trendTone:L,confidenceInterval:f,size:S="md",style:q,...A},V){const y=t?W[t]:null,v=t?Y(t,L):void 0;return e.jsxs("div",{ref:V,style:{display:"flex",flexDirection:"column",gap:p.scale[2],...q},...A,children:[e.jsx("span",{style:{...l("label"),fontFamily:o.body,color:a.ink.tertiary},children:r}),e.jsxs("div",{style:{display:"flex",alignItems:"baseline",gap:p.scale[3]},children:[e.jsx("span",{style:{...l(S==="lg"?"displayLarge":"displayMedium"),fontFamily:o.display,color:a.ink.primary},children:K}),m?e.jsx("span",{style:{...l("mono"),fontFamily:o.mono,color:a.ink.tertiary},children:m}):null,y&&v?e.jsx("span",{"aria-label":`Trend ${t}`,style:{display:"inline-flex",alignItems:"center",gap:p.scale[1],color:v,fontFamily:o.mono,...l("monoSmall")},children:e.jsx(y,{size:14,"aria-hidden":!0})}):null]}),f?e.jsx("span",{style:{...l("monoSmall"),fontFamily:o.mono,color:a.ink.tertiary},children:f}):null]})});try{n.displayName="KPI",n.__docgenInfo={description:"",displayName:"KPI",props:{label:{defaultValue:null,description:'Uppercase label above the number (e.g. "Lead time").',name:"label",required:!0,type:{name:"ReactNode"}},value:{defaultValue:null,description:"Primary numeric value; formatted by the caller.",name:"value",required:!0,type:{name:"ReactNode"}},unit:{defaultValue:null,description:'Unit shown in smaller mono type to the right of the value (e.g. "days").',name:"unit",required:!1,type:{name:"ReactNode"}},trend:{defaultValue:null,description:"Trend indicator. Colour follows the semantics: up for good is not inherent, so the caller decides.",name:"trend",required:!1,type:{name:"enum",value:[{value:'"up"'},{value:'"down"'},{value:'"flat"'}]}},trendTone:{defaultValue:null,description:"Override the trend colour. Default: up = safe, down = critical, flat = tertiary ink.",name:"trendTone",required:!1,type:{name:"enum",value:[{value:'"neutral"'},{value:'"positive"'},{value:'"negative"'}]}},confidenceInterval:{defaultValue:null,description:"Optional confidence interval shown in mono beneath.",name:"confidenceInterval",required:!1,type:{name:"ReactNode"}},size:{defaultValue:{value:"md"},description:"Size modifier.",name:"size",required:!1,type:{name:"enum",value:[{value:'"md"'},{value:'"lg"'}]}}}}}catch{}const Q={title:"Components/KPI",component:n,tags:["autodocs"],args:{label:"Lead time",value:"47",unit:"days",trend:"flat"},argTypes:{trend:{control:{type:"select"},options:["up","down","flat"]},size:{control:{type:"select"},options:["md","lg"]}}},s={},d={args:{trend:"down",trendTone:"negative",value:"12",unit:"days"}},u={args:{label:"CPI forecast, 90 day",value:"2.9",unit:"% YoY",trend:"up",trendTone:"negative",confidenceInterval:"CI 90 percent: 2.5 to 3.3"}},c={render:()=>e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:32},children:[e.jsx(n,{label:"Assumptions",value:"47",unit:"total"}),e.jsx(n,{label:"At warning",value:"6",trend:"up",trendTone:"negative"}),e.jsx(n,{label:"Lead time median",value:"39",unit:"days",trend:"down",trendTone:"negative"})]})};var g,h,x;s.parameters={...s.parameters,docs:{...(g=s.parameters)==null?void 0:g.docs,source:{originalSource:"{}",...(x=(h=s.parameters)==null?void 0:h.docs)==null?void 0:x.source}}};var I,T,b;d.parameters={...d.parameters,docs:{...(I=d.parameters)==null?void 0:I.docs,source:{originalSource:`{
  args: {
    trend: 'down',
    trendTone: 'negative',
    value: '12',
    unit: 'days'
  }
}`,...(b=(T=d.parameters)==null?void 0:T.docs)==null?void 0:b.source}}};var w,j,P;u.parameters={...u.parameters,docs:{...(w=u.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    label: 'CPI forecast, 90 day',
    value: '2.9',
    unit: '% YoY',
    trend: 'up',
    trendTone: 'negative',
    confidenceInterval: 'CI 90 percent: 2.5 to 3.3'
  }
}`,...(P=(j=u.parameters)==null?void 0:j.docs)==null?void 0:P.source}}};var C,_,k;c.parameters={...c.parameters,docs:{...(C=c.parameters)==null?void 0:C.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 32
  }}>\r
      <KPI label="Assumptions" value="47" unit="total" />\r
      <KPI label="At warning" value="6" trend="up" trendTone="negative" />\r
      <KPI label="Lead time median" value="39" unit="days" trend="down" trendTone="negative" />\r
    </div>
}`,...(k=(_=c.parameters)==null?void 0:_.docs)==null?void 0:k.source}}};const X=["LeadTime","WithTrend","WithConfidence","Portfolio"];export{s as LeadTime,c as Portfolio,u as WithConfidence,d as WithTrend,X as __namedExportsOrder,Q as default};
