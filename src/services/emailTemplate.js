export const emailTemplate = (emailSubject, name, body) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Inter', sans-serif;
      background-color: #f4f4f9;
      color: #333333;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #6a11cb, #2575fc);
      color: #ffffff;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: 600;
      letter-spacing: -0.5px;
    }
    .content {
      padding: 30px;
    }
    .content p {
      margin: 20px 0;
      font-size: 16px;
      line-height: 1.6;
      color: #555555;
    }
    .highlight {
      color: #6a11cb;
      font-weight: 600;
    }
    .footer {
      background-color: #f9f9f9;
      text-align: center;
      padding: 20px;
      font-size: 14px;
      color: #777777;
      border-top: 1px solid #eeeeee;
    }
     .otp-box {
      margin: 20px 0;
      padding: 15px;
      background-color: #ffe5d9;
      border-radius: 8px;
      text-align: center;
      font-size: 24px;
      font-weight: bold;
      color: #000;  
      letter-spacing: 4px;
    }
    .footer a {
      color: #6a11cb;
      text-decoration: none;
      font-weight: 500;
    }
    .footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>${emailSubject}</h1>
    </div>
    <div class="content">
      <p>Hi <span class="highlight">${name}</span>,</p>
      ${body}
    </div>
    <div class="footer">
      <p>&copy; 2024 Social Media. All rights reserved.</p>
      <p><a href="#">Unsubscribe</a> | <a href="#">Privacy Policy</a></p>
    </div>
  </div>
</body>
</html>
`;