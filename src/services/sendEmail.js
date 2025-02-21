import nodemailer from 'nodemailer'
const sedEmailByNodeMailer=async(subject,html,to)=>{
    const transporter=nodemailer.createTransport({
        service:"gmail",
        auth:{
            user:process.env.EMAIL_SENDER,
            pass:process.env.PASSWORD_FOR_EMAIL_SENDER
        }
        
    })

    const info=await transporter.sendMail({
        from:`"Chat App 👻"<${process.env.EMAIL_SENDER}>`,
        to:to?to:'raneemmagdy2002@gmail.com',
        subject:subject?subject:"Hi....",
        html:html?html:"<h1>Hi.....</h1>",

    })

    if(info.accepted.length)return true
    return false
}

export default sedEmailByNodeMailer