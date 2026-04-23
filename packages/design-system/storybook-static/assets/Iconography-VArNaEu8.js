import{j as e}from"./jsx-runtime-8P-18mTY.js";import{useMDXComponents as r}from"./index-BI1Biiay.js";import{ae as o}from"./index-MjUdIxYF.js";import"./index-Cs7sjTYM.js";import"./_commonjsHelpers-BosuxZz1.js";import"./iframe-C_ep2vNQ.js";import"../sb-preview/runtime.js";import"./index-HvzzuEoN.js";import"./index-Bhy8GSeK.js";import"./index-DrFu-skq.js";function s(i){const n={code:"code",h1:"h1",h2:"h2",li:"li",p:"p",strong:"strong",ul:"ul",...r(),...i.components};return e.jsxs(e.Fragment,{children:[e.jsx(o,{title:"Foundations/Iconography/Principles"}),`
`,e.jsx(n.h1,{id:"iconography",children:"Iconography"}),`
`,e.jsx(n.p,{children:"Icons are semantic, not decorative. Every icon exists because it adds meaning the surrounding text cannot carry alone."}),`
`,e.jsx(n.h2,{id:"rules",children:"Rules"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Pair with a label."})," An icon without a text label is only acceptable when the immediate surroundings make its meaning unambiguous (e.g. a trend arrow next to a large number). Otherwise, the icon needs a visible label or a descriptive ",e.jsx(n.code,{children:"aria-label"}),"."]}),`
`,e.jsxs(n.li,{children:[e.jsxs(n.strong,{children:["Decorative icons are marked ",e.jsx(n.code,{children:"aria-hidden"}),"."]})," If the text around the icon already conveys the meaning, the icon is decorative and should be hidden from the accessibility tree."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"No emoji."})," The brand voice is editorial, not chatty. Icons are stroked line art from the Lucide catalogue."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Stroke and fill."})," We use stroked line icons at 1.75px weight. No filled shapes. This ties the icon set visually to the typographic weight of the body font."]}),`
`]}),`
`,e.jsx(n.h2,{id:"where-icons-come-from",children:"Where icons come from"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Lucide React"})," is the default catalogue. Import from ",e.jsx(n.code,{children:"@tp/design-system"})," rather than ",e.jsx(n.code,{children:"lucide-react"})," directly so we can swap upstream or apply wrappers in one place."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Two domain icons"})," live in ",e.jsx(n.code,{children:"src/icons/"}),":",`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"DriftArrowIcon"})," is a double-stroke arrow used next to drift values. It is visually sturdier at small sizes than Lucide's plain arrow."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"CascadeNodeIcon"})," is a one-to-two glyph used by the Cascade view legend."]}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(n.h2,{id:"forbidden-patterns",children:"Forbidden patterns"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Colour-only meaning. Every severity colour is paired with an icon and a label."}),`
`,e.jsxs(n.li,{children:["Icon-only buttons without ",e.jsx(n.code,{children:"aria-label"}),"."]}),`
`,e.jsx(n.li,{children:'Icons used decoratively at the start of a heading "for warmth".'}),`
`,e.jsx(n.li,{children:"Custom icons that duplicate a Lucide icon's meaning."}),`
`]})]})}function p(i={}){const{wrapper:n}={...r(),...i.components};return n?e.jsx(n,{...i,children:e.jsx(s,{...i})}):s(i)}export{p as default};
