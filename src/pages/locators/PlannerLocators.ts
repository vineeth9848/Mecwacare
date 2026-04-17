export const PlannerLocators = {
  homeLogo: 'div.slds-global-header__logo:visible',
  homeText: "xpath=//span[@title='m360Link']",
  newButton: "lightning-button-icon [data-key='add']",
  agendaEventLine: '.dhx_cal_agenda_event_line',
  agendaEventText: '.dhx_cal_agenda_event_line_text .event-text',
  participantInput: "input[placeholder='Start typing to search or click the filter Icon for more options']",
  lookupOptions: "[role='listbox'] [role='option'], .slds-listbox [role='option'], .slds-listbox li",
  startDateInput: "input[name='start']",
  appointmentServiceInput: "input[placeholder='Select a Appointment Service']",
  participantLocationSelect: "select",
  nextButton: "button:has-text('Next')",
  appointmentTypeSelect: "select",
  titleInput: "input[aria-label='Title'], input[name='Title']",
  submitButton: "button:has-text('Submit')",
  endTimeInput: "input.slds-combobox__input[name='end']",

} as const;
