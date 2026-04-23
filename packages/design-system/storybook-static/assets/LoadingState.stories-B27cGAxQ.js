import{j as t}from"./jsx-runtime-8P-18mTY.js";import{r as k}from"./index-Cs7sjTYM.js";import{c as e}from"./colour-BqQ11GRZ.js";import{s}from"./space-CWkbJhBg.js";import"./_commonjsHelpers-BosuxZz1.js";const i=k.forwardRef(function({rows:n=3,rowHeight:x="14px",label:y="Loading",style:S,..._},R){return t.jsxs("div",{ref:R,role:"status","aria-live":"polite","aria-label":y,style:{display:"flex",flexDirection:"column",gap:s.scale[3],padding:s.scale[4],...S},..._,children:[Array.from({length:n}).map((v,d)=>t.jsx("div",{"aria-hidden":!0,style:{height:x,width:d===n-1?"70%":"100%",borderRadius:s.radius.sm,background:`linear-gradient(90deg, ${e.line.hairline} 0%, ${e.paper.creamElevated} 50%, ${e.line.hairline} 100%)`,backgroundSize:"200% 100%",animation:"tp-shimmer 1.6s infinite linear"}},d)),t.jsx("style",{children:`
          @keyframes tp-shimmer {
            0%   { background-position: 100% 0; }
            100% { background-position: -100% 0; }
          }
          @media (prefers-reduced-motion: reduce) {
            [data-tp-skeleton="reduced"] {
              animation: none !important;
              background: ${e.line.hairline} !important;
            }
          }
        `})]})});try{i.displayName="LoadingState",i.__docgenInfo={description:"",displayName:"LoadingState",props:{rows:{defaultValue:{value:"3"},description:"Number of skeleton rows. Defaults to 3.",name:"rows",required:!1,type:{name:"number"}},rowHeight:{defaultValue:{value:"14px"},description:"Row height; CSS length. Defaults to 14px.",name:"rowHeight",required:!1,type:{name:"string"}},label:{defaultValue:{value:"Loading"},description:"Accessible label read when content is loading.",name:"label",required:!1,type:{name:"string"}}}}}catch{}const $={title:"Components/LoadingState",component:i,tags:["autodocs"],args:{rows:4}},r={},a={args:{rows:1}},o={args:{rowHeight:"28px",rows:6}};var l,c,p;r.parameters={...r.parameters,docs:{...(l=r.parameters)==null?void 0:l.docs,source:{originalSource:"{}",...(p=(c=r.parameters)==null?void 0:c.docs)==null?void 0:p.source}}};var m,u,g;a.parameters={...a.parameters,docs:{...(m=a.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    rows: 1
  }
}`,...(g=(u=a.parameters)==null?void 0:u.docs)==null?void 0:g.source}}};var h,f,w;o.parameters={...o.parameters,docs:{...(h=o.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    rowHeight: '28px',
    rows: 6
  }
}`,...(w=(f=o.parameters)==null?void 0:f.docs)==null?void 0:w.source}}};const q=["FourRows","OneRow","MatchingATableRowHeight"];export{r as FourRows,o as MatchingATableRowHeight,a as OneRow,q as __namedExportsOrder,$ as default};
