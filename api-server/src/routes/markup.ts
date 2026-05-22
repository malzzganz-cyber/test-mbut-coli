import { Router } from "express";

const router = Router();

const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID;
const DEFAULT_MARKUP = 800;

const PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "malzz-ganteng";

const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

async function getMarkupFromFirestore(): Promise<{
  markup: number;
  updatedAt: string | null;
}> {
  try {
    const res = await fetch(`${FIRESTORE_BASE}/settings/pricing`);
    if (!res.ok) return { markup: DEFAULT_MARKUP, updatedAt: null };
    const doc = (await res.json()) as {
      fields?: {
        markup?: { integerValue?: string; doubleValue?: string };
        updatedAt?: { stringValue?: string };
      };
    };
    const markup =
      Number(
        doc.fields?.markup?.integerValue ??
          doc.fields?.markup?.doubleValue ??
          DEFAULT_MARKUP,
      ) || DEFAULT_MARKUP;
    const updatedAt = doc.fields?.updatedAt?.stringValue ?? null;
    return { markup, updatedAt };
  } catch {
    return { markup: DEFAULT_MARKUP, updatedAt: null };
  }
}

async function setMarkupInFirestore(markup: number): Promise<string> {
  const updatedAt = new Date().toISOString();
  const body = {
    fields: {
      markup: { integerValue: String(markup) },
      updatedAt: { stringValue: updatedAt },
    },
  };
  const res = await fetch(`${FIRESTORE_BASE}/settings/pricing`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Firestore PATCH failed: ${res.status}`);
  }
  return updatedAt;
}

router.get("/markup", async (req, res) => {
  const { markup, updatedAt } = await getMarkupFromFirestore();
  res.json({ success: true, markup, updatedAt });
});

router.post("/markup", async (req, res) => {
  const { markup, admin_uid } = req.body as {
    markup: number;
    admin_uid: string;
  };

  if (admin_uid !== ADMIN_UID) {
    res.status(403).json({ success: false, markup: DEFAULT_MARKUP });
    return;
  }

  if (typeof markup !== "number" || isNaN(markup) || markup < 0) {
    res.status(400).json({ success: false, markup: DEFAULT_MARKUP });
    return;
  }

  try {
    const updatedAt = await setMarkupInFirestore(markup);
    res.json({ success: true, markup, updatedAt });
  } catch (err: unknown) {
    req.log.error({ err }, "Failed to update markup");
    res.status(500).json({ success: false, markup: DEFAULT_MARKUP });
  }
});

export default router;
