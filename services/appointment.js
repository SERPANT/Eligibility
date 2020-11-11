const config = require('../config');
const http = require('../util/http');

/**
 * Fetch appointments
 */
async function fetchAppointment(count) {
  const url = `${config.baseUrl}/msemr_appointmentemrs?$select=svna_member_id,_msemr_actorpatient_value,svna_health_insurance_company&$filter=svna_eligibilitystatus eq null and svna_health_insurance_company ne null&$top=${count}`;

  const {
    data: { value },
  } = await http.get(url);

  return value;
}

module.exports = {
  fetchAppointment,
};
