import { Router, type IRouter } from "express";
import healthRouter from "./health";
import rumahOtpRouter from "./rumahotp";
import depositRouter from "./deposit";
import withdrawRouter from "./withdraw";
import statsRouter from "./stats";
import markupRouter from "./markup";

const router: IRouter = Router();

router.use(healthRouter);
router.use(rumahOtpRouter);
router.use(depositRouter);
router.use(withdrawRouter);
router.use(statsRouter);
router.use(markupRouter);

export default router;
