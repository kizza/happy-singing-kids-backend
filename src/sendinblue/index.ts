import axios from "axios";
import { DisplayItem } from "../stripe/catalogue";

export interface EmailProps {
  items: DisplayItem[];
  primaryLink: string;
}

export const sendEmail = (
  toEmail: string,
  { items, primaryLink }: EmailProps
) =>
  axios.post(
    "https://api.sendinblue.com/v3/smtp/email",
    {
      to: [
        {
          email: toEmail,
          name: "Keiran O'Leary",
        },
      ],
      templateId: 1,
      params: {
        name: "Kizza",
        surname: "Me",
        items,
        primaryLink,
      },
    },
    {
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        "api-key": process.env.sendInBlueApiKey,
      },
    }
  );

//sendEmail()
//  .then(response => {
//    console.log("Yes", response);
//  })
//  .catch(e => {
//    console.log("No", e);
//  });

//// var SibApiV3Sdk = require('sib-api-v3-sdk');
//// var defaultClient = SibApiV3Sdk.ApiClient.instance;

////import * as sendInBlue from 'sib-api-v3-typescript';

////var defaultClient = sendInBlue.ApiClient.instance;

////// Configure API key authorization: api-key
////var apiKey = defaultClient.authentications["api-key"];
////apiKey.apiKey = "YOUR API KEY";
////// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//////apikey.apiKeyPrefix = 'Token';

//////// Configure API key authorization: partner-key
//////var partnerKey = defaultClient.authentications["partner-key"];
//////partnerKey.apiKey = "YOUR API KEY";
//////// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
////////partnerKey.apiKeyPrefix = 'Token';

////var apiInstance = new sendInBlue.SMTPApi();

////var sendSmtpEmail = new sendInBlue.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email

////apiInstance.sendTransacEmail(sendSmtpEmail).then(
////  function (data) {
////    console.log("API called successfully. Returned data: " + data);
////  },
////  function (error) {
////    console.error(error);
////  }
////);
