import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { Resend } from 'resend';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.post("/api/send-booking-confirmation", async (req, res) => {
    const { email, phone, reservationId, fullName } = req.body;

    if (!email || !phone || !reservationId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const profileLink = `${req.protocol}://${req.get('host')}/dashboard/${reservationId}`;
    let emailSent = false;
    let whatsappSent = false;
    let errors: string[] = [];

    // Send Email via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.SENDER_EMAIL || 'onboarding@resend.dev',
          to: email,
          subject: 'Your FlyFoil Formosa Booking',
          html: `<p>Hi ${fullName},</p><p>Thank you for booking with FlyFoil Formosa!</p><p>Here is the link to your Flight Deck profile:</p><p><a href="${profileLink}">${profileLink}</a></p>`,
        });
        emailSent = true;
      } catch (error) {
        console.error("Resend error:", error);
        errors.push("Failed to send email");
      }
    } else {
      errors.push("RESEND_API_KEY not configured");
    }

    res.json({ 
      success: true, 
      emailSent, 
      errors: errors.length > 0 ? errors : undefined 
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
