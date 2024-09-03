const { authorize } = require('./auth'); // Correctly destructure the import
const {getMails} = require('./gmailService');


async function testing(){
    const auth = await authorize("1");
    const tables = await getMails(auth).then().catch(console.error);
    console.log(auth);
}

testing().catch(console.error);