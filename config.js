const BASE_URL = process.env.BASE_URL;
const POWERAPPS_ENV_URL = process.env.POWER_APPS_ENV_URL;
const AUTHENTICATION_URL = process.env.AUTHENTICATION_URL;

const PORT = process.env.PORT;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

const ELIGIBILITY_USER = process.env.ELIGIBILITY_USER;
const ELIGIBILITY_PASS = process.env.ELIGIBILITY_PASS;
const PHICURE_ELIGIBILITY_API = process.env.PHICURE_ELIGIBILITY_API;

const BATCH_COUNT = process.env.BATCH_COUNT;
const NUMBER_OF_LOOP = process.env.NUMBER_OF_LOOP; 

const ENTITY_END_POINTS = {
  patient: 'contacts',
  contacts: 'contacts',
  clinics: 'svna_clinicses',
  appSetting: 'svna_appsettings',
  clinicDay: 'svna_clinic_dayses',
  appointments: 'msemr_appointmentemrs',
  emailList: 'svna_creditcardpatientemails',
  accountLinkToClinic: 'svna_svna_clinics_accountset',
  insuranceOrganization: 'svna_insuranceorganizations',
};

const config = {
  BATCH_COUNT,
  NUMBER_OF_LOOP,
  baseUrl: BASE_URL,
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  powerAppsEnvURL: POWERAPPS_ENV_URL,
  authenticationUrl: AUTHENTICATION_URL,
  port: PORT || 3000,
  entity: {
    clinics: `${BASE_URL}/${ENTITY_END_POINTS.clinics}`,
    patient: `${BASE_URL}/${ENTITY_END_POINTS.patient}`,
    patients: `${BASE_URL}/${ENTITY_END_POINTS.contacts}`,
    clinicDay: `${BASE_URL}/${ENTITY_END_POINTS.clinicDay}`,
    emailList: `${BASE_URL}/${ENTITY_END_POINTS.emailList}`,
    appSetting: `${BASE_URL}/${ENTITY_END_POINTS.appSetting}`,
    appointments: `${BASE_URL}/${ENTITY_END_POINTS.appointments}`,
    accountLinkToClinic: `${BASE_URL}/${ENTITY_END_POINTS.accountLinkToClinic}`,
    insuranceOrganization: `${BASE_URL}/${ENTITY_END_POINTS.insuranceOrganization}`,
  },
  eligibilityUser: ELIGIBILITY_USER,
  eligibilityPass: ELIGIBILITY_PASS,
  eligibilityApi: PHICURE_ELIGIBILITY_API,
};

module.exports = config;
