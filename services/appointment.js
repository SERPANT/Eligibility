const config = require('../config');
const http = require('../util/http');

/**
 * Fetch appointments
 */
async function fetchAppointment(count) {

  try{
  const url = `${config.baseUrl}/msemr_appointmentemrs?$select=svna_member_id,_msemr_actorpatient_value,svna_health_insurance_company&$filter=svna_eligibilitystatus eq null and svna_health_insurance_company ne null&$top=${count}`;

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
      svna_eligibilitystatus: eligible
    }

    return http
      .post(
        `${config.baseUrl}/msemr_appointmentemrs(${activityid})`,
        data
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
