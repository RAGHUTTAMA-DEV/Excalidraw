import  express from "express"
import { Createroom, GetRoom, DeleteRoom, UpdateRoom, JoinRoom, SaveCanvas, GetCanvas } from "../Controller/RoomControllers.js"
import middleware from "../middleware/middleware.js"
import type { Request, Response, NextFunction } from "express";
const router = express.Router()

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction): void => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.get("/:id", GetRoom)
router.post('/', Createroom)
router.delete('/:id', DeleteRoom )
router.patch('/:id', UpdateRoom)

//Canvas routes
router.post('/join/:id', asyncHandler(middleware), asyncHandler(JoinRoom));
router.get('/canvas/:id', asyncHandler(middleware), asyncHandler(GetCanvas));
router.post('/save/:id', asyncHandler(middleware), asyncHandler(SaveCanvas));

export default router