# Template Transformation Components

## Components

### 1. `TemplateTransformationConfig.tsx`

Configuration screen where users select what to transform.

**Usage:**
```tsx
<TemplateTransformationConfig
  templateName="Horizon Services"
  templateBrand="Horizon Services"
  clientInfo={{
    businessName: "Atlanta Elite HVAC & Air",
    phone: "(404) 555-HEAT",
    email: "info@atlantaelitehvac.com",
    city: "Atlanta"
  }}
  onContinue={(options) => {
    // Start transformation with selected options
    console.log('Selected options:', options);
  }}
  onBack={() => {
    // Go back to template selection
  }}
/>
```

### 2. `TemplateTransformationProgress.tsx`

Progress screen showing real-time transformation progress.

**Usage:**
```tsx
<TemplateTransformationProgress
  options={selectedOptions}
  clientInfo={{
    businessName: "Atlanta Elite HVAC & Air",
    industry: "HVAC",
    city: "Atlanta"
  }}
  onComplete={(result) => {
    // Transformation complete
    console.log('Result:', result);
  }}
  onError={(error) => {
    // Handle error
    console.error('Error:', error);
  }}
/>
```

## Integration Example

```tsx
function TemplateTransformationFlow() {
  const [step, setStep] = useState<'config' | 'progress' | 'complete'>('config');
  const [options, setOptions] = useState<TransformationOptions | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  if (step === 'config') {
    return (
      <TemplateTransformationConfig
        templateName={selectedTemplate.name}
        templateBrand={selectedTemplate.brand}
        clientInfo={clientInfo}
        onContinue={(opts) => {
          setOptions(opts);
          setStep('progress');
        }}
      />
    );
  }

  if (step === 'progress' && options) {
    return (
      <TemplateTransformationProgress
        options={options}
        clientInfo={clientInfo}
        onComplete={(result) => {
          setStep('complete');
        }}
        onError={(error) => {
          // Handle error
        }}
      />
    );
  }

  return <div>Complete!</div>;
}
```

## API Integration

Connect to backend API:

```tsx
// In TemplateTransformationProgress.tsx
const startTransformation = async () => {
  // Call API endpoint
  const response = await fetch('/api/template/transform', {
    method: 'POST',
    body: JSON.stringify({
      templateId: selectedTemplate.id,
      options: options,
      clientInfo: clientInfo,
    }),
  });

  // Stream progress updates
  const reader = response.body?.getReader();
  // Process progress updates...
};
```

