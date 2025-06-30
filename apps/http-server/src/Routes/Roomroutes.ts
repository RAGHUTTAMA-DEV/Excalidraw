import  express from "express"
import { Createroom, GetRoom, DeleteRoom, UpdateRoom, JoinRoom,GetCanvas,SaveCanvas } from "../Controller/RoomControllers.js"
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
router.post('/:id/save',asyncHandler(middleware),asyncHandler(JoinRoom));
router.post('/join/:id', asyncHandler(middleware), asyncHandler(SaveCanvas));
router.get('/canvas/:id', asyncHandler(middleware), asyncHandler(GetCanvas));

export default router