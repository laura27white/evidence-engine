import{j as e}from"./jsx-runtime-8P-18mTY.js";import{C as d}from"./Card-fyFLBeAa.js";import{T as r}from"./Text-BruaoZw1.js";import"./index-Cs7sjTYM.js";import"./_commonjsHelpers-BosuxZz1.js";import"./colour-BqQ11GRZ.js";import"./space-CWkbJhBg.js";import"./style-utils-D7J2RQEk.js";import"./typography-BMmGoFaS.js";const A={title:"Components/Card",component:d,tags:["autodocs"],args:{variant:"default",padding:"md"},argTypes:{variant:{control:{type:"select"},options:["default","elevated","outlined","flush"]},padding:{control:{type:"select"},options:["none","sm","md","lg"]}}},a={args:{children:e.jsxs("div",{children:[e.jsx(r,{variant:"label",tone:"accent",children:"Assumption A046"}),e.jsx(r,{variant:"displaySmall",as:"h3",children:"Inflation within forecast band"}),e.jsx(r,{variant:"body",children:"Current CPI 2.6 percent, tolerance 40 percent, drift score 0.05."})]})}},t={args:{variant:"elevated",children:e.jsx(r,{children:"Elevated cards carry a soft shadow; used on hover or to draw focus."})}},n={args:{variant:"outlined",children:e.jsx(r,{children:"Outlined cards remove the paper tint; used when the surface sits on a white page."})}},s={render:()=>e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:16},children:[e.jsx(d,{variant:"default",children:e.jsx(r,{children:"Default"})}),e.jsx(d,{variant:"elevated",children:e.jsx(r,{children:"Elevated"})}),e.jsx(d,{variant:"outlined",children:e.jsx(r,{children:"Outlined"})})]})};var i,o,l;a.parameters={...a.parameters,docs:{...(i=a.parameters)==null?void 0:i.docs,source:{originalSource:`{
  args: {
    children: <div>\r
        <Text variant="label" tone="accent">Assumption A046</Text>\r
        <Text variant="displaySmall" as="h3">Inflation within forecast band</Text>\r
        <Text variant="body">Current CPI 2.6 percent, tolerance 40 percent, drift score 0.05.</Text>\r
      </div>
  }
}`,...(l=(o=a.parameters)==null?void 0:o.docs)==null?void 0:l.source}}};var c,p,u;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    variant: 'elevated',
    children: <Text>Elevated cards carry a soft shadow; used on hover or to draw focus.</Text>
  }
}`,...(u=(p=t.parameters)==null?void 0:p.docs)==null?void 0:u.source}}};var m,v,h;n.parameters={...n.parameters,docs:{...(m=n.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    variant: 'outlined',
    children: <Text>Outlined cards remove the paper tint; used when the surface sits on a white page.</Text>
  }
}`,...(h=(v=n.parameters)==null?void 0:v.docs)==null?void 0:h.source}}};var x,f,g;s.parameters={...s.parameters,docs:{...(x=s.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16
  }}>\r
      <Card variant="default"><Text>Default</Text></Card>\r
      <Card variant="elevated"><Text>Elevated</Text></Card>\r
      <Card variant="outlined"><Text>Outlined</Text></Card>\r
    </div>
}`,...(g=(f=s.parameters)==null?void 0:f.docs)==null?void 0:g.source}}};const D=["Default","Elevated","Outlined","Grid"];export{a as Default,t as Elevated,s as Grid,n as Outlined,D as __namedExportsOrder,A as default};
