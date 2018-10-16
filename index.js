/**
 * Triggered from a message on a Cloud Pub/Sub topic.
 *
 * @param {!Object} event Event payload.
 * @param {!Object} context Metadata for the event.
 */
const {google} = require('googleapis');
const credentials = JSON.parse(process.env.credentials);
const apiKey = process.env.apiKey;
const spreadsheetId = process.env.spreadsheetId;

const JWT = new google.auth.JWT(
    credentials.client_email, null, credentials.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
);

function appendSheetRow(range, row) {
  const sheets = google.sheets({version: 'v4'});
  sheets.spreadsheets.values.append({
    spreadsheetId: spreadsheetId,
    range: range,
    auth: JWT,
    key: apiKey,
    valueInputOption: 'RAW',
    resource: {values: [row]}
  }, function(err, result) {
    if (err) {
      throw err;
    }
    else {
      console.log('Updated sheet: ' + result.data.updates.updatedRange);
    }
  });
}

exports.sendToSpreadsheet = (event, context) => {
  const pubsubMessage = Buffer.from(event.data, 'base64').toString();
  console.log(`Message received: ${pubsubMessage}`);
  
  const task = JSON.parse(pubsubMessage);
  //{"taskNumber":"065","instructions":"Apresentem - nos o solicitado","delivery":"lote 02","local":"na Aldeia","value":"lote 02: 400 pontos e lote 03 : 300 pontos"}
  var range = 'A1';
  var row = [task.taskNumber, task.instructions, task.delivery, task.local, task.value];
  appendSheetRow(range, row);
};
