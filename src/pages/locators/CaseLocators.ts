export const CaseLocators = {
  accountSearchInput: "input[placeholder='Search Accounts...']",
  invoiceSearchInput: "input[placeholder='Search Invoices...']",
  participantSearchInput: "input[placeholder='Search Contacts...']",
  listboxOptions: "[role='listbox'] [role='option'], [role='listbox'] li",
  searchIconInCombobox: "button[title='Search'], lightning-button-icon button, [data-key='search']",
  advancedSearchHeading: "h1:has-text('Advanced Search')",
  advancedSearchAccountInput: "input[placeholder='Search Accounts...']",
  advancedSearchFirstRowRadio: "xpath=(//label[contains(@class, 'slds-radio__label')][.//span[text()='Select Item 1']])",
  advancedSearchSelectButton: "lightning-modal-footer button.slds-button_brand:has-text('Select'), button.slds-button_brand:has-text('Select')",
  subjectInput: "input[name='Subject']",
} as const;
