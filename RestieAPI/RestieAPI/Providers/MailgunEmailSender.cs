using System;
using System.Net.Mail;
using MimeKit;
using RestSharp;
using RestSharp.Authenticators;
using MailKit.Net.Smtp;
using SmtpClient = MailKit.Net.Smtp.SmtpClient;
using static RestieAPI.Models.Request.InventoryRequestModel;
namespace RestieAPI.Providers
{

    public class MailgunEmailSender
    {
        private string _apiKey;
        private string _domain;
        private RestClient _client;
        private RestClientOptions _auth;

     
        public async Task SendEmail(PostEmail form_email)
        {
            var email = new MimeMessage();

            email.From.Add(new MailboxAddress("Restie Hardware", form_email.from));
            email.To.Add(new MailboxAddress(form_email.to, form_email.to));

            email.Subject = form_email.subject;

            var builder = new BodyBuilder();
            builder.HtmlBody = form_email.text;

            if (form_email.Attachment.Length>0)
            {
                var attachmentStream = new MemoryStream();
                await form_email.Attachment.CopyToAsync(attachmentStream);
                attachmentStream.Position = 0; // Reset the position to the beginning of the stream

                builder.Attachments.Add(form_email.Attachment.FileName, attachmentStream);
            }

            email.Body = builder.ToMessageBody();

            using (var smtp = new SmtpClient())
            {
                smtp.Connect("smtp.gmail.com", 587, false);

                // Note: only needed if the SMTP server requires authentication
                smtp.Authenticate("fernandezedward6653@gmail.com", "rseg dfvc sncv guoz");

                await smtp.SendAsync(email);
                smtp.Disconnect(true);
            }
        }
    }
}


