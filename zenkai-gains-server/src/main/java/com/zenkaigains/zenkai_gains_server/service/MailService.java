package com.zenkaigains.zenkai_gains_server.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;

@Service
public class MailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;


    /**
     * Sends a password reset email with an inline image (logo).
     */
    public void sendResetLink(String toEmail, String resetLink) {
        try {
            // 'true' in the constructor to allow multipart (for inline images)
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Reset Your ZenkaiGains Password");

            // Build your HTML with ZenkaiGains styling
            String htmlContent = "<html>" +
                    "  <head>" +
                    "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
                    "    <meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\">" +
                    "    <style>" +
                    "      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');" +
                    "    </style>" +
                    "  </head>" +
                    "  <body style=\"font-family: 'Poppins', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #0a0a0a;\">" +
                    "    <table role=\"presentation\" style=\"width: 100%; border-collapse: collapse; background-color: #0a0a0a;\">" +
                    "      <tr>" +
                    "        <td align=\"center\" style=\"padding: 40px 0;\">" +
                    "          <table role=\"presentation\" style=\"width: 600px; max-width: 90%; border-collapse: collapse; background-color: #1a1a1a; border-radius: 8px; box-shadow: 0 4px 10px rgba(255, 0, 0, 0.2);\">" +
                    "            <tr>" +
                    "              <td style=\"padding: 0;\">" +
                    "                <div style=\"height: 6px; background: linear-gradient(to right, #ff0000, #cc0000); border-radius: 8px 8px 0 0;\"></div>" +
                    "              </td>" +
                    "            </tr>" +
                    "            <tr>" +
                    "              <td style=\"padding: 30px 40px; text-align: center;\">" +
                    "                <img src=\"cid:logoImage\" alt=\"ZenkaiGains Logo\" style=\"max-width: 150px; margin-bottom: 20px;\">" +
                    "                <h1 style=\"color: #ffffff; font-size: 28px; font-weight: 700; margin: 0 0 15px 0; text-transform: uppercase;\">Power Up Your Account</h1>" +
                    "                <div style=\"height: 4px; width: 60px; background: linear-gradient(to right, #ff0000, #cc0000); margin: 0 auto 25px auto;\"></div>" +
                    "                <p style=\"color: #cccccc; font-size: 16px; line-height: 24px; margin: 0 0 25px 0;\">We received a request to reset your password. Click the button below to create a new password and continue your training journey:</p>" +
                    "                <div style=\"margin: 30px 0;\">" +
                    "                  <a href=\"" + resetLink + "\" style=\"display: inline-block; background: linear-gradient(to right, #ff0000, #cc0000); color: white; font-weight: 600; text-decoration: none; padding: 12px 30px; border-radius: 4px; font-size: 16px; text-transform: uppercase;\">Reset Password</a>" +
                    "                </div>" +
                    "                <p style=\"color: #999999; font-size: 14px; line-height: 22px; margin: 0 0 15px 0;\">This link will expire in 30 minutes. If you didn't request a password reset, you can safely ignore this email.</p>" +
                    "                <hr style=\"border: 0; border-top: 1px solid #333333; margin: 30px 0;\">" +
                    "                <p style=\"color: #777777; font-size: 13px; line-height: 20px; margin: 0;\">If the button above doesn't work, copy and paste this link into your browser:</p>" +
                    "                <p style=\"color: #999999; font-size: 13px; line-height: 20px; margin: 5px 0 0 0; word-break: break-all;\"><a href=\"" + resetLink + "\" style=\"color: #ff3333; text-decoration: none;\">" + resetLink + "</a></p>" +
                    "              </td>" +
                    "            </tr>" +
                    "            <tr>" +
                    "              <td style=\"background-color: #151515; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;\">" +
                    "                <p style=\"color: #777777; font-size: 13px; margin: 0;\">© " + java.time.Year.now().getValue() + " ZenkaiGains. All rights reserved.</p>" +
                    "                <p style=\"color: #666666; font-size: 12px; margin: 10px 0 0 0;\">Plus Ultra!</p>" +
                    "              </td>" +
                    "            </tr>" +
                    "          </table>" +
                    "        </td>" +
                    "      </tr>" +
                    "    </table>" +
                    "  </body>" +
                    "</html>";

            // Enable HTML
            helper.setText(htmlContent, true);

            // Add inline image from classpath (resources/images/logo.png)
            ClassPathResource logo = new ClassPathResource("images/logo.png");
            helper.addInline("logoImage", logo);

            // Finally, send
            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            System.err.println("Error sending reset link email: " + e.getMessage());
        }
    }

    /**
     * Sends a verification email with an inline image (logo).
     */
    public void sendVerificationEmail(String toEmail, String verifyLink) {
        try {
            // 'true' for multipart
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Verify Your ZenkaiGains Account");

            String htmlContent = "<html>" +
                    "  <head>" +
                    "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
                    "    <meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\">" +
                    "    <style>" +
                    "      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');" +
                    "    </style>" +
                    "  </head>" +
                    "  <body style=\"font-family: 'Poppins', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #0a0a0a;\">" +
                    "    <table role=\"presentation\" style=\"width: 100%; border-collapse: collapse; background-color: #0a0a0a;\">" +
                    "      <tr>" +
                    "        <td align=\"center\" style=\"padding: 40px 0;\">" +
                    "          <table role=\"presentation\" style=\"width: 600px; max-width: 90%; border-collapse: collapse; background-color: #1a1a1a; border-radius: 8px; box-shadow: 0 4px 10px rgba(255, 0, 0, 0.2);\">" +
                    "            <tr>" +
                    "              <td style=\"padding: 0;\">" +
                    "                <div style=\"height: 6px; background: linear-gradient(to right, #ff0000, #cc0000); border-radius: 8px 8px 0 0;\"></div>" +
                    "              </td>" +
                    "            </tr>" +
                    "            <tr>" +
                    "              <td style=\"padding: 30px 40px; text-align: center;\">" +
                    "                <img src=\"cid:logoImage\" alt=\"ZenkaiGains Logo\" style=\"max-width: 150px; margin-bottom: 20px;\">" +
                    "                <h1 style=\"color: #ffffff; font-size: 28px; font-weight: 700; margin: 0 0 15px 0; text-transform: uppercase;\">Begin Your Hero's Journey</h1>" +
                    "                <div style=\"height: 4px; width: 60px; background: linear-gradient(to right, #ff0000, #cc0000); margin: 0 auto 25px auto;\"></div>" +
                    "                <p style=\"color: #cccccc; font-size: 16px; line-height: 24px; margin: 0 0 25px 0;\">Thank you for joining ZenkaiGains! To complete your registration and start training like your favorite anime heroes, please verify your email address:</p>" +
                    "                <div style=\"margin: 30px 0;\">" +
                    "                  <a href=\"" + verifyLink + "\" style=\"display: inline-block; background: linear-gradient(to right, #ff0000, #cc0000); color: white; font-weight: 600; text-decoration: none; padding: 12px 30px; border-radius: 4px; font-size: 16px; text-transform: uppercase;\">Activate Account</a>" +
                    "                </div>" +
                    "                <p style=\"color: #999999; font-size: 14px; line-height: 22px; margin: 0 0 15px 0;\">This verification link will expire in 24 hours. If you did not create an account with us, you can safely ignore this email.</p>" +
                    "                <hr style=\"border: 0; border-top: 1px solid #333333; margin: 30px 0;\">" +
                    "                <p style=\"color: #777777; font-size: 13px; line-height: 20px; margin: 0;\">If the button above doesn't work, copy and paste this link into your browser:</p>" +
                    "                <p style=\"color: #999999; font-size: 13px; line-height: 20px; margin: 5px 0 0 0; word-break: break-all;\"><a href=\"" + verifyLink + "\" style=\"color: #ff3333; text-decoration: none;\">" + verifyLink + "</a></p>" +
                    "              </td>" +
                    "            </tr>" +
                    "            <tr>" +
                    "              <td style=\"background-color: #151515; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;\">" +
                    "                <p style=\"color: #777777; font-size: 13px; margin: 0;\">© " + java.time.Year.now().getValue() + " ZenkaiGains. All rights reserved.</p>" +
                    "                <p style=\"color: #666666; font-size: 12px; margin: 10px 0 0 0;\">Plus Ultra!</p>" +
                    "              </td>" +
                    "            </tr>" +
                    "          </table>" +
                    "        </td>" +
                    "      </tr>" +
                    "    </table>" +
                    "  </body>" +
                    "</html>";

            helper.setText(htmlContent, true);

            // Add inline image from classpath (resources/images/logo.png)
            ClassPathResource logo = new ClassPathResource("images/logo.png");
            helper.addInline("logoImage", logo);

            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            System.err.println("Error sending verification email: " + e.getMessage());
        }
    }
}