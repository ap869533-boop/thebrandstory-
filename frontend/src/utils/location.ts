const CITY_ALIASES: Record<string, string[]> = {
  mumbai: ['mumbai', 'thane'],
  'delhi ncr': ['delhi', 'noida', 'gurgaon', 'gurugram', 'ghaziabad', 'faridabad'],
  delhi: ['delhi', 'noida', 'gurgaon', 'gurugram', 'ghaziabad', 'faridabad'],
  pune: ['pune', 'pimpri'],
  bangalore: ['bangalore', 'bengaluru'],
  hyderabad: ['hyderabad', 'secunderabad'],
  jaipur: ['jaipur'],
  chandigarh: ['chandigarh', 'mohali', 'panchkula'],
  chennai: ['chennai'],
  lucknow: ['lucknow'],
  ahmedabad: ['ahmedabad', 'gandhinagar', 'surat', 'vadodara'],
};

export const matchesCityLocation = (creatorCity: string, selectedCity: string): boolean => {
  const city = creatorCity.toLowerCase().trim();
  const target = selectedCity.toLowerCase().trim();
  const aliases = CITY_ALIASES[target] || [target];

  return aliases.some((alias) => city.includes(alias));
};
