export const PlannerLocators = {
  newButton: "lightning-button-icon [data-key='add']",
  participantInput: "input[placeholder='Start typing to search or click the filter Icon for more options']",
  lookupOptions: "[role='listbox'] [role='option'], .slds-listbox [role='option'], .slds-listbox li",
  startDateInput: "input[name='start']",
  appointmentServiceInput: "input[placeholder='Select a Appointment Service']",
  participantLocationSelect: "select",
  nextButton: "button:has-text('Next')",
  appointmentTypeSelect: "select",
  titleInput: "input[aria-label='Title'], input[name='Title']",
  submitButton: "button:has-text('Submit')",
} as const;
