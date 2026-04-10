import React from 'react';
import { parseFormData } from '../../lib/formDataParser';

/**
 * FormDataParser Component
 * Parses and displays form submission data in a clean, structured format
 * 
 * Supports multiple form types:
 * - 'aid-attendance' or 'aid_attendance': Aid & Attendance form with specialized sections
 * - 'quick-intake' or 'quick_intake': Quick Intake form with contact and request details
 * - null or unknown: Generic form with automatic field detection and formatting
 * 
 * @param {object} props
 * @param {string|object} props.data - Form data (JSON string or object)
 * @param {string} props.formType - Type of form (optional, defaults to generic parsing)
 * @param {string} props.className - Additional CSS classes
 */
const FormDataParser = React.memo(({ data, formType = null, className = '' }) => {
  // Handle empty or null data
  if (!data) {
    return (
      <div className={`text-slate-500 text-sm ${className}`}>
        No data available
      </div>
    );
  }

  // Parse the form data
  const parsedData = parseFormData(data, formType);

  // If no sections were created, show a fallback message
  if (!parsedData.sections || parsedData.sections.length === 0) {
    return (
      <div className={`text-slate-500 text-sm ${className}`}>
        Unable to parse form data
      </div>
    );
  }

  // Get form type label for display
  const getFormTypeLabel = (type) => {
    if (!type) return null;
    
    switch (type.toLowerCase().replace('_', '-')) {
      case 'aid-attendance':
        return 'Aid & Attendance Form';
      case 'quick-intake':
        return 'Quick Intake Form';
      case 'claim-readiness-review':
        return 'Claim Readiness Review Form';
      case 'nexus-letter':
        return 'Nexus Letter Form';
      case 'dbq':
        return 'DBQ Form';
      case '1151-claim':
        return '1151 Claim Form';
      default:
        return type.split(/[-_]/).map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ') + ' Form';
    }
  };

  const formTypeLabel = getFormTypeLabel(formType);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Form Type Badge (if specified) */}
      {formTypeLabel && (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
          {formTypeLabel}
        </div>
      )}

      {/* Sections */}
      {parsedData.sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="space-y-3">
          {/* Section Title */}
          <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
            {section.title}
          </h3>

          {/* Section Fields */}
          <div className="space-y-3">
            {section.fields.map((field, fieldIndex) => (
              <div key={fieldIndex} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Field Label */}
                <div className="text-sm font-medium text-slate-700">
                  {field.label}
                </div>

                {/* Field Value */}
                <div className="sm:col-span-2 text-sm text-slate-900">
                  {typeof field.value === 'string' && field.value.includes('\n') ? (
                    // Multi-line text
                    <pre className="whitespace-pre-wrap font-sans">{field.value}</pre>
                  ) : (
                    // Single line text
                    <span>{field.value}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});

FormDataParser.displayName = 'FormDataParser';

export default FormDataParser;
