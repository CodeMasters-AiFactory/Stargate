/**
 * Industry Intelligence Service
 * Industry-specific widgets, compliance checker, regulatory monitoring
 */

import { getErrorMessage, logError } from '../utils/errorHandler';

export interface ComplianceRequirement {
  industry: string;
  requirement: string;
  description: string;
  required: boolean;
  implementation: string;
}

export interface IndustryWidget {
  id: string;
  name: string;
  industry: string;
  html: string;
  css: string;
  js?: string;
  description: string;
}

/**
 * Industry compliance requirements
 */
const COMPLIANCE_REQUIREMENTS: Record<string, ComplianceRequirement[]> = {
  'Healthcare': [
    {
      industry: 'Healthcare',
      requirement: 'HIPAA Notice',
      description: 'Health Insurance Portability and Accountability Act privacy notice',
      required: true,
      implementation: 'Add HIPAA-compliant privacy policy and patient data protection notice',
    },
    {
      industry: 'Healthcare',
      requirement: 'Patient Privacy',
      description: 'Secure patient information handling',
      required: true,
      implementation: 'Implement SSL encryption and secure forms for patient data',
    },
  ],
  'Legal': [
    {
      industry: 'Legal',
      requirement: 'Attorney Disclaimer',
      description: 'Required disclaimer for legal services',
      required: true,
      implementation: 'Add "Attorney Advertising" disclaimer and state bar association notice',
    },
    {
      industry: 'Legal',
      requirement: 'No Attorney-Client Relationship',
      description: 'Disclaimer that website does not create attorney-client relationship',
      required: true,
      implementation: 'Add clear disclaimer on contact forms and consultation pages',
    },
  ],
  'Finance': [
    {
      industry: 'Finance',
      requirement: 'SEC Compliance',
      description: 'Securities and Exchange Commission disclosures',
      required: true,
      implementation: 'Add required SEC disclosures for financial services',
    },
    {
      industry: 'Finance',
      requirement: 'FDIC Notice',
      description: 'Federal Deposit Insurance Corporation notice (if applicable)',
      required: false,
      implementation: 'Add FDIC notice if offering banking services',
    },
  ],
  'Restaurant': [
    {
      industry: 'Restaurant',
      requirement: 'Health Ratings',
      description: 'Display health department ratings',
      required: false,
      implementation: 'Add health rating widget or badge',
    },
    {
      industry: 'Restaurant',
      requirement: 'Allergen Information',
      description: 'Menu allergen information',
      required: true,
      implementation: 'Add allergen filter to menu and clear allergen labeling',
    },
  ],
};

/**
 * Industry-specific widgets
 */
const INDUSTRY_WIDGETS: Record<string, IndustryWidget[]> = {
  'Restaurant': [
    {
      id: 'reservation-system',
      name: 'Reservation System',
      industry: 'Restaurant',
      html: `
<div class="reservation-widget">
  <h3>Make a Reservation</h3>
  <form id="reservation-form">
    <input type="date" name="date" required>
    <input type="time" name="time" required>
    <input type="number" name="guests" placeholder="Number of guests" min="1" max="20" required>
    <input type="text" name="name" placeholder="Your name" required>
    <input type="tel" name="phone" placeholder="Phone number" required>
    <button type="submit">Reserve Table</button>
  </form>
</div>`,
      css: `
.reservation-widget {
  padding: 2rem;
  background: #f9f9f9;
  border-radius: 8px;
  max-width: 400px;
}
.reservation-widget form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.reservation-widget input,
.reservation-widget button {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.reservation-widget button {
  background: #007bff;
  color: white;
  cursor: pointer;
}
.reservation-widget button:hover {
  background: #0056b3;
}`,
      js: `
// Client-side JavaScript for reservation form
(function() {
  const form = document.getElementById('reservation-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      // Handle reservation submission
      alert('Reservation request submitted!');
    });
  }
})();`,
      description: 'Table reservation booking system',
    },
    {
      id: 'menu-filter',
      name: 'Menu with Dietary Filters',
      industry: 'Restaurant',
      html: `
<div class="menu-widget">
  <div class="menu-filters">
    <button class="filter-btn active" data-filter="all">All</button>
    <button class="filter-btn" data-filter="vegetarian">Vegetarian</button>
    <button class="filter-btn" data-filter="vegan">Vegan</button>
    <button class="filter-btn" data-filter="gluten-free">Gluten-Free</button>
    <button class="filter-btn" data-filter="dairy-free">Dairy-Free</button>
  </div>
  <div class="menu-items">
    <!-- Menu items will be populated here -->
  </div>
</div>`,
      css: `
.menu-filters {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
.filter-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
}
.filter-btn.active {
  background: #007bff;
  color: white;
}
.menu-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}`,
      description: 'Menu with dietary restriction filters',
    },
  ],
  'Healthcare': [
    {
      id: 'appointment-booking',
      name: 'Appointment Booking',
      industry: 'Healthcare',
      html: `
<div class="appointment-widget">
  <h3>Book an Appointment</h3>
  <form id="appointment-form">
    <select name="service" required>
      <option value="">Select service</option>
      <option value="consultation">Consultation</option>
      <option value="checkup">Checkup</option>
      <option value="follow-up">Follow-up</option>
    </select>
    <input type="date" name="date" required>
    <input type="time" name="time" required>
    <input type="text" name="name" placeholder="Patient name" required>
    <input type="tel" name="phone" placeholder="Phone number" required>
    <textarea name="reason" placeholder="Reason for visit" rows="3"></textarea>
    <button type="submit">Book Appointment</button>
  </form>
</div>`,
      css: `
.appointment-widget {
  padding: 2rem;
  background: #f0f8ff;
  border-radius: 8px;
  max-width: 400px;
}
.appointment-widget form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.appointment-widget input,
.appointment-widget select,
.appointment-widget textarea,
.appointment-widget button {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.appointment-widget button {
  background: #28a745;
  color: white;
  cursor: pointer;
}`,
      description: 'HIPAA-compliant appointment booking system',
    },
  ],
  'Legal': [
    {
      id: 'case-evaluation',
      name: 'Case Evaluation Form',
      industry: 'Legal',
      html: `
<div class="case-evaluation-widget">
  <h3>Free Case Evaluation</h3>
  <p class="disclaimer">This form does not create an attorney-client relationship.</p>
  <form id="case-form">
    <input type="text" name="name" placeholder="Your name" required>
    <input type="email" name="email" placeholder="Email" required>
    <input type="tel" name="phone" placeholder="Phone" required>
    <select name="case-type" required>
      <option value="">Select case type</option>
      <option value="personal-injury">Personal Injury</option>
      <option value="family-law">Family Law</option>
      <option value="criminal">Criminal Defense</option>
      <option value="business">Business Law</option>
    </select>
    <textarea name="details" placeholder="Brief description of your case" rows="4" required></textarea>
    <button type="submit">Submit for Evaluation</button>
  </form>
</div>`,
      css: `
.case-evaluation-widget {
  padding: 2rem;
  background: #fff;
  border: 2px solid #007bff;
  border-radius: 8px;
  max-width: 500px;
}
.disclaimer {
  font-size: 0.875rem;
  color: #666;
  font-style: italic;
  margin-bottom: 1rem;
}
.case-evaluation-widget form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.case-evaluation-widget input,
.case-evaluation-widget select,
.case-evaluation-widget textarea,
.case-evaluation-widget button {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.case-evaluation-widget button {
  background: #007bff;
  color: white;
  cursor: pointer;
}`,
      description: 'Secure case evaluation form with legal disclaimers',
    },
  ],
  'Real Estate': [
    {
      id: 'property-search',
      name: 'Property Search',
      industry: 'Real Estate',
      html: `
<div class="property-search-widget">
  <h3>Find Your Dream Home</h3>
  <form id="property-search-form">
    <input type="text" name="location" placeholder="City, State, or ZIP" required>
    <select name="property-type">
      <option value="">All Types</option>
      <option value="house">House</option>
      <option value="condo">Condo</option>
      <option value="apartment">Apartment</option>
    </select>
    <input type="number" name="min-price" placeholder="Min Price">
    <input type="number" name="max-price" placeholder="Max Price">
    <input type="number" name="bedrooms" placeholder="Bedrooms" min="0">
    <input type="number" name="bathrooms" placeholder="Bathrooms" min="0">
    <button type="submit">Search Properties</button>
  </form>
</div>`,
      css: `
.property-search-widget {
  padding: 2rem;
  background: #f9f9f9;
  border-radius: 8px;
  max-width: 500px;
}
.property-search-widget form {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}
.property-search-widget input,
.property-search-widget select,
.property-search-widget button {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.property-search-widget button {
  grid-column: 1 / -1;
  background: #dc3545;
  color: white;
  cursor: pointer;
}`,
      description: 'Property search widget with filters',
    },
  ],
};

/**
 * Get compliance requirements for industry
 */
export function getComplianceRequirements(industry: string): ComplianceRequirement[] {
  return COMPLIANCE_REQUIREMENTS[industry] || [];
}

/**
 * Get industry widgets
 */
export function getIndustryWidgets(industry: string): IndustryWidget[] {
  return INDUSTRY_WIDGETS[industry] || [];
}

/**
 * Check compliance for a website
 */
export function checkCompliance(
  html: string,
  industry: string
): {
  requirements: ComplianceRequirement[];
  compliance: Array<{
    requirement: string;
    met: boolean;
    found: string[];
  }>;
  score: number;
} {
  const requirements = getComplianceRequirements(industry);
  const compliance = requirements.map(req => {
    // Simple keyword-based compliance check
    const htmlLower = html.toLowerCase();
    let met = false;
    const found: string[] = [];

    if (req.requirement.includes('HIPAA')) {
      met = htmlLower.includes('hipaa') || htmlLower.includes('privacy policy');
      if (met) found.push('HIPAA notice found');
    } else if (req.requirement.includes('Disclaimer')) {
      met = htmlLower.includes('disclaimer') || htmlLower.includes('attorney advertising');
      if (met) found.push('Disclaimer found');
    } else if (req.requirement.includes('Allergen')) {
      met = htmlLower.includes('allergen') || htmlLower.includes('dietary');
      if (met) found.push('Allergen information found');
    } else {
      // Generic check
      met = htmlLower.includes(req.requirement.toLowerCase());
      if (met) found.push(`${req.requirement} found`);
    }

    return {
      requirement: req.requirement,
      met,
      found,
    };
  });

  const metCount = compliance.filter(c => c.met).length;
  const score = requirements.length > 0 
    ? Math.round((metCount / requirements.length) * 100)
    : 100;

  return {
    requirements,
    compliance,
    score,
  };
}

