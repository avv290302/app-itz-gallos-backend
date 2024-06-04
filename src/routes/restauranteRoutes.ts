import express, {Request, Response} from "express";
import multer from "multer";
import restauranteController from "../controllers/restauranteController";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateRestauranteRequest } from "../middleware/validation";
import { param } from "express-validator";


const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1040 * 1024, //5mb
    }
})

//Rutas para el restaurante

//Ruta para obtener los datos de restaurante
router.get('/',
    jwtCheck,
    jwtParse,
    restauranteController.getRestaurante);

router.post("/", 
jwtCheck,
jwtParse,
upload.single("imageFile"), 
validateRestauranteRequest,
restauranteController.createRestaurante
);

//Ruta para actualizar un restaurante
router.put("/",
    jwtCheck,
    jwtParse,
    upload.single("imageFile"),
    validateRestauranteRequest,
    restauranteController.updateRestaurante
);

//Ruta para buscar un restaurante
router.get("/search/:city",
    param("city").isString()
    .trim()
    .notEmpty()
    .withMessage("El paramentro ciudad debe ser un string valido"),
     restauranteController.searchRestaurante
);

export default router;