/**
 * Form Data Parser Utility
 * Handles parsing and formatting of form submission data
 */

/**
 * Detects if a string is JSON or plain text
 * @param {string} data - The data to check
 * @returns {boolean} - True if data is valid JSON
 */
export const isJSON = (data) => {
  if (typeof data !== 'string') return false;
  
  try {
    const parsed = JSON.parse(data);
    return typeof parsed === 'object' && parsed !== null;
  } catch (e) {
    return false;
  }
};

/**
 * Safely parse JSON with error handling
 * @param {string} data - JSON string to parse
 * @returns {object|null} - Parsed object or null if parsing fails
 */
export const safeJSONParse = (data) => {
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('JSON parsing error:', e);
    return null;
  }
};

/**
 * Format field value for display
 * @param {string} key - Field key
 * @param {any} value - Field value
 * @returns {string} - Formatted value
 */
export const formatFieldValue = (key, value) => {
  // Handle empty/null values
  if (value === null || value === undefined || value === '') {
    return 'Not provided';
  }

  // Handle boolean values
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : 'Not provided';
  }

  // Handle objects (nested data)
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }

  // Handle date fields
  if (key.toLowerCase().includes('date') || key.toLowerCase().includes('dob')) {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  }

  // Handle phone numbers
  if (key.toLowerCase().includes('phone')) {
    const cleaned = value.toString().replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
  }

  // Handle SSN (mask for privacy)
  if (key.toLowerCase().includes('ssn')) {
    const cleaned = value.toString().replace(/\D/g, '');
    if (cleaned.length === 9) {
      return `***-**-${cleaned.slice(5)}`;
    }
  }

  return value.toString();
};

/**
 * Convert camelCase or snake_case to Title Case
 * @param {string} str - String to convert
 * @returns {string} - Title case string
 */
export const toTitleCase = (str) => {
  // Handle camelCase
  const spacedStr = str.replace(/([A-Z])/g, ' $1');
  // Handle snake_case
  const withSpaces = spacedStr.replace(/_/g, ' ');
  // Capitalize first letter of each word
  return withSpaces
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim();
};

/**
 * Field mapping for Aid & Attendance form
 */
const AID_ATTENDANCE_FIELD_MAP = {
  // Personal Information
  veteranName: { label: "Veteran's Full Name", section: 'Personal Information' },
  veteranSSN: { label: 'Social Security Number', section: 'Personal Information' },
  veteranDOB: { label: 'Date of Birth', section: 'Personal Information' },
  veteranPhone: { label: 'Phone Number', section: 'Personal Information' },
  veteranEmail: { label: 'Email Address', section: 'Personal Information' },
  
  // Contact Person
  contactName: { label: 'Contact Name', section: 'Contact Person' },
  contactPhone: { label: 'Contact Phone', section: 'Contact Person' },
  contactEmail: { label: 'Contact Email', section: 'Contact Person' },
  contactRelationship: { label: 'Relationship to Veteran', section: 'Contact Person' },
  
  // Medical Information
  primaryDiagnosis: { label: 'Primary Diagnosis', section: 'Medical Information' },
  secondaryDiagnoses: { label: 'Secondary Diagnoses', section: 'Medical Information' },
  currentMedications: { label: 'Current Medications', section: 'Medical Information' },
  physicianName: { label: 'Primary Physician', section: 'Medical Information' },
  physicianPhone: { label: 'Physician Phone', section: 'Medical Information' },
  lastExamDate: { label: 'Last Medical Exam', section: 'Medical Information' },
  
  // Activities of Daily Living
  bathing: { label: 'Bathing/Showering', section: 'Activities of Daily Living' },
  dressing: { label: 'Dressing/Undressing', section: 'Activities of Daily Living' },
  eating: { label: 'Eating/Feeding', section: 'Activities of Daily Living' },
  toileting: { label: 'Toileting', section: 'Activities of Daily Living' },
  mobility: { label: 'Walking/Mobility', section: 'Activities of Daily Living' },
  transferring: { label: 'Transferring', section: 'Activities of Daily Living' },
  continence: { label: 'Continence Control', section: 'Activities of Daily Living' },
  
  // Care Requirements
  supervisionNeeded: { label: 'Supervision Level', section: 'Care Requirements' },
  assistanceHours: { label: 'Daily Assistance Hours', section: 'Care Requirements' },
  caregiverInfo: { label: 'Current Caregiver', section: 'Care Requirements' },
  
  // Additional Information
  additionalInfo: { label: 'Additional Details', section: 'Additional Information' },
  rushService: { label: 'Rush Service', section: 'Additional Information' },
  serviceType: { label: 'Service Type', section: 'Additional Information' },
};

/**
 * Field mapping for Quick Intake form
 */
const QUICK_INTAKE_FIELD_MAP = {
  fullName: { label: 'Full Name', section: 'Contact Information' },
  email: { label: 'Email', section: 'Contact Information' },
  phone: { label: 'Phone', section: 'Contact Information' },
  formType: { label: 'Form Type', section: 'Request Details' },
  briefSummary: { label: 'Brief Summary', section: 'Request Details' },
};

/**
 * Field mapping for service-specific forms (Nexus Letter, DBQ, 1151 Claim, Claim Readiness Review)
 * These forms share the same data shape from QuickIntakeForm
 */
const SERVICE_FORM_FIELD_MAP = {
  briefSummary: { label: 'Brief Summary', section: 'Request Details' },
  selectedServices: { label: 'Selected Services', section: 'Request Details' },
  rushService: { label: 'Rush Service', section: 'Service Options' },
  fullName: { label: 'Full Name', section: 'Contact Information' },
  email: { label: 'Email', section: 'Contact Information' },
  phone: { label: 'Phone', section: 'Contact Information' },
  formType: { label: 'Form Type', section: 'Request Details' },
};

/**
 * Get field mapping based on form type
 * @param {string} formType - Type of form
 * @returns {object} - Field mapping
 */
const getFieldMap = (formType) => {
  if (!formType) return null;

  switch (formType.toLowerCase().replace('-', '_')) {
    case 'aid_attendance':
      return AID_ATTENDANCE_FIELD_MAP;
    case 'quick_intake':
      return QUICK_INTAKE_FIELD_MAP;
    case 'nexus_letter':
    case 'dbq':
    case '1151_claim':
    case 'claim_readiness_review':
      return SERVICE_FORM_FIELD_MAP;
    default:
      return null;
  }
};

/**
 * Group fields into sections
 * @param {object} data - Parsed form data
 * @param {string} formType - Type of form
 * @returns {array} - Array of sections with fields
 */
export const groupFieldsIntoSections = (data, formType = null) => {
  const fieldMap = getFieldMap(formType);
  const sections = {};

  Object.entries(data).forEach(([key, value]) => {
    // Skip empty values and empty arrays
    if (value === null || value === undefined || value === '') {
      return;
    }
    if (Array.isArray(value) && value.length === 0) {
      return;
    }

    let sectionName = 'General Information';
    let fieldLabel = toTitleCase(key);

    // Use field map if available
    if (fieldMap && fieldMap[key]) {
      sectionName = fieldMap[key].section;
      fieldLabel = fieldMap[key].label;
    }

    // Initialize section if it doesn't exist
    if (!sections[sectionName]) {
      sections[sectionName] = [];
    }

    // Add field to section
    sections[sectionName].push({
      key,
      label: fieldLabel,
      value: formatFieldValue(key, value),
      rawValue: value
    });
  });

  // Convert to array format
  return Object.entries(sections).map(([title, fields]) => ({
    title,
    fields
  }));
};

/**
 * Parse form data (JSON or plain text) into structured format
 * @param {string|object} data - Form data to parse
 * @param {string} formType - Type of form (optional)
 * @returns {object} - Parsed data with sections
 */
export const parseFormData = (data, formType = null) => {
  // If data is already an object, use it directly
  if (typeof data === 'object' && data !== null) {
    return {
      isJSON: true,
      sections: groupFieldsIntoSections(data, formType),
      rawData: data
    };
  }

  // If data is a string, check if it's JSON
  if (typeof data === 'string') {
    if (isJSON(data)) {
      const parsed = safeJSONParse(data);
      if (parsed) {
        return {
          isJSON: true,
          sections: groupFieldsIntoSections(parsed, formType),
          rawData: parsed
        };
      }
    }

    // Plain text - return as single section
    return {
      isJSON: false,
      sections: [{
        title: 'Message',
        fields: [{
          key: 'message',
          label: 'Message',
          value: data,
          rawValue: data
        }]
      }],
      rawData: data
    };
  }

  // Fallback for unexpected data types
  return {
    isJSON: false,
    sections: [{
      title: 'Data',
      fields: [{
        key: 'data',
        label: 'Data',
        value: 'Unable to parse data',
        rawValue: data
      }]
    }],
    rawData: data
  };
};
