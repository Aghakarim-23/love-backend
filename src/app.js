import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";


const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);



app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>API Status</title>
        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8fafc;
            font-family: system-ui, sans-serif;
            color: #0f172a;
          }

          .card {
            background: white;
            padding: 48px;
            border-radius: 16px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 8px 30px rgba(0,0,0,0.04);
            text-align: center;
            max-width: 440px;
            width: 90%;
          }

          .icon {
            font-size: 42px;
            margin-bottom: 16px;
          }

          h1 {
            font-size: 24px;
            margin: 0 0 12px;
          }

          p {
            color: #64748b;
            font-size: 14px;
          }

          .status {
            display: inline-block;
            margin-top: 18px;
            padding: 8px 16px;
            background: #dcfce7;
            color: #15803d;
            border-radius: 30px;
            font-size: 13px;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">🚀</div>
          <h1>API is working!</h1>
          <p>Your Express.js backend is running successfully.</p>
          <span class="status">● Server Online</span>
        </div>
      </body>
    </html>
  `);
});


export default app;