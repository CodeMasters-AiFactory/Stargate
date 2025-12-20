# Sterling Legal Partners - Contact Page Specification

**Route:** `/contact`  
**Page Type:** Contact  
**Business:** Modern, professional law firm

---

## SEO Configuration

### Page Title
```
Contact Sterling Legal Partners | Book a Consultation in [CITY]
```

### Meta Description (150-165 characters)
```
Contact Sterling Legal Partners in [CITY]. Book a confidential consultation for corporate, family or criminal law matters. Call, email or use our contact form.
```

### H1 (Only One)
```
Contact Sterling Legal Partners
```

### H2 Headings
- "Get in Touch"
- "Request a Consultation"
- "Office Location" (if applicable)
- "Quick Questions"

---

## Section 1: Intro

### H1
```
Contact Sterling Legal Partners
```

### Supporting Text
```
We're here to help. Whether you need corporate legal advice, family law support, or criminal defense representation, our team is ready to discuss your situation confidentially. Contact us using any method below, and we'll respond promptly.
```

---

## Section 2: Contact Options

### H2
```
Get in Touch
```

### Contact Information Display

#### Phone
- **Label:** "Phone"
- **Number:** `[PHONE NUMBER]` (placeholder, e.g., `+27 12 345 6789`)
- **Link:** `tel:+27123456789`
- **Button:** "Call Now" (opens phone dialer)
- **Hours Note:** "Available during office hours: Monday-Friday, 8:00 AM - 5:00 PM"

#### Email
- **Label:** "Email"
- **Address:** `info@sterlinglegalpartners.co.za` (or placeholder)
- **Link:** `mailto:info@sterlinglegalpartners.co.za`
- **Button:** "Email Us" (opens email client)
- **Response Note:** "We aim to respond within 24 hours"

#### Address
- **Label:** "Office Address"
- **Address:**
  ```
  [STREET ADDRESS]
  [SUBURB/AREA]
  [CITY], [POSTAL CODE]
  [REGION]
  ```
- **Button:** "Get Directions" (links to Google Maps or similar)

#### Office Hours
- **Label:** "Office Hours"
- **Hours:**
  ```
  Monday - Friday: 8:00 AM - 5:00 PM
  Saturday: By appointment
  Sunday: Closed
  ```
- **Note:** "Emergency consultations available for urgent criminal matters"

---

## Section 3: Contact Form

### H2
```
Request a Consultation
```

### Form Introduction
```
Fill out the form below with a few details about your matter, and our team will contact you to arrange a confidential consultation. All information is kept strictly confidential.
```

### Form Fields (with labels and validation)

#### Field 1: Name
- **Type:** Text input
- **Label:** "Full Name *"
- **Required:** Yes
- **Placeholder:** "John Smith"
- **Validation:** Required, min 2 characters

#### Field 2: Email
- **Type:** Email input
- **Label:** "Email Address *"
- **Required:** Yes
- **Placeholder:** "john@example.com"
- **Validation:** Required, valid email format

#### Field 3: Phone
- **Type:** Tel input
- **Label:** "Phone Number *"
- **Required:** Yes
- **Placeholder:** "+27 12 345 6789"
- **Validation:** Required, valid phone format

#### Field 4: Type of Matter
- **Type:** Dropdown/Select
- **Label:** "Type of Matter *"
- **Required:** Yes
- **Options:**
  - "Corporate Law"
  - "Family Law"
  - "Criminal Defense"
  - "Other"
- **Default:** "Select a matter type"

#### Field 5: Preferred Contact Method
- **Type:** Radio buttons
- **Label:** "Preferred Contact Method"
- **Required:** No
- **Options:**
  - "Phone"
  - "Email"
  - "Either"

#### Field 6: Message
- **Type:** Textarea
- **Label:** "Brief Description of Your Matter"
- **Required:** No (but recommended)
- **Placeholder:** "Please provide a brief description of your legal matter. This helps us prepare for our consultation."
- **Rows:** 4-6
- **Max Length:** 500 characters
- **Note:** "You don't need to provide detailed information here – we'll discuss everything in detail during your consultation."

#### Field 7: Consent Checkbox
- **Type:** Checkbox
- **Label:** "I understand that submitting this form does not create an attorney-client relationship until confirmed by Sterling Legal Partners. *"
- **Required:** Yes
- **Validation:** Must be checked to submit

#### Field 8: Privacy Consent (Optional)
- **Type:** Checkbox
- **Label:** "I consent to Sterling Legal Partners contacting me about my enquiry and storing my information in accordance with their Privacy Policy."
- **Required:** No
- **Link:** Link to Privacy Policy

### Submit Button
- **Text:** "Send Request"
- **Type:** Submit
- **Style:** Primary button, large, prominent
- **Loading State:** Show spinner/loading text while submitting
- **Success Message:** "Thank you! We've received your request and will contact you within 24 hours."

### Form Validation
- Client-side validation before submission
- Clear error messages for each field
- Prevent submission if required fields missing or invalid
- Show success message after successful submission

---

## Section 4: Map / Location (If Applicable)

### H2
```
Office Location
```

### Map Display
- **Type:** Embedded Google Maps or static map image
- **Address:** Same as contact address above
- **Placeholder:** If no actual address, use placeholder map or skip this section
- **Alternative:** Static map image with address overlay

### Directions Note
```
We're located in [SUBURB/AREA], [CITY]. Parking is available on-site. Public transport: [NEAREST STATION/BUS STOP] is a [X]-minute walk away.
```

---

## Section 5: FAQ Short

### H2
```
Quick Questions
```

### 3-4 Quick FAQs

#### Q1: How quickly will you respond?
**A:** "We aim to respond to all enquiries within 24 hours during business days. For urgent criminal matters, we can often respond within a few hours."

#### Q2: What should I bring to my first consultation?
**A:** "Bring any relevant documents (contracts, court papers, correspondence), a timeline of events, and a list of questions. We'll guide you on what's most relevant for your specific matter."

#### Q3: Is the consultation confidential?
**A:** "Yes, absolutely. All consultations are strictly confidential, whether you proceed with our services or not. We maintain the highest standards of client confidentiality."

#### Q4: What happens after I submit the contact form?
**A:** "We'll review your enquiry and contact you via your preferred method (phone or email) within 24 hours to arrange a consultation. We'll discuss your situation, explain how we can help, and answer any questions you have."

---

## Section 6: Emergency Contact (Optional)

### Heading
```
Urgent Criminal Matters
```

### Text
```
If you have an urgent criminal matter requiring immediate attention (e.g., arrest, bail application), please call our emergency line: [EMERGENCY PHONE NUMBER]
```

### Note
```
This line is monitored for urgent criminal matters only. For non-urgent matters, please use our main contact number or contact form.
```

---

## Footer

### Reuse Global Footer
- Same footer as Home page
- Include all navigation links
- Contact information
- Copyright

---

## Technical Requirements

### Form Functionality
- Form submission to backend endpoint
- Email notification to firm
- Confirmation email to client (optional)
- Form data validation (client and server-side)
- Spam protection (CAPTCHA or similar)

### Accessibility
- All form fields properly labeled
- Error messages associated with fields
- Keyboard navigation support
- Screen reader compatible

### SEO
- Schema markup: `ContactPoint`, `LocalBusiness`
- Structured data for address and contact info

### Performance
- Fast form submission
- Clear loading states
- Success/error feedback

---

## Implementation Notes

- Use React form components or HTML form with proper validation
- Integrate with backend API for form submission
- Store form submissions securely
- Consider GDPR/privacy compliance for data storage
- Test all contact methods (phone, email, form)
- Ensure map integration works (if applicable)

---

**Last Updated:** January 2025

