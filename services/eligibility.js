const axios = require('axios');

const config = require('../config')

/**
 * 
 * @param {*} patientAddAppointment 
 */
async function addEligibility(patientAddAppointment) {
  const eliligible = patientAddAppointment.map((appointment) => {
    const {
      address1_city,
      birthdate,
      firstname,
      lastname,
      svna_member_id,
      address1_line1,
      address1_stateorprovince,
    } = appointment;

    const birthDateObj = new Date(birthdate);
    const patientDateOfBirth = `${
      birthDateObj.getMonth() + 1
    }/${birthDateObj.getDate()}/${birthDateObj.getFullYear()}`;

    const patientDateOfService = new Date(appointment.svna_appintmentdate);

    const data = {
      patientAddress: address1_line1,
      patientCity: address1_city,
      patientDateOfBirth,
      patientDateofService: `${patientDateOfService.getMonth() + 1}/${patientDateOfService.getDate()}/${patientDateOfService.getFullYear()}`,
      patientFirstName: firstname,
      patientGender: 'F',
      patientLastName: lastname,
      patientPolicyNumber: svna_member_id,
      patientState: address1_stateorprovince,
      patientZip: '98115',
      payerEligibilityID: appointment.payerId,
      payerID: appointment.payerId,
    };

    return postEligibilityRequest(data, appointment);
  });

  return await Promise.all(eliligible);
}

function postEligibilityRequest(data, appointment) {

  return axios
    .post(config.ELIGIBILITY_URL, data)
    .then((res) => {
      let eligibilityAppointment = {
        ...appointment,
        eligible: res.data.isEligible,
      };

      if (!res.data.isEligible) {
        const { responseDesc, planDetails } = res.data.error.response;

        eligibilityAppointment = {
          ...eligibilityAppointment,
          responseDesc,
          planDetails,
        };
      }

      return {
        eligibilityAppointment,
        error: null
      };
    })
    .catch((error) => {
      return {
        eligibilityAppointment: appointment,
        error
      }
    });
}

module.exports = {
  addEligibility,
};
