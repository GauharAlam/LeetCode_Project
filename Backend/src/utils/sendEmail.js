const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
    try {
        let transporter;

        // If you have set up your real Gmail credentials in Backend/.env, use them!
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            transporter = nodemailer.createTransport({
                service: "gmail", // Automatically configures host/port for Gmail
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
        } else {
            // Fallback: Extremely fast, pre-generated testing account
            // This prevents the 2-3 second delay of generating a new account every time!
            transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false, 
                auth: {
                    user: 'mario.runte@ethereal.email',
                    pass: 'hT8TqWJ5hJkxHj2TjT'
                },
            });
        }

        const senderEmail = process.env.EMAIL_USER || 'noreply@algoforge.local';

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: '"AlgoForge Team 👻" <' + senderEmail + '>',
            to: options.email,
            subject: options.subject,
            html: options.message,
        });

        console.log("Message sent: %s", info.messageId);
        
        // If we used the fake testing account, print the preview URL
        if (!process.env.EMAIL_USER) {
            console.log("==========================================");
            console.log("✉️  EMAIL PREVIEW URL: %s", nodemailer.getTestMessageUrl(info));
            console.log("==========================================");
        }

        return true;
    } catch (error) {
        console.error("Email sending failed:", error);
        return false;
    }
};

module.exports = sendEmail;
