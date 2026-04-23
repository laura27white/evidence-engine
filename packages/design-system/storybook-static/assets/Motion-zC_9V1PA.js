import{j as e}from"./jsx-runtime-8P-18mTY.js";import{useMDXComponents as r}from"./index-BI1Biiay.js";import{ae as t}from"./index-MjUdIxYF.js";import"./index-Cs7sjTYM.js";import"./_commonjsHelpers-BosuxZz1.js";import"./iframe-C_ep2vNQ.js";import"../sb-preview/runtime.js";import"./index-HvzzuEoN.js";import"./index-Bhy8GSeK.js";import"./index-DrFu-skq.js";function s(i){const n={code:"code",h1:"h1",h2:"h2",li:"li",p:"p",strong:"strong",ul:"ul",...r(),...i.components};return e.jsxs(e.Fragment,{children:[e.jsx(t,{title:"Foundations/Motion/Principles"}),`
`,e.jsx(n.h1,{id:"motion",children:"Motion"}),`
`,e.jsx(n.p,{children:"Restrained. Editorial. Never decorative. Motion earns its place by making a change legible or by reducing layout jolt, not by decorating."}),`
`,e.jsx(n.h2,{id:"primitives",children:"Primitives"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:e.jsx(n.code,{children:"StaggerFade"})})," — a staggered opacity fade used to bring a list of cards into view. 80ms delay per item, 180ms per-item duration. Under ",e.jsx(n.code,{children:"prefers-reduced-motion"}),", children render at opacity 1 with zero delay."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:e.jsx(n.code,{children:"ChartTransition"})})," — a 250ms ease-out crossfade used when a chart swaps between states (filter changed, series changed). Takes a ",e.jsx(n.code,{children:"transitionKey"}),"; changing it drives the crossfade."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:e.jsx(n.code,{children:"PageTransition"})})," — a 200ms ease-out opacity crossfade applied on route changes so pages do not hard-swap."]}),`
`]}),`
`,e.jsx(n.h2,{id:"rules",children:"Rules"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Duration."})," Nothing longer than 300ms for UI transitions. Anything longer is a loading state, not a transition."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Easing."})," ",e.jsx(n.code,{children:"easeOut"})," by default. No bouncy springs; no anticipation."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Opacity, not movement."})," Prefer opacity transitions to y-axis slides. Slides are jarring on long documents."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Reduced motion."})," All three primitives honour the ",e.jsx(n.code,{children:"(prefers-reduced-motion: reduce)"})," media query via the ",e.jsx(n.code,{children:"useReducedMotion()"})," hook."]}),`
`]}),`
`,e.jsx(n.h2,{id:"example-patterns",children:"Example patterns"}),`
`,e.jsxs(n.p,{children:["The Horizon view animates assumption cards in with ",e.jsx(n.code,{children:"StaggerFade"})," on initial load, then relies on ",e.jsx(n.code,{children:"ChartTransition"})," for filter changes. Route changes between Horizon, Cascade, Trace, and Brief use ",e.jsx(n.code,{children:"PageTransition"})," so the change is perceptible without being theatrical."]})]})}function j(i={}){const{wrapper:n}={...r(),...i.components};return n?e.jsx(n,{...i,children:e.jsx(s,{...i})}):s(i)}export{j as default};
