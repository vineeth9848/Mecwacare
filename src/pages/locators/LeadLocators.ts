export const LeadLocators = {
  newButton: "button[name='New'], a[title='New'], button:has-text('New')",
  leadsHeader: "xpath=(//*[normalize-space()='Leads'])[1]",
  leadsListViewPicker:
    "xpath=(//span[normalize-space()='Recently Viewed']/ancestor::*[self::a or self::button][1] | //span[contains(normalize-space(),'Leads') and contains(@class,'selectedListView')]/ancestor::*[self::a or self::button][1] | //button[contains(@title,'List View') or contains(@aria-label,'List View')])[1]",
  createLeadTitle: "text=Create Lead",
  leadFormContainer: "xpath=(//div[@role='dialog'] | //records-record-layout-block)[1]",
  firstNameInput: "input[placeholder='First Name']:visible, input[aria-label='First Name']:visible, input[name='firstName']:visible",
  lastNameInput: "input[placeholder='Last Name']:visible, input[aria-label='Last Name']:visible, input[name='lastName']:visible",
  emailInput: "xpath=(//label[normalize-space()='Email']/following::input[1] | //input[@type='email'])[1]",
  phoneInput: "xpath=(//label[normalize-space()='Phone']/following::input[1] | //input[@type='tel'])[1]",
  dobInput: "xpath=(//label[contains(normalize-space(),'Date of Birth')]/following::input[1] | //input[contains(@aria-label,'Date Of Birth')])[1]",
  leadDobInput:
    "xpath=(//label[normalize-space()='Date Of Birth']/following::input[1] | //label[normalize-space()='Date of Birth']/following::input[1] | //input[(contains(@aria-label,'Date Of Birth') or contains(@aria-label,'Date of Birth')) and not(@type='checkbox')])[1]",
  leadEmailInput: "input[aria-label='Email'], input[name='Email'], input[type='email']",
  leadPhoneInput: "input[aria-label='Phone'], input[name='Phone'], input[type='tel']",
  visibleDropdownOptions: "[role='option']:visible, ul li:visible",
  leadScoreHotOption: "[role='option']:visible, ul li:visible >> text=Hot",
  fallbackAddressInput: "xpath=(//label[contains(normalize-space(),'Address')]/following::input[1])[1]",
  convertButton: "button:has-text('Convert')",
  convertFirstNameInput: "input[name='firstName']",
  convertLastNameInput: "input[name='lastName']",
  convertOpportunityNameInput: "input[name='opptyName']",
  convertConfirmButton: "button:has-text('Convert')",
  conversionSuccessMessage: "text=Your lead has been converted",
  goToLeadsButton: "button:has-text('Go to Leads')",
  leadsListSearchInput: "input[placeholder='Search this list...']",
  firstLeadRowEmail: "xpath=(//table//tbody//tr[1]//td[contains(@data-label,'Email')]//span | //table//tbody//tr[1]//td[contains(@data-label,'Email')]//a | //table//tbody//tr[1]//td[3]//span)[1]",
  firstLeadRowLink: "xpath=(//table//tbody//tr[1]//th//a | //table//tbody//tr[1]//a[contains(@href,'/Lead/')])[1]",
  detailsTab: "a[title='Details'], [role='tab']:has-text('Details'), a:has-text('Details')",
  launchAddressVerifyLink:
    "xpath=//span[text()='Launch Address / Verify']",
  verifyAddressInput:
    "input[placeholder='Search Address Here'], input[aria-label='Search Address Here'], input[role='combobox'][aria-autocomplete='list']",
  addressSuggestionItems: "[role='listbox'] [role='option']:visible, ul li:visible",
  searchAddressInput:
    "input[aria-label='Search Address Here'], input[placeholder='Search Address Here'], input[aria-label='Search Service Delivery Address Here'], input[placeholder='Search Service Delivery Address Here']",
  verifyAndSaveButton: "button:has-text('Verify & Save')",
  dobRow:
    "xpath=(//span[contains(@class,'test-id__field-label') and (normalize-space()='Date of Birth' or normalize-space()='Date Of Birth')]/ancestor::div[contains(@class,'slds-form-element')][1] | //*[normalize-space()='Date of Birth' or normalize-space()='Date Of Birth']/ancestor::records-record-layout-item[1])[1]",
  dobValue:
    "xpath=(//*[normalize-space()='Date of Birth' or normalize-space()='Date Of Birth']/following::*[self::lightning-formatted-text or self::span][1] | //records-record-layout-item//*[normalize-space()='Date of Birth' or normalize-space()='Date Of Birth']/ancestor::records-record-layout-item//*[self::lightning-formatted-text or self::span][contains(normalize-space(),'/' )][1])",
  ageRow:
    "xpath=(//span[contains(@class,'test-id__field-label') and normalize-space()='Age']/ancestor::div[contains(@class,'slds-form-element')][1] | //*[normalize-space()='Age']/ancestor::records-record-layout-item[1])[1]",
  ageValue:
    "xpath=((//span[contains(@class,'test-id__field-label') and normalize-space()='Age']/ancestor::div[contains(@class,'slds-form-element')][1]//*[contains(@class,'test-id__field-value') or contains(@class,'slds-form-element__static')][1]) | (//*[normalize-space()='Age']/following::*[self::lightning-formatted-number or self::lightning-formatted-text or self::span][1]))[1]",
  addressValue:
    "xpath=((//*[normalize-space()='Address']/following::lightning-formatted-address[1]//a[1]) | (//*[normalize-space()='Address']/following::lightning-formatted-address[1]) | (//*[contains(normalize-space(),'Service Delivery Address')]/following::lightning-formatted-address[1]//a[1]))[1]",
  emailValue:
    "xpath=(//*[normalize-space()='Email']/following::a[contains(@href,'mailto:')][1] | //*[normalize-space()='Email']/following::*[contains(normalize-space(text()),'@')][1] | //a[contains(@href,'mailto:')][1])",
  lead_source: "Lead Source",
  first_name: "First Name",
  last_name: "Last Name",
  email: "Email",
  phone: "Phone",
  service_requested: "Service Request",
  Additional_information: "Additional Information",
  dob : "Date of Birth",
  search_address: "Search Address Here",
  lead_Score: "Lead Score",
  save_button: "Save",
} as const;
