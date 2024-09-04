const VoiceResponse = require('twilio').twiml.VoiceResponse;
const AccessToken = require('twilio').jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;

var identity;

// Function to generate a token
function tokenGenerator() {
  identity = nameGenerator(); // Generate a unique identity

  if (!identity) {
    throw new Error('Failed to generate identity.');
  }

  const accessToken = new AccessToken(
    'ACeb4a616a31d55af05478c9e5c8d048e5', // Account SID
    'SKa1b949adec7a8b23d1925e1b61b6556c', // API Key
    '409mkxYA2er1wrXEeSJZQhcRBF4Mp8zl', // API Secret
    { identity } // Set identity
  );
  accessToken.identity = identity; // Set the identity

  const grant = new VoiceGrant({
    outgoingApplicationSid: 'AP520d66d378081a008f4bdfb237ac5f9f',
    incomingAllow: true,
  });
  accessToken.addGrant(grant);

  // Include identity and token in a JSON response
  return {
    identity: identity,
    token: accessToken.toJwt(),
  };
}

// Function to handle voice responses
function voiceResponse(requestBody) {
  const toNumberOrClientName = requestBody.To;
  const callerId = '+12173936128';
  let twiml = new VoiceResponse();

  if (toNumberOrClientName === callerId) {
    let dial = twiml.dial();
    dial.client(identity);
  } else if (toNumberOrClientName) {
    let dial = twiml.dial({ callerId });
    const attr = isAValidPhoneNumber(toNumberOrClientName) ? 'number' : 'client';
    dial[attr]({}, toNumberOrClientName);
  } else {
    twiml.say('Thanks for calling!');
  }

  return twiml.toString();
}

/**
 * Checks if the given value is valid as a phone number
 * @param {Number|String} number
 * @return {Boolean}
 */
function isAValidPhoneNumber(number) {
  return /^[\d\+\-\(\) ]+$/.test(number);
}

function nameGenerator() {
  // Generate a unique name for the identity
  return 'user_' + Math.floor(Math.random() * 10000);
}

// Export functions
module.exports = {
  tokenGenerator,
  voiceResponse,
  isAValidPhoneNumber,
};
