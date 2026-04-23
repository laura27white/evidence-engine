import{j as e}from"./jsx-runtime-8P-18mTY.js";import{r as p}from"./index-Cs7sjTYM.js";import{c as t}from"./colour-BqQ11GRZ.js";import"./_commonjsHelpers-BosuxZz1.js";const k={default:{fill:t.paper.creamElevated,text:t.ink.primary},accent:{fill:t.accent.tealMuted,text:t.accent.tealDeep},safe:{fill:t.severity.safeSoft,text:t.severity.safe},warning:{fill:t.severity.warningSoft,text:t.severity.warning},critical:{fill:t.severity.criticalSoft,text:t.severity.critical}},r=p.forwardRef(function({x:n,y:a,width:o,height:l,label:c,tone:y="default",...s},m){const g=k[y];return e.jsxs("g",{ref:m,...s,children:[e.jsx("rect",{x:n,y:a,width:o,height:l,rx:4,fill:g.fill,stroke:t.line.regular,strokeWidth:1}),e.jsx("text",{x:n+o/2,y:a+l/2,fill:g.text,fontSize:12,fontFamily:"var(--font-body), system-ui, sans-serif",textAnchor:"middle",dominantBaseline:"middle",children:c})]})}),w={default:`${t.ink.tertiary}80`,warning:`${t.severity.warning}90`,critical:`${t.severity.critical}A0`},i=p.forwardRef(function({source:n,target:a,strokeWidth:o=2,tone:l="default",...c},y){const s=(n.x+a.x)/2,m=`M ${n.x} ${n.y} C ${s} ${n.y}, ${s} ${a.y}, ${a.x} ${a.y}`;return e.jsx("path",{ref:y,d:m,fill:"none",stroke:w[l],strokeWidth:o,strokeLinecap:"round",...c})});try{r.displayName="SankeyNode",r.__docgenInfo={description:"",displayName:"SankeyNode",props:{x:{defaultValue:null,description:"",name:"x",required:!0,type:{name:"number"}},y:{defaultValue:null,description:"",name:"y",required:!0,type:{name:"number"}},width:{defaultValue:null,description:"",name:"width",required:!0,type:{name:"number"}},height:{defaultValue:null,description:"",name:"height",required:!0,type:{name:"number"}},label:{defaultValue:null,description:"",name:"label",required:!0,type:{name:"string"}},tone:{defaultValue:{value:"default"},description:"",name:"tone",required:!1,type:{name:"enum",value:[{value:'"accent"'},{value:'"safe"'},{value:'"warning"'},{value:'"critical"'},{value:'"default"'}]}}}}}catch{}try{i.displayName="SankeyEdge",i.__docgenInfo={description:"",displayName:"SankeyEdge",props:{source:{defaultValue:null,description:"Source point {x, y} in SVG space.",name:"source",required:!0,type:{name:"{ x: number; y: number; }"}},target:{defaultValue:null,description:"Target point {x, y} in SVG space.",name:"target",required:!0,type:{name:"{ x: number; y: number; }"}},strokeWidth:{defaultValue:{value:"2"},description:"Thickness at the source and target. Typically derived from propagation weight.",name:"strokeWidth",required:!1,type:{name:"number"}},tone:{defaultValue:{value:"default"},description:"Visual tone of the edge; usually mirrors the downstream node's severity.",name:"tone",required:!1,type:{name:"enum",value:[{value:'"warning"'},{value:'"critical"'},{value:'"default"'}]}}}}}catch{}const j={title:"Components/Sankey"},d={render:()=>e.jsxs("svg",{width:720,height:280,role:"img","aria-label":"A046 Inflation cascades into five downstream assumptions.",children:[e.jsx(r,{x:40,y:110,width:160,height:60,label:"A046 Inflation",tone:"accent"}),e.jsx(r,{x:520,y:20,width:160,height:40,label:"A011 Funding",tone:"warning"}),e.jsx(r,{x:520,y:80,width:160,height:40,label:"A025 Resourcing",tone:"warning"}),e.jsx(r,{x:520,y:140,width:160,height:40,label:"A028 Budget",tone:"critical"}),e.jsx(r,{x:520,y:200,width:160,height:40,label:"A043 Fit-out",tone:"default"}),e.jsx(i,{source:{x:200,y:140},target:{x:520,y:40},strokeWidth:5,tone:"warning"}),e.jsx(i,{source:{x:200,y:140},target:{x:520,y:100},strokeWidth:4,tone:"warning"}),e.jsx(i,{source:{x:200,y:140},target:{x:520,y:160},strokeWidth:6,tone:"critical"}),e.jsx(i,{source:{x:200,y:140},target:{x:520,y:220},strokeWidth:3})]})};var x,f,h;d.parameters={...d.parameters,docs:{...(x=d.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: () => <svg width={720} height={280} role="img" aria-label="A046 Inflation cascades into five downstream assumptions.">\r
      <SankeyNode x={40} y={110} width={160} height={60} label="A046 Inflation" tone="accent" />\r
      <SankeyNode x={520} y={20} width={160} height={40} label="A011 Funding" tone="warning" />\r
      <SankeyNode x={520} y={80} width={160} height={40} label="A025 Resourcing" tone="warning" />\r
      <SankeyNode x={520} y={140} width={160} height={40} label="A028 Budget" tone="critical" />\r
      <SankeyNode x={520} y={200} width={160} height={40} label="A043 Fit-out" tone="default" />\r
      <SankeyEdge source={{
      x: 200,
      y: 140
    }} target={{
      x: 520,
      y: 40
    }} strokeWidth={5} tone="warning" />\r
      <SankeyEdge source={{
      x: 200,
      y: 140
    }} target={{
      x: 520,
      y: 100
    }} strokeWidth={4} tone="warning" />\r
      <SankeyEdge source={{
      x: 200,
      y: 140
    }} target={{
      x: 520,
      y: 160
    }} strokeWidth={6} tone="critical" />\r
      <SankeyEdge source={{
      x: 200,
      y: 140
    }} target={{
      x: 520,
      y: 220
    }} strokeWidth={3} />\r
    </svg>
}`,...(h=(f=d.parameters)==null?void 0:f.docs)==null?void 0:h.source}}};const A=["Primitive"];export{d as Primitive,A as __namedExportsOrder,j as default};
