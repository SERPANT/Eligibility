const config = require('../config');
const http = require('../util/http');

/**
 * Fetch appointments
 */
async function fetchAppointment(count) {

  const name = "BC Washington State – Premera"

  const encodedName = encodeURIComponent(name);
  try{
  const url = `${config.baseUrl}/msemr_appointmentemrs?$select=svna_member_id,_msemr_actorpatient_value,svna_health_insurance_company&$filter=svna_eligibilitystatus eq null and svna_health_insurance_company eq '${encodedName}'&$top=${count}`;

  const {
    data: { value },
  } = await http.get(url);

  return {appointments: value, error: null};
}catch(error){
  return {appointments : null, error }
}
}

async function updateAppointments(appointments) {
  const appointmentDetailPromise = appointments.map((appointment) => {
    const { activityid, eligible, responseDesc } = appointment;

    const data = {
      svna_eligibilitystatus: eligible ? 153940000 : 153940001,
      svna_reaons_for_failed_eligibility: responseDesc ? responseDesc : null,
      svna_recheckeligibility: false
    }

    return http
      .patch(
        `${config.baseUrl}/msemr_appointmentemrs(${activityid})`,
        {data}
      )
      .then(() => {
        return {
          appointmentId: activityid,
         appointmentUpdated : true,
          error : null
        };
      }).catch((error) => {
        return{
          appointmentId: activityid,
          appointmentUpdated : false,
          error
        }
      })
  });

  return Promise.all(appointmentDetailPromise);
}

module.exports = {
  fetchAppointment,
  updateAppointments
};
