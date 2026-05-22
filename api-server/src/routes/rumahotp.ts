import { Router } from "express";
import axios from "axios";

const router = Router();

const BASE_URL = "https://www.rumahotp.io/api";
const API_KEY = process.env.RUMAHOTP_API_KEY;

const headers = {
  "x-apikey": API_KEY ?? "",
  Accept: "application/json",
};

router.get("/rumahotp/balance", async (req, res) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/v1/user/balance`, { headers });
    res.json({ success: true, balance: data?.balance ?? data?.data?.balance ?? 0, data });
  } catch (err: unknown) {
    req.log.error({ err }, "Failed to get balance");
    res.status(500).json({ success: false, error: "Failed to fetch balance" });
  }
});

router.get("/rumahotp/services", async (req, res) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/v2/services`, { headers });
    res.json({ success: true, data: data?.data ?? data ?? [] });
  } catch (err: unknown) {
    req.log.error({ err }, "Failed to get services");
    res.status(500).json({ success: false, data: [] });
  }
});

router.get("/rumahotp/countries", async (req, res) => {
  const { service_id } = req.query as { service_id: string };
  if (!service_id) {
    res.status(400).json({ success: false, data: [] });
    return;
  }
  try {
    const { data } = await axios.get(`${BASE_URL}/v2/countries`, {
      headers,
      params: { service_id },
    });
    res.json({ success: true, data: data?.data ?? data ?? [] });
  } catch (err: unknown) {
    req.log.error({ err }, "Failed to get countries");
    res.status(500).json({ success: false, data: [] });
  }
});

router.get("/rumahotp/operators", async (req, res) => {
  const { country, provider_id } = req.query as { country: string; provider_id: string };
  if (!country || !provider_id) {
    res.status(400).json({ success: false, data: [] });
    return;
  }
  try {
    const { data } = await axios.get(`${BASE_URL}/v2/operators`, {
      headers,
      params: { country, provider_id },
    });
    res.json({ success: true, data: data?.data ?? data ?? [] });
  } catch (err: unknown) {
    req.log.error({ err }, "Failed to get operators");
    res.status(500).json({ success: false, data: [] });
  }
});

router.get("/rumahotp/orders/create", async (req, res) => {
  const { number_id, provider_id, operator_id } = req.query as {
    number_id: string;
    provider_id: string;
    operator_id?: string;
  };
  if (!number_id || !provider_id) {
    res.status(400).json({ success: false, error: "Missing required params" });
    return;
  }
  try {
    const params: Record<string, string> = { number_id, provider_id };
    if (operator_id && operator_id !== "any") {
      params.operator_id = operator_id;
    }
    const { data } = await axios.get(`${BASE_URL}/v2/orders`, { headers, params });
    res.json({
      success: true,
      order_id: data?.order_id ?? data?.data?.order_id,
      number: data?.number ?? data?.data?.number,
      status: data?.status ?? data?.data?.status,
      expired: data?.expired ?? data?.data?.expired,
      data,
    });
  } catch (err: unknown) {
    req.log.error({ err }, "Failed to create order");
    res.status(500).json({ success: false, error: "Failed to create order" });
  }
});

router.get("/rumahotp/orders/status", async (req, res) => {
  const { order_id } = req.query as { order_id: string };
  if (!order_id) {
    res.status(400).json({ success: false, status: "unknown" });
    return;
  }
  try {
    const { data } = await axios.get(`${BASE_URL}/v1/orders/get_status`, {
      headers,
      params: { order_id },
    });
    res.json({
      success: true,
      otp: data?.otp ?? data?.data?.otp ?? null,
      sms: data?.sms ?? data?.data?.sms ?? null,
      status: data?.status ?? data?.data?.status ?? "pending",
      data,
    });
  } catch (err: unknown) {
    req.log.error({ err }, "Failed to get order status");
    res.status(500).json({ success: false, status: "unknown", otp: null, sms: null });
  }
});

router.get("/rumahotp/orders/cancel", async (req, res) => {
  const { order_id } = req.query as { order_id: string };
  if (!order_id) {
    res.status(400).json({ success: false, message: "Missing order_id" });
    return;
  }
  try {
    const { data } = await axios.get(`${BASE_URL}/v1/orders/set_status`, {
      headers,
      params: { order_id, status: "cancel" },
    });
    res.json({ success: true, message: "Order cancelled", data });
  } catch (err: unknown) {
    req.log.error({ err }, "Failed to cancel order");
    res.status(500).json({ success: false, message: "Failed to cancel order" });
  }
});

export default router;
