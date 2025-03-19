const nodemailer = require('nodemailer');

const mailSender =  async(email,title,body) =>{
    try{
        //create Transporter
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS
            }
        });

        //define sendMail function
        const info = await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: email,
            subject:`${title}`,
            html:`${body}`
        });
        console.log("mail info",info);

        return info;
    }
    catch(err){
        // console.log(err.message);
    }
}

module.exports = mailSender;