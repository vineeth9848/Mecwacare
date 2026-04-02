export const CaseLocators = {
  accountSearchInput: "input[placeholder='Search Accounts...']",
  participantSearchInput: "input[placeholder='Search Contacts...']",
  listboxOptions: "[role='listbox'] [role='option'], [role='listbox'] li",
  searchIconInCombobox: "button[title='Search'], lightning-button-icon button, [data-key='search']",
  advancedSearchHeading: "h2:has-text('Advanced Search')",
  advancedSearchAccountInput: "input[placeholder='Search Accounts...']",
  advancedSearchFirstRowRadio: "label.slds-radio__label, span.slds-radio_faux, input[type='radio']",
  advancedSearchSelectButton: "lightning-modal-footer button.slds-button_brand:has-text('Select'), button.slds-button_brand:has-text('Select')",
} as const;
