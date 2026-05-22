import { Router } from "express";
import axios from "axios";

const router = Router();

const BASE_URL = "https://www.rumahotp.io/api";
const API_KEY = process.env.RUMAHOTP_API_KEY;
const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID;

const headers = {
  "x-apikey": API_KEY ?? "",
  Accept: "application/json",
};

router.get("/withdraw/check-rekening", async (req, res) => {
  const { bank_code, account_number } = req.query as {
    bank_code: string;
    account_number: string;
  };
  if (!bank_code || !account_number) {
    res.status(400).json({ success: false, account_name: "" });
    return;
  }
  try {
    const { data } = await axios.get(`${BASE_URL}/v1/h2h/check/rekening`, {
      headers,
      params: { bank_code, account_number },
    });
    res.json({
      success: true,
      account_name: data?.account_name ?? data?.data?.account_name ?? "",
      data,
    });
  } catch (err: unknown) {
    req.log.error({ err }, "Failed to check rekening");
    res.status(500).json({ success: false, account_name: "" });
  }
});

router.get("/withdraw/list-rekening", async (req, res) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/v1/h2h/list/rekening`, { headers });
    res.json({ success: true, data: data?.data ?? data ?? [] });
  } catch (err: unknown) {
    req.log.error({ err }, "Failed to list rekening");
    res.status(500).json({ success: false, data: [] });
  }
});

router.get("/withdraw/create", async (req, res) => {
  const { target, id, user_uid } = req.query as {
    target: string;
    id: string;
    user_uid: string;
  };

  if (!target || !id || !user_uid) {
    res.status(400).json({ success: false, error: "Missing required params" });
    return;
  }

  // Only admin can create withdrawals
  if (user_uid !== ADMIN_UID) {
    res.status(403).json({ success: false, error: "Forbidden" });
    return;
  }

  try {
    const { data } = await axios.get(`${BASE_URL}/v1/h2h/transaksi/create`, {
      headers,
      params: { target, id },
    });
    res.json({
      success: true,
      transaksi_id: data?.transaksi_id ?? data?.data?.transaksi_id ?? "",
      status: data?.status ?? data?.data?.status ?? "pending",
      data,
    });
  } catch (err: unknown) {
    req.log.error({ err }, "Failed to create withdraw");
    res.status(500).json({ success: false, error: "Failed to create withdraw" });
  }
});

router.get("/withdraw/status", async (req, res) => {
  const { transaksi_id } = req.query as { transaksi_id: string };
  if (!transaksi_id) {
    res.status(400).json({ success: false, status: "unknown" });
    return;
  }
  try {
    const { data } = await axios.get(`${BASE_URL}/v1/h2h/transaksi/status`, {
      headers,
      params: { transaksi_id },
    });
    res.json({
      success: true,
      status: data?.status ?? data?.data?.status ?? "unknown",
      data,
    });
  } catch (err: unknown) {
    req.log.error({ err }, "Failed to get withdraw status");
    res.status(500).json({ success: false, status: "unknown" });
  }
});

export default router;
