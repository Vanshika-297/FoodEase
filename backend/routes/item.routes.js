import express from "express"

import isAuth from "../middlewares/isAuth.js"
import { addItem,deleteItem,editItem, getItemByCity, getItembyId } from "../controllers/item.controllers.js"
import {upload} from "../middlewares/multer.js"

const itemRouter=express.Router()
itemRouter.post("/add-item",isAuth,upload.single("image"),addItem)
itemRouter.post("/edit-item/:itemId",isAuth,upload.single("image"),editItem)
itemRouter.get("/get-by-id/:itemId",isAuth,getItembyId)
itemRouter.get("/delete/:itemId",isAuth,deleteItem)
itemRouter.get("/get-by-city/:city",isAuth,getItemByCity)

export default itemRouter