using System;
using System.Net.Mail;
using MimeKit;
using RestSharp;
using RestSharp.Authenticators;
using MailKit.Net.Smtp;
using SmtpClient = MailKit.Net.Smtp.SmtpClient;
namespace RestieAPI.Providers
{

    public class MailgunEmailSender
    {
        private string _apiKey;
        private string _domain;
        private RestClient _client;
        private RestClientOptions _auth;

        public void SendEmail(string from, string to, string subject, string text, string pdfFilePath)
        {
            var email = new MimeMessage();

            email.From.Add(new MailboxAddress("Restie Hardware", from));
            email.To.Add(new MailboxAddress("Receiver Name", to));

            email.Subject = subject;
            email.Body = new TextPart(MimeKit.Text.TextFormat.Html)
            {
                Text =text
            };

            using (var smtp = new SmtpClient())
            {
                smtp.Connect("smtp.gmail.com", 587, false);

                // Note: only needed if the SMTP server requires authentication
                smtp.Authenticate("fernandezedward6653@gmail.com", "rseg dfvc sncv guoz");

                smtp.Send(email);
                smtp.Disconnect(true);
            }
        }
    }
}


