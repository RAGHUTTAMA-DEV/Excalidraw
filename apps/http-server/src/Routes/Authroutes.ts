import express from "express"
import { Login,Logout,Getme,Register } from "../Controller/AuthControllers.js";
const router=express.Router();


router.post("/login",Login)

router.post("/register",Register)

router.post("/logout",Logout)

router.get("/getme",Getme)

export default router;