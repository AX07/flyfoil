import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs/promises";
import { Resend } from 'resend';
import { GoogleGenAI, Type } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.get("/api/weather", async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
      }
      
      const { date, location } = req.query;
      const targetDate = date ? date : 'today';
      const targetLocation = location ? location : 'Cabanas de Tavira, Ria Formosa, Portugal';
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Find the weather and tide forecast for ${targetDate} at ${targetLocation}. Return a JSON object with windSpeed (number in knots), waterTemp (number in Celsius), tideStatus (e.g., 'Rising', 'Falling'), and tideTime (e.g., 'High at 14:30').`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              windSpeed: { type: Type.STRING },
              waterTemp: { type: Type.STRING },
              tideStatus: { type: Type.STRING },
              tideTime: { type: Type.STRING }
            },
            required: ["windSpeed", "waterTemp", "tideStatus", "tideTime"]
          }
        }
      });
      
      if (response.text) {
        const data = JSON.parse(response.text);
        res.json(data);
      } else {
        res.status(500).json({ error: "No response from Gemini" });
      }
    } catch (error) {
      console.error("Failed to fetch weather data:", error);
      res.status(500).json({ error: "Failed to fetch weather data" });
    }
  });

  app.post("/api/send-booking-confirmation", async (req, res) => {
    const { email, phone, reservationId, fullName, date, sessionTime, experience, location } = req.body;

    if (!email || !phone || !reservationId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const profileLink = `${req.protocol}://${req.get('host')}/dashboard/${reservationId}?token=magic_${reservationId}`;
    let emailSent = false;
    let adminEmailSent = false;
    let errors: string[] = [];

    // Send Email via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const senderEmail = process.env.SENDER_EMAIL || 'onboarding@resend.dev';
        const adminEmail = process.env.ADMIN_EMAIL || 'crytoax07@gmail.com';

        // Send to Customer
        await resend.emails.send({
          from: senderEmail,
          to: email,
          subject: 'Your FlyFoil Formosa Booking',
          html: `<p>Hi ${fullName},</p><p>Thank you for booking with FlyFoil Formosa!</p><p>Here is the link to your Flight Deck profile:</p><p><a href="${profileLink}">${profileLink}</a></p>`,
        });
        emailSent = true;

        // Send to Admin
        await resend.emails.send({
          from: senderEmail,
          to: adminEmail,
          subject: `New Booking: ${fullName} - ${date}`,
          html: `
            <h2>New Booking Received</h2>
            <p><strong>Name:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Time:</strong> ${sessionTime}</p>
            <p><strong>Experience:</strong> ${experience}</p>
            <p><strong>Location:</strong> ${location}</p>
            <p><strong>Reservation ID:</strong> ${reservationId}</p>
            <p><a href="${profileLink}">View Dashboard</a></p>
          `,
        });
        adminEmailSent = true;
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
      adminEmailSent,
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
    
    // SPA fallback for development
    app.use('*', async (req, res, next) => {
      try {
        const url = req.originalUrl;
        let template = await fs.readFile(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
