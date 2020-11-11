const config = require('../config');
const http = require('../util/http');

async function fetchByName(name) {

  encodedName = encodeURIComponent(name);

  const url = `${config.baseUrl}/svna_insuranceorganizations?$select=*&$filter=svna_payer_name%20eq%20'${encodedName}'`;

  try{
  const {
    data: { value },
  } = await http.get(url);

  if (value.length === 0) return {insuranceOrganization: null, error:  new Error('Insurance organization not found : ' + name)}
    

  return {insuranceOrganization: value[0], error: null}


}catch(error){
  return {insuranceOrganization: null, error}
}
}


/**
 * 
 * @param {*} appointments 
 */
async function addPayerId(appointments) {
  const appointmentDetailPromise = appointments.reduce((list, appointment) => {
    const { svna_health_insurance_company } = appointment;
    
    if (!svna_health_insurance_company) return list;

    fetchInsurancePromise = fetchByName(svna_health_insurance_company).then(
      ({insuranceOrganization, error}) => {

        if(error) {
          return {
            payerIdAppointment: appointment,
            error
          }
        }

        return {
          payerIdAppointment: {
            ...appointment,
            payerId: insuranceOrganization.svna_payer_id,
          },
          error: null
        };
      },

    )

    list.push(fetchInsurancePromise);

    return list;
  }, []);

  return Promise.all(appointmentDetailPromise);
}

module.exports = {
  fetchByName,
  addPayerId,
};
