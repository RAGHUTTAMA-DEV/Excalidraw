import express from "express"
import { Login,Logout,Getme,Register } from "../Controller/AuthControllers.js";
import middleware from "../middleware/middleware.js";
const router=express.Router();


router.post("/login",Login)

router.post("/register",Register)

router.post("/logout",Logout)

router.get("/getme",middleware,Getme)

export default router;