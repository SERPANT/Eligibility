const http = require('../util/http');
const config = require('../config');

async function addPatient(appointments) {
  const appointmentDetailPromise = appointments.map((appointment) => {
    const { _msemr_actorpatient_value } = appointment;

    return http
      .get(
        `${config.baseUrl}/contacts(${_msemr_actorpatient_value})?$select=address1_line1,firstname,lastname,birthdate,address1_city,address1_stateorprovince`
      )
      .then((res) => {
        const { data } = res;

        return {
         contactAppointment : {
          ...appointment,
          ...data,
          },
          error : null
        };
      }).catch((error) => {
        return{
          contactAppointment: appointment,
          error
        }
      })
  });

  return Promise.all(appointmentDetailPromise);
}

module.exports = {
  addPatient,
};
