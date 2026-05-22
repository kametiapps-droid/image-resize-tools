import { Router, type IRouter } from "express";
import healthRouter from "./health";
import toolsRouter from "./tools";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(toolsRouter);
router.use(statsRouter);

export default router;
