export const PlannerLocators = {
  newButton: "button[name='New'], a[title='New'], button:has-text('New')",
  listViewDropdown: "button[title='Select a List View'], button:has-text('Select a List View')",
  listViewOption: "[role='listbox'] [role='option'], [role='listbox'] li",
  listSearchInput: "input[placeholder='Search this list...'], input[aria-label='Search this list...']",
  tableRows: 'table tbody tr',
  rowLink: 'th a, td a',
  detailsTab: "a[title='Details'], [role='tab']:has-text('Details')",
  participantLocation:"(//span[contains(text(),'Participant Location')])[1]",
} as const;
