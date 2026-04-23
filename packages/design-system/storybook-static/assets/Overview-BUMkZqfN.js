import{j as e}from"./jsx-runtime-8P-18mTY.js";import{useMDXComponents as r}from"./index-BI1Biiay.js";import{ae as o}from"./index-MjUdIxYF.js";import"./index-Cs7sjTYM.js";import"./_commonjsHelpers-BosuxZz1.js";import"./iframe-C_ep2vNQ.js";import"../sb-preview/runtime.js";import"./index-HvzzuEoN.js";import"./index-Bhy8GSeK.js";import"./index-DrFu-skq.js";function i(s){const n={code:"code",h1:"h1",h2:"h2",li:"li",ol:"ol",p:"p",strong:"strong",ul:"ul",...r(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(o,{title:"Foundations/Overview"}),`
`,e.jsx(n.h1,{id:"design-foundations",children:"Design foundations"}),`
`,e.jsxs(n.p,{children:["The Project Trueplan design system codifies the editorial-intelligence direction committed to in ",e.jsx(n.code,{children:"ARCHITECTURE.md"})," section 6. It is deliberately sparse where other AI dashboards are busy, and typographically confident where others default to system fonts."]}),`
`,e.jsx(n.h2,{id:"principles",children:"Principles"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Editorial, not dashboard."})," Generous negative space. Serif display type sized large. One accent colour. Nothing ornamental."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Readable before pretty."})," Every colour and every contrast ratio is verified; severity is never conveyed by colour alone."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Restrained motion."})," No bouncy springs. No confetti. Animations are short, easeOut, and collapse to nothing under ",e.jsx(n.code,{children:"prefers-reduced-motion"}),"."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Semantic before cosmetic."})," Components render semantic HTML. ARIA is used only where HTML alone is insufficient. Everything is keyboard navigable."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Tokens over constants."})," Every colour, type size, and spacing step comes from a token file. Arbitrary values are banned by Stylelint."]}),`
`]}),`
`,e.jsx(n.h2,{id:"whats-here",children:"What's here"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Tokens/Colour"})," — paper, ink, accent, severity, line."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Tokens/Typography"})," — display serif, body sans, mono for data."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Tokens/Space"})," — 4px base grid plus container and radius scales."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Motion"})," — ",e.jsx(n.code,{children:"StaggerFade"}),", ",e.jsx(n.code,{children:"ChartTransition"}),", ",e.jsx(n.code,{children:"PageTransition"}),"."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Iconography"})," — wrapped Lucide plus two domain icons (",e.jsx(n.code,{children:"DriftArrowIcon"}),", ",e.jsx(n.code,{children:"CascadeNodeIcon"}),")."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Brand"})," — ",e.jsx(n.code,{children:"Wordmark"})," and ",e.jsx(n.code,{children:"Monogram"})," as SVG React components."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Components"})," — sixteen primitives covering data display, layout, and state."]}),`
`]})]})}function g(s={}){const{wrapper:n}={...r(),...s.components};return n?e.jsx(n,{...s,children:e.jsx(i,{...s})}):i(s)}export{g as default};
