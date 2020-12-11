require('dotenv').config();
require('./util/http');

const contactServices = require('./services/contact');
const appointmentServices = require('./services/appointment');
const eligibilityServices = require('./services/eligibility');
const insuranceOrganizationService = require('./services/insuranceOrganization');

const config = require('./config')

const count = config.BATCH_COUNT;

let startDate = "2020-08-20";
let resetDate = "2020-08-20";
let timeoutRef;

let end = false;

const listOfInsuranceOrgainzation = [
  "BC Washington State - Premera",
  "Aetna Health Plan – PPO",
  "BS Washington – Regence",
  "UnitedHealthcare"
];

let currentOrganization = 0;

const fetchAppError = {
  END_LOOP: -1,
  INCREMENT_DATE: 1,
  RETRY: 2,
  ALL_DONE: 0,
  CHANGE_ORGANIZATION: 3
}

async function fetchApp() {

  console.log("---------------------------------------------------------");
  console.log("Running Loop for :  " + listOfInsuranceOrgainzation[currentOrganization])
  const {appointments, error: appointmentError} = await appointmentServices.fetchAppointment(count, startDate, listOfInsuranceOrgainzation[currentOrganization]);

  if(appointmentError)
  {
    console.log("fetching appointments failed: ", appointmentError);

    return fetchAppError.END_LOOP;
  }

  if(appointments.length === 0)
  {
    return fetchAppError.INCREMENT_DATE;
  }

  console.log('fetching patient -------------------------------------------------------');

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

      console.log("ERROR CHECK: ", eligibilityAppointment);

      console.log("failed to check eligibility " + eligibilityAppointment.activityid, "  Error: ",  error.response.data.error.message);
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

  return fetchAppError.ALL_DONE;
}


async function start() {

  let status; 

  while(!end)
  {
    status = await fetchApp();

    if(status === fetchAppError.END_LOOP)
    {
      end = true;
      break;
    }

    if(status === fetchAppError.INCREMENT_DATE)
    {
      currentDate = new Date(startDate);

      var newDate = new Date(currentDate.setTime( currentDate.getTime() + 7 * 86400000 ));

      if(newDate.getFullYear() == "2021")
      {
        startDate = resetDate;

        currentOrganization++;

        console.log("Increment organization");

        if(currentOrganization >= listOfInsuranceOrgainzation.length)
        {
          end = true;

          break;
        }

      } else{

        startDate = `${newDate.getFullYear()}-${newDate.getMonth() + 1}-${newDate.getDate()}`;

        console.log("increment date");
      }
    }

    console.log('----------------------------------------------------');
    console.log('');
  
    console.log('next loop ----------------------------------------------');
  }

  clearTimeout(timeoutRef);
}

timeoutRef = setTimeout(start, 10000);