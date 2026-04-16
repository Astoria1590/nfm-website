const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

console.log("SERVER STARTING...");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/send", async (req, res) => {
  console.log("FORM SUBMITTED");

  const { name, email, ministry, message } = req.body;

  let targetEmail;

  if (ministry === "kids") {
    targetEmail = "kidsministry@gmail.com";
  } else if (ministry === "women") {
    targetEmail = "womensministry@gmail.com";
  } else if (ministry === "men") {
    targetEmail = "astoria0951@gmail.com";
  } else {
    targetEmail = "outreach@gmail.com";
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "astoria0951@gmail.com",
      pass: "anhortqwlxekyfhy"
    }
  });

  try {
    await transporter.sendMail({
      from: "New Faith Ministries <astoria1590@gmail.com>",
      replyTo: email,
      to: targetEmail,
      subject: `New Ministry Signup (${ministry})`,
      text: `
Name: ${name}
Email: ${email}
Ministry: ${ministry}

Message:
${message}
      `
    });

    console.log("EMAIL SENT SUCCESSFULLY");
    res.send("Success");

  } catch (err) {
    console.log("EMAIL ERROR:", err);
    res.status(500).send("Error sending email");
  }
});

app.listen(3000, () => {
  console.log("Running on port 3000");
});