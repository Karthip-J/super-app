import React from 'react';

const steps = [
  { label: 'Pickup', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /></svg>
  ) },
  { label: 'Navigate', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24"><path d="M12 2L19 21l-7-4-7 4z" /></svg>
  ) },
  { label: 'Riding', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24"><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /><path d="M5 17V7h14v10" /></svg>
  ) },
  { label: 'Done', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
  ) }
];

export default function TripStepper({ currentStep = 0 }) {
  return (
    <div className="flex items-center justify-between mb-6 px-4">
      {steps.map((step, idx) => (
        <React.Fragment key={step.label}>
          <div className="flex flex-col items-center min-w-[60px]">
            <div className={
              `w-9 h-9 flex items-center justify-center rounded-full border-2 transition-all duration-300
              ${idx < currentStep ? 'bg-blue-600 border-blue-600 text-white shadow-lg' :
                idx === currentStep ? 'bg-white border-blue-600 text-blue-600 shadow-md' :
                'bg-gray-200 border-gray-300 text-gray-400'}`
            }>
              {idx < currentStep ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step.icon
              )}
            </div>
            <span className={`text-xs mt-1 ${idx === currentStep ? 'font-semibold text-blue-700' : 'text-gray-500'}`}>
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`flex-1 h-1 mx-1 rounded transition-all duration-300
              ${idx < currentStep ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
} 