# Shared React Components Extraction

## Components to Extract

### 1. Card
Glass-morphism container. Replaces ~40 inline `rounded-2xl border border-amber-200/40 bg-white/60 backdrop-blur-sm p-6` uses.

Props: `children`, `className?`, `padding?: 'none' | 'default'`

### 2. StatCard
Metric card with comparison arrow. Currently duplicated in Dashboard + Analytics.

Props: `label: string`, `value: string | number`, `previousValue?: number`, `invertColor?: boolean`

### 3. Badge
Color-coded pill. Replaces ~30 inline badge instances.

Variants: `amber`, `rose`, `emerald`, `violet`, `sky`, `indigo`, `gray`

Props: `variant: BadgeVariant`, `children`, `className?`

### 4. Alert
Success/error notification. Replaces 6+ identical blocks across TextCheck, WritingPrompts/Show, Practice.

Variants: `error`, `success`

Props: `variant: AlertVariant`, `children`, `className?`

### 5. TabSelector
Segmented control. Used in Analytics (RangeSelector) + WritingPrompts/Index.

Props: `options: { label: string; value: string }[]`, `value: string`, `onChange: (value: string) => void`

### 6. Textarea
Styled textarea matching TextInput pattern. Used in TextCheck, WritingPrompts/Show, Practice.

Props: standard textarea HTML attributes + `className?`

## Pages to Update

- Dashboard.tsx — Card, StatCard
- Analytics.tsx — Card, StatCard, TabSelector
- TextCheck.tsx — Card, Alert, Textarea
- WritingPrompts/Index.tsx — Card, TabSelector
- WritingPrompts/Show.tsx — Card, Alert, Badge, Textarea
- ErrorHistory.tsx — Card, Badge
- Practice.tsx — Card, Alert, Badge, Textarea
