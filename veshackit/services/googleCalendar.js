const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const calendar = google.calendar({ version: "v3", auth: oauth2Client });

async function createMeeting(eventDetails) {
  const event = {
    summary: eventDetails.summary,
    description: eventDetails.description,
    start: { dateTime: eventDetails.startTime, timeZone: "Asia/Kolkata" },
    end: { dateTime: eventDetails.endTime, timeZone: "Asia/Kolkata" },
    attendees: eventDetails.attendees.map((email) => ({ email })),
    conferenceData: { createRequest: { requestId: "meeting-request" } },
  };

  const response = await calendar.events.insert({
    calendarId: "primary",
    resource: event,
    conferenceDataVersion: 1,
  });

  return response.data;
}

module.exports = { createMeeting };
