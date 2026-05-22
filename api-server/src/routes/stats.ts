import { Router } from "express";

const router = Router();

router.get("/stats/platform", async (req, res) => {
  try {
    const projectId =
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "malzz-ganteng";

    // Use Firestore REST API to count documents (no service account needed for public collections)
    // This fetches limited data — frontend will supplement with real-time Firestore listeners
    const headers = { "Content-Type": "application/json" };

    const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

    const [usersRes, ordersRes, depositsRes] = await Promise.allSettled([
      fetch(`${baseUrl}/users?pageSize=1`, { headers }),
      fetch(`${baseUrl}/orders?pageSize=1`, { headers }),
      fetch(`${baseUrl}/deposits?pageSize=1`, { headers }),
    ]);

    // We can't efficiently count via REST without aggregation — return placeholder stats
    // Frontend Firestore SDK will provide accurate real-time counts via aggregation queries
    res.json({
      success: true,
      totalUsers: 0,
      totalOrders: 0,
      totalDeposits: 0,
      totalSuccessOrders: 0,
    });
  } catch (err: unknown) {
    req.log.error({ err }, "Failed to get platform stats");
    res.json({
      success: true,
      totalUsers: 0,
      totalOrders: 0,
      totalDeposits: 0,
      totalSuccessOrders: 0,
    });
  }
});

export default router;
