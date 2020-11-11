require('dotenv').config();
require('./util/http');

const contactServices = require('./services/contact');
const appointmentServices = require('./services/appointment');
const eligibilityServices = require('./services/eligibility');
const insuranceOrganizationService = require('./services/insuranceOrganization');

const count = 5;

async function fetchApp() {
  const appointments = await appointmentServices.fetchAppointment(count);

  const patientAddAppointment = await contactServices.addPatient(appointments);

  //console.log('pppppppppppppppppppppppppppppppppppp', patientAddAppointment[0]);

  const three = await insuranceOrganizationService.addPayerId(
    patientAddAppointment
  );

  console.log('OKOOKOKOKOKKOKOKOK');

  const result = await eligibilityServices.addEligibility(three);
  // console.log(result);
  // go to dynamics and update

  //console.log('showing results: ');
  //console.log(result);
}

setTimeout(() => {
  fetchApp();
}, 10000);
