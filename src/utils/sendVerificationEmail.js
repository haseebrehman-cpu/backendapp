import jwt from 'jsonwebtoken';
import transporter from '../config/mailer.js';

const sendVerificationEmail = async (user) => {
  const token = jwt.sign(
    { id: user.id, type: 'email_verification' },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  const baseUrl = process.env.APP_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
  const verificationUrl = `${baseUrl}/api/v1/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: user.email,
    subject: 'Verify your email address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Welcome, ${user.name}!</h2>
        <p>Please verify your email address to activate your account.</p>
        <p>
          <a href="${verificationUrl}"
             style="display:inline-block;padding:12px 20px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:6px;">
            Verify Email
          </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p style="color:#888;font-size:12px;">This link expires in 24 hours.</p>
      </div>
    `,
  });
};

const sendProductAddedEmail = async (product) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: product.addedBy.email,
    subject: 'Product Added Successfully',
    html: `
  <div style="
    background-color: #f4f7fb;
    padding: 40px 20px;
    font-family: Arial, sans-serif;
  ">
    <div style="
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    ">

      <!-- Header -->
      <div style="
        background: linear-gradient(135deg, #2563eb, #1e40af);
        padding: 24px;
        text-align: center;
      ">
        <h1 style="
          color: #ffffff;
          margin: 0;
          font-size: 24px;
          font-weight: bold;
        ">
          New Product Added
        </h1>
      </div>

      <!-- Body -->
      <div style="padding: 32px;">

        <p style="
          color: #374151;
          font-size: 16px;
          margin-bottom: 24px;
        ">
          A new product has been successfully added to the database.
        </p>

        <!-- Product Card -->
        <div style="
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 20px;
          background-color: #f9fafb;
        ">

          <div style="margin-bottom: 16px;">
            <span style="
              font-weight: bold;
              color: #111827;
            ">
              Product Name:
            </span>

            <span style="color: #4b5563;">
              ${product.name}
            </span>
          </div>

          <div style="margin-bottom: 16px;">
            <span style="
              font-weight: bold;
              color: #111827;
            ">
              Description:
            </span>

            <span style="color: #4b5563;">
              ${product.description}
            </span>
          </div>

          <div style="margin-bottom: 16px;">
            <span style="
              font-weight: bold;
              color: #111827;
            ">
              Price:
            </span>

            <span style="
              color: #059669;
              font-weight: bold;
            ">
              $${product.price}
            </span>
          </div>

          <div style="margin-bottom: 16px;">
            <span style="
              font-weight: bold;
              color: #111827;
            ">
              Quantity:
            </span>

            <span style="color: #4b5563;">
              ${product.quantity}
            </span>
          </div>

          <div style="margin-bottom: 16px;">
            <span style="
              font-weight: bold;
              color: #111827;
            ">
              Category:
            </span>

            <span style="
              background-color: #dbeafe;
              color: #1d4ed8;
              padding: 4px 10px;
              border-radius: 20px;
              font-size: 13px;
              font-weight: bold;
            ">
              ${product.category}
            </span>
          </div>

          <div>
            <span style="
              font-weight: bold;
              color: #111827;
            ">
              Added By:
            </span>

            <span style="color: #4b5563;">
              ${product.addedBy.name}
            </span>
          </div>

        </div>

      </div>

      <!-- Footer -->
      <div style="
        padding: 20px;
        background-color: #f9fafb;
        text-align: center;
        border-top: 1px solid #e5e7eb;
      ">
        <p style="
          margin: 0;
          color: #6b7280;
          font-size: 13px;
        ">
          This is an automated notification from your inventory system.
        </p>
      </div>

    </div>
  </div>
`
  })
}

export { sendVerificationEmail, sendProductAddedEmail };
