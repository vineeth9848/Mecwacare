export const MaicaBillingLocators = {
  newButton: "button:has-text('New'), lightning-button:has-text('New')",
  listViewDropdown: "button[title*='Select a List View'], button[aria-label*='List View'], .triggerLink",
  listViewOption: "[role='option'], [role='menuitemradio'], .slds-listbox__option",
  listSearchInput: "input[placeholder*='Search this list'], input[placeholder*='Search']",
  tableRows: "table tbody tr",
  rowLink: "th a, td a",
  pageHeader: "h1, .slds-page-header__title",
} as const;
