import type {
  ChecklistState,
  ChecklistItem,
  WebsiteRequirements,
  PackageConstraints,
  PackageId,
} from '@/types/websiteBuilder';
import { CLIENT_CHECKLIST_ITEMS } from './checklistItems';

/**
 * Maps checklist selections to WebsiteRequirements object
 * Auto-fills remaining questions based on checked items
 */
export function mapChecklistToRequirements(
  checklist: ChecklistState,
  packageConstraints?: PackageConstraints,
  selectedPackage?: PackageId
): Partial<WebsiteRequirements> {
  const requirements: Partial<WebsiteRequirements> = {};

  // Process each checklist item
  CLIENT_CHECKLIST_ITEMS.forEach(item => {
    // Check if item is checked
    const isChecked = checklist[item.category]?.[item.id] === true;

    if (!isChecked) {
      return; // Skip unchecked items
    }

    // Check package requirements
    if (item.packageRequired && selectedPackage) {
      if (!item.packageRequired.includes(selectedPackage)) {
        return; // Skip if package doesn't support this feature
      }
    }

    // Map to requirements based on mapsTo
    const mapsTo = Array.isArray(item.mapsTo) ? item.mapsTo : [item.mapsTo];

    mapsTo.forEach(key => {
      // Handle auto-fill values
      if (item.autoFillValue !== undefined) {
        requirements[key] = item.autoFillValue as never;
        return;
      }

      // Handle different field types
      switch (key) {
        case 'businessName':
        case 'businessEmail':
        case 'businessPhone':
        case 'businessAddress':
        case 'domainName':
          // These need user input, set placeholder indicating checklist selected
          if (!requirements[key]) {
            requirements[key] = '[CHECKLIST: Please fill in]' as never;
          }
          break;

        case 'domainStatus':
          // If domain checklist item is checked, set to 'have_domain' or 'need_domain'
          if (!requirements.domainStatus) {
            requirements.domainStatus = 'undecided';
          }
          break;

        case 'industry':
        case 'businessType':
          // These need selection, mark as ready for input
          if (!requirements[key]) {
            requirements[key] = '[CHECKLIST: Please select]' as never;
          }
          break;

        case 'services':
          // Initialize services array if not exists
          if (!requirements.services) {
            requirements.services = [];
          }
          // Don't add empty services - user will add them
          break;

        case 'targetAudience':
        case 'projectOverview':
          // These need text input, set placeholder
          if (!requirements[key]) {
            requirements[key] = '[CHECKLIST: Please describe]' as never;
          }
          break;

        case 'primaryColor':
        case 'accentColor':
          // Default colors if not set
          if (!requirements[key]) {
            requirements[key] = (key === 'primaryColor' ? '#3b82f6' : '#a855f7') as never;
          }
          break;

        case 'colorSchemePreset':
          // Default preset if not set
          if (!requirements.colorSchemePreset) {
            requirements.colorSchemePreset = 'Ocean Blue & Coral (#3b82f6 + #f97316)';
          }
          break;

        case 'pages':
          // Initialize pages array with common pages
          if (!requirements.pages) {
            requirements.pages = ['Home', 'About', 'Services', 'Contact'];
          }
          break;

        case 'features':
          // Initialize features array
          if (!requirements.features) {
            requirements.features = [];
          }
          // Add feature based on checklist item
          if (item.id.includes('contact-form')) {
            requirements.features.push('Contact Form');
          } else if (item.id.includes('booking')) {
            requirements.features.push('Online Booking/Reservations');
          } else if (item.id.includes('ecommerce')) {
            requirements.features.push('Shopping Cart');
          } else if (item.id.includes('blog')) {
            requirements.features.push('Blog');
          } else if (item.id.includes('social')) {
            requirements.features.push('Social Media Links');
          } else if (item.id.includes('maps')) {
            requirements.features.push('Google Maps');
          } else if (item.id.includes('chat')) {
            requirements.features.push('Live Chat');
          } else if (item.id.includes('newsletter')) {
            requirements.features.push('Newsletter Signup');
          } else if (item.id.includes('gallery')) {
            requirements.features.push('Photo Gallery');
          } else if (item.id.includes('video')) {
            requirements.features.push('Video Integration');
          }
          break;

        case 'enableEcommerce':
          // Enable e-commerce if checked
          requirements.enableEcommerce = true;
          break;

        case 'contentMode':
          // Set content mode based on checklist selection
          if (item.autoFillValue) {
            requirements.contentMode = item.autoFillValue as 'ai_generated' | 'user_provided';
          }
          break;

        case 'socialMedia':
          // Initialize social media object
          if (!requirements.socialMedia) {
            requirements.socialMedia = {};
          }
          // Mark as available if checklist item checked
          break;

        case 'country':
        case 'region':
          // Location fields - mark as ready for input
          if (!requirements[key]) {
            requirements[key] = '[CHECKLIST: Please enter]' as never;
          }
          break;

        case 'competitors':
          // Initialize competitors array
          if (!requirements.competitors) {
            requirements.competitors = [];
          }
          break;

        case 'businessPhotos':
        case 'colorPreferenceImages':
          // Initialize photo arrays
          if (!requirements[key]) {
            requirements[key] = [];
          }
          break;

        case 'inspirationalSites':
          // Initialize inspirational sites array
          if (!requirements.inspirationalSites) {
            requirements.inspirationalSites = [];
          }
          break;

        case 'primaryCTA':
          // Default CTA
          if (!requirements.primaryCTA) {
            requirements.primaryCTA = 'Contact Us';
          }
          break;

        case 'mobilePriority':
          // Default mobile priority
          if (!requirements.mobilePriority) {
            requirements.mobilePriority = 'Important - About 50/50 split';
          }
          break;

        case 'themeMode':
          // Default theme mode
          if (!requirements.themeMode) {
            requirements.themeMode = 'light';
          }
          break;

        default:
          // For other fields, just mark as checked
          break;
      }
    });
  });

  // Enforce package constraints
  if (packageConstraints) {
    // Limit services
    if (requirements.services && requirements.services.length > packageConstraints.maxServices) {
      requirements.services = requirements.services.slice(0, packageConstraints.maxServices);
    }

    // Limit pages if specified
    if (requirements.pages && requirements.pages.length > packageConstraints.maxPages) {
      requirements.pages = requirements.pages.slice(0, packageConstraints.maxPages);
    }
  }

  return requirements;
}

/**
 * Calculate checklist completion percentage
 */
export function calculateChecklistProgress(
  checklist: ChecklistState,
  selectedPackage?: PackageId
): {
  total: number;
  checked: number;
  required: number;
  requiredChecked: number;
  percentage: number;
  requiredPercentage: number;
} {
  let total = 0;
  let checked = 0;
  let required = 0;
  let requiredChecked = 0;

  CLIENT_CHECKLIST_ITEMS.forEach(item => {
    // Check package requirements
    if (item.packageRequired && selectedPackage) {
      if (!item.packageRequired.includes(selectedPackage)) {
        return; // Skip items not available for this package
      }
    }

    total++;
    const isChecked = checklist[item.category]?.[item.id] === true;

    if (isChecked) {
      checked++;
    }

    if (item.required) {
      required++;
      if (isChecked) {
        requiredChecked++;
      }
    }
  });

  const percentage = total > 0 ? Math.round((checked / total) * 100) : 0;
  const requiredPercentage = required > 0 ? Math.round((requiredChecked / required) * 100) : 0;

  return {
    total,
    checked,
    required,
    requiredChecked,
    percentage,
    requiredPercentage,
  };
}

/**
 * Get required items for a specific package
 */
export function getRequiredItemsForPackage(packageId?: PackageId): ChecklistItem[] {
  return CLIENT_CHECKLIST_ITEMS.filter(item => {
    if (!item.required) return false;
    if (item.packageRequired && packageId) {
      return item.packageRequired.includes(packageId);
    }
    return true;
  });
}

/**
 * Validate checklist completeness
 */
export function validateChecklist(
  checklist: ChecklistState,
  selectedPackage?: PackageId
): {
  isValid: boolean;
  missingRequired: ChecklistItem[];
  errors: string[];
} {
  const requiredItems = getRequiredItemsForPackage(selectedPackage);
  const missingRequired: ChecklistItem[] = [];
  const errors: string[] = [];

  requiredItems.forEach(item => {
    const isChecked = checklist[item.category]?.[item.id] === true;
    if (!isChecked) {
      missingRequired.push(item);
      errors.push(`Missing required item: ${item.label}`);
    }
  });

  return {
    isValid: missingRequired.length === 0,
    missingRequired,
    errors,
  };
}

