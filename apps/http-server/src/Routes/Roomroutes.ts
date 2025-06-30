import  express from "express"
import { Createroom, GetRoom, DeleteRoom, UpdateRoom, JoinRoom } from "../Controller/RoomControllers.js"
import middleware from "../middleware/middleware.js"
import type { Request, Response, NextFunction } from "express";
const router = express.Router()

router.get("/:id",GetRoom)
router.post('/',Createroom)
router.delete('/:id',DeleteRoom )
router.patch('/:id',UpdateRoom)

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction): Promise<void> => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

router.post('/join/:id', asyncHandler(middleware), asyncHandler(JoinRoom));

export default router