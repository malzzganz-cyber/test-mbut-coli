import { Router } from "express";
import axios from "axios";

const router = Router();

const BASE_URL = "https://www.rumahotp.io/api";
const API_KEY = process.env.RUMAHOTP_API_KEY;

const headers = {
  "x-apikey": API_KEY ?? "",
  Accept: "application/json",
};

router.get("/deposit/create", async (req, res) => {
  const { amount, user_uid } = req.query as {
    amount: string;
    user_uid: string;
  };
  const numAmount = Number(amount);

  if (!amount || !user_uid || numAmount < 1000) {
    res.status(400).json({ success: false, error: "Minimum deposit is 1000" });
    return;
  }

  try {
    const { data } = await axios.get(`${BASE_URL}/v2/deposit/create`, {
      headers,
      params: { amount: numAmount, payment_id: "qris" },
    });

    const depositId =
      data?.deposit_id ??
      data?.data?.deposit_id ??
      `dep_${Date.now()}`;
    const qrString = data?.qr_string ?? data?.data?.qr_string ?? "";
    const expiredAt = data?.expired_at ?? data?.data?.expired_at ?? "";
    const paymentName =
      data?.payment_name ?? data?.data?.payment_name ?? "QRIS";

    res.json({
      success: true,
      deposit_id: depositId,
      amount: numAmount,
      qr_string: qrString,
      expired_at: expiredAt,
      payment_name: paymentName,
      data,
    });
  } catch (err: unknown) {
    req.log.error({ err }, "Failed to create deposit");
    res.status(500).json({ success: false, error: "Failed to create deposit" });
  }
});

router.get("/deposit/status", async (req, res) => {
  const { deposit_id } = req.query as {
    deposit_id: string;
    user_uid: string;
  };
  if (!deposit_id) {
    res.status(400).json({ success: false, status: "unknown" });
    return;
  }
  try {
    const { data } = await axios.get(`${BASE_URL}/v2/deposit/get_status`, {
      headers,
      params: { deposit_id },
    });
    const status =
      data?.status ?? data?.data?.status ?? "pending";
    res.json({ success: true, status, data });
  } catch (err: unknown) {
    req.log.error({ err }, "Failed to get deposit status");
    res.status(500).json({ success: false, status: "unknown" });
  }
});

router.get("/deposit/cancel", async (req, res) => {
  const { deposit_id } = req.query as { deposit_id: string };
  if (!deposit_id) {
    res.status(400).json({ success: false, message: "Missing deposit_id" });
    return;
  }
  try {
    const { data } = await axios.get(`${BASE_URL}/v1/deposit/cancel`, {
      headers,
      params: { deposit_id },
    });
    res.json({ success: true, message: "Deposit cancelled", data });
  } catch (err: unknown) {
    req.log.error({ err }, "Failed to cancel deposit");
    res.status(500).json({ success: false, message: "Failed to cancel deposit" });
  }
});

export default router;
