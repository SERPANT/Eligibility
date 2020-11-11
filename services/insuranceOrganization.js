const config = require('../config');
const http = require('../util/http');

async function fetchByName(name) {
  const url = `${config.baseUrl}/svna_insuranceorganizations?$select=*&$filter=svna_payer_name%20eq%20'First Choice Health Network'`;

  const {
    data: { value },
  } = await http.get(url);

  if (value.length === 0)
    throw new Error('Insurance organization not found : ' + name);

  return value[0];
}

async function addPayerId(appointments) {
  const appointmentDetailPromise = appointments.reduce((list, appointment) => {
    const { svna_health_insurance_company } = appointment;

    console.log(appointment);
    console.log('');
    console.log('----------------------------------');
    if (!svna_health_insurance_company) return list;

    fetchInsurancePromise = fetchByName(svna_health_insurance_company).then(
      (insuranceOrganization) => {
        return {
          ...appointment,
          payerId: insuranceOrganization.svna_payer_id,
        };
      }
    );

    list.push(fetchInsurancePromise);

    return list;
  }, []);

  return Promise.all(appointmentDetailPromise);
}

module.exports = {
  fetchByName,
  addPayerId,
};
