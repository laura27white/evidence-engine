import{j as e}from"./jsx-runtime-8P-18mTY.js";import{T as t}from"./Timestamp-CYBuZyRp.js";import"./index-Cs7sjTYM.js";import"./_commonjsHelpers-BosuxZz1.js";import"./colour-BqQ11GRZ.js";import"./style-utils-D7J2RQEk.js";import"./typography-BMmGoFaS.js";const v={title:"Components/Timestamp",component:t,tags:["autodocs"],args:{at:new Date(Date.now()-45e3).toISOString(),mode:"relative"},argTypes:{mode:{control:{type:"select"},options:["relative","absolute","both"]}}},a={},o={args:{mode:"absolute"}},r={args:{mode:"both"}},s={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:4},children:[e.jsx(t,{at:new Date(Date.now()-5e3).toISOString()}),e.jsx(t,{at:new Date(Date.now()-9e4).toISOString()}),e.jsx(t,{at:new Date(Date.now()-60*60*1e3).toISOString()}),e.jsx(t,{at:new Date(Date.now()-3*24*60*60*1e3).toISOString()}),e.jsx(t,{at:new Date(Date.now()-90*24*60*60*1e3).toISOString()})]})};var n,i,m;a.parameters={...a.parameters,docs:{...(n=a.parameters)==null?void 0:n.docs,source:{originalSource:"{}",...(m=(i=a.parameters)==null?void 0:i.docs)==null?void 0:m.source}}};var p,c,d;o.parameters={...o.parameters,docs:{...(p=o.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    mode: 'absolute'
  }
}`,...(d=(c=o.parameters)==null?void 0:c.docs)==null?void 0:d.source}}};var l,S,g;r.parameters={...r.parameters,docs:{...(l=r.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {
    mode: 'both'
  }
}`,...(g=(S=r.parameters)==null?void 0:S.docs)==null?void 0:g.source}}};var D,u,w;s.parameters={...s.parameters,docs:{...(D=s.parameters)==null?void 0:D.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 4
  }}>\r
      <Timestamp at={new Date(Date.now() - 5_000).toISOString()} />\r
      <Timestamp at={new Date(Date.now() - 90_000).toISOString()} />\r
      <Timestamp at={new Date(Date.now() - 60 * 60 * 1000).toISOString()} />\r
      <Timestamp at={new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()} />\r
      <Timestamp at={new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()} />\r
    </div>
}`,...(w=(u=s.parameters)==null?void 0:u.docs)==null?void 0:w.source}}};const h=["Relative","Absolute","Both","Variants"];export{o as Absolute,r as Both,a as Relative,s as Variants,h as __namedExportsOrder,v as default};
