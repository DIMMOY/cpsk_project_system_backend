import * as functions from 'firebase-functions';
import * as nodemailer from 'nodemailer';
import { FB_GMAIL, FB_PASSWORD } from 'src/config';
import * as schedule from 'node-schedule';

const mailTransport = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: FB_GMAIL,
    pass: FB_PASSWORD,
  },
});

export async function sendNotification(data: {
  recipients: Array<any>;
  subject: string;
  text: string;
  sendDate?: Date;
}) {
  const { recipients, subject, text, sendDate } = data;

  const mailOptions = {
    from: `CPSK Project System <notification>`,
    subject,
    text,
    to: null,
  };

  let successCount = 0;
  const errors = [];

  const job = schedule.scheduleJob(
    sendDate ? sendDate : new Date(new Date().getTime() + 10000),
    async function () {
      for (let i = 0; i < recipients.length; i++) {
        mailOptions.to = recipients[i];

        try {
          await mailTransport.sendMail(mailOptions);
          successCount++;
          // console.log(`Email sent to ${recipients[i]} successfully!`);
        } catch (error) {
          console.error(`Error sending email to ${recipients[i]}:`, error);
        }
      }
    },
  );

  if (successCount === recipients.length) {
    return { success: true };
  } else {
    return { success: false, errors };
  }
}
