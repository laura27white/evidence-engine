import{j as r}from"./jsx-runtime-8P-18mTY.js";import{r as F}from"./index-Cs7sjTYM.js";import{c as e}from"./colour-BqQ11GRZ.js";import{s as l}from"./space-CWkbJhBg.js";import{f as u,s as c}from"./style-utils-D7J2RQEk.js";import{C as R,a as V}from"./circle-x-DjfZ0wvp.js";import{T as N}from"./triangle-alert-x0dyDXZc.js";import"./_commonjsHelpers-BosuxZz1.js";import"./typography-BMmGoFaS.js";import"./createLucideIcon-C8F4jsE7.js";const z={safe:{border:`${e.severity.safe}60`,background:e.severity.safeSoft,text:e.severity.safe,Icon:V,label:"Safe"},warning:{border:`${e.severity.warning}60`,background:e.severity.warningSoft,text:e.severity.warning,Icon:N,label:"Warning"},critical:{border:`${e.severity.critical}60`,background:e.severity.criticalSoft,text:e.severity.critical,Icon:R,label:"Critical"}},a=F.forwardRef(function({level:C,value:p,label:$,style:k,...W},L){const{border:T,background:q,text:n,Icon:A,label:E}=z[C],d=$??E;return r.jsxs("span",{ref:L,role:"status","aria-label":`${d}: ${p}`,style:{display:"inline-flex",alignItems:"center",gap:l.scale[2],padding:`${l.scale[1]} ${l.scale[3]}`,borderRadius:l.radius.full,border:`1px solid ${T}`,background:q,color:n,fontFamily:u.body,...c("bodySmall"),...k},...W,children:[r.jsx(A,{size:14,"aria-hidden":!0}),r.jsx("span",{style:{fontFamily:u.mono,...c("monoSmall"),color:n},children:p}),r.jsx("span",{style:{...c("label"),color:n},children:d})]})});try{a.displayName="SeverityIndicator",a.__docgenInfo={description:"",displayName:"SeverityIndicator",props:{level:{defaultValue:null,description:"",name:"level",required:!0,type:{name:"enum",value:[{value:'"safe"'},{value:'"warning"'},{value:'"critical"'}]}},value:{defaultValue:null,description:'The short data value, e.g. "+0.8pp" or "42%".',name:"value",required:!0,type:{name:"string"}},label:{defaultValue:null,description:"Human-readable label for screen readers.",name:"label",required:!1,type:{name:"string"}}}}}catch{}const Q={title:"Components/SeverityIndicator",component:a,tags:["autodocs"],args:{level:"safe",value:"+0.2pp"},argTypes:{level:{control:{type:"select"},options:["safe","warning","critical"]}}},t={},s={args:{level:"warning",value:"+0.8pp"}},o={args:{level:"critical",value:"-1.4pp"}},i={render:()=>r.jsxs("div",{style:{display:"flex",gap:12,flexWrap:"wrap"},children:[r.jsx(a,{level:"safe",value:"+0.2pp"}),r.jsx(a,{level:"warning",value:"+0.8pp"}),r.jsx(a,{level:"critical",value:"-1.4pp"})]})};var m,v,f;t.parameters={...t.parameters,docs:{...(m=t.parameters)==null?void 0:m.docs,source:{originalSource:"{}",...(f=(v=t.parameters)==null?void 0:v.docs)==null?void 0:f.source}}};var g,y,b;s.parameters={...s.parameters,docs:{...(g=s.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    level: 'warning',
    value: '+0.8pp'
  }
}`,...(b=(y=s.parameters)==null?void 0:y.docs)==null?void 0:b.source}}};var x,S,I;o.parameters={...o.parameters,docs:{...(x=o.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    level: 'critical',
    value: '-1.4pp'
  }
}`,...(I=(S=o.parameters)==null?void 0:S.docs)==null?void 0:I.source}}};var w,j,_;i.parameters={...i.parameters,docs:{...(w=i.parameters)==null?void 0:w.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap'
  }}>\r
      <SeverityIndicator level="safe" value="+0.2pp" />\r
      <SeverityIndicator level="warning" value="+0.8pp" />\r
      <SeverityIndicator level="critical" value="-1.4pp" />\r
    </div>
}`,...(_=(j=i.parameters)==null?void 0:j.docs)==null?void 0:_.source}}};const U=["Safe","Warning","Critical","AllLevels"];export{i as AllLevels,o as Critical,t as Safe,s as Warning,U as __namedExportsOrder,Q as default};
