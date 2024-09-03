const { authorize } = require('./auth'); // Correctly destructure the import
const listOfTables = require('./gmailService');


async function testing(){
    const auth = await authorize();
    const tables = await listOfTables(auth).then().catch(console.error);
    console.log(tables);
}

testing().catch(console.error);