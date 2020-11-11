require('dotenv').config();
require('./util/http');

const contactServices = require('./services/contact');
const appointmentServices = require('./services/appointment');
const eligibilityServices = require('./services/eligibility');
const insuranceOrganizationService = require('./services/insuranceOrganization');

const config = require('./config')

const count = config.BATCH_COUNT;
const noumberOfLoops = config.NUMBER_OF_LOOP;
let currentCount = 0;

async function fetchApp() {

  if(currentCount == noumberOfLoops) return;

  const {appointments, error: appointmentError} = await appointmentServices.fetchAppointment(count);

  if(appointmentError)
  {
    console.log("fetching appointments failed", appointmentError);

    return;
  }

  console.log('fetching patient ---------');

  const patientAddAppointment = await contactServices.addPatient(appointments);

  const noErrorAppointments = patientAddAppointment.reduce((list, {contactAppointment, error}) => {

    if(error) {
      console.log("failed to put contact on appointment: " + contactAppointment.activityid, "  Error: ",  error);

      return list;
    }

    list.push(contactAppointment);

    return list;

  },[])

  console.log('adding payer Id --------------------------' );

  const three = await insuranceOrganizationService.addPayerId(
    noErrorAppointments
  );

  const noErrorAppointmentWithPayerId = three.reduce((list, {payerIdAppointment, error}) => {

    if(error) {
      console.log("failed to put payerid on appointment: " + payerIdAppointment.activityid, "  Error: ",  error);

      return list;
    }

    list.push(payerIdAppointment);

    return list;

  },[])


  console.log('checking eligibility ----------------');

  const eligibleAddedAppointment = await eligibilityServices.addEligibility(noErrorAppointmentWithPayerId);


  const noErrorEligibilityAppointment = eligibleAddedAppointment.reduce((list, {eligibilityAppointment, error}) => {

    if(error) {
      console.log("failed to put payerid on appointment: " + eligibilityAppointment.activityid, "  Error: ",  error);

      return list;
    }

    list.push(eligibilityAppointment);

    return list;

  },[])

  console.log("Update appointment in dynamics --------------------------------");

  const updatedList = await appointmentServices.updateAppointments(noErrorEligibilityAppointment);

  updatedList.forEach(({appointmentId, appointmentUpdated, error}) => {

    if(error) {
      console.log("update failed on appointment: " + appointmentId, "  Error: ",  error);

      return;
    }


    console.log("Updated Appointment : ", appointmentId)


  })

  console.log('----------------------------------------------------');
  console.log('');

  console.log('next loop -------------------------')

  currentCount++;
  fetchApp();

}

setTimeout(() => {
  fetchApp();
}, 10000);


// re check eligibility
// failed description