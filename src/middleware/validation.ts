import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

const handleValidationErrors = async(
     req: Request,
     res: Response,
     next: NextFunction
) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400)
        .json({errors: errors.array()});
    }
    next();
}//Fin de handleValidationErrors

export const validateUserRequest = [
    body("name").isString()
                .notEmpty()
                .withMessage("El nombre debe ser string"),

    body("addressLine1").isString()
                        .notEmpty()
                        .withMessage("La direccion debe ser string"),

    
        
    body("city").isString()
                .notEmpty()
                .withMessage("La ciudad debe ser string"),


    body("country").isString()
                .notEmpty()
                .withMessage("El pais debe ser string"),
handleValidationErrors

];//Fin de validateUserRquest

export const validateRestauranteRequest = [
    body("restauranteName").isString()
                .notEmpty()
                .withMessage("El nombre del restaurante es requerido"),

    body("city").isString()
                .notEmpty()
                .withMessage("La ciudad debe ser requerida"),

    body("country").isString()
                .notEmpty()
                .withMessage("El pais es requerido"),
            
    body("deliveryPrice").isFloat({ min: 0 })
                .withMessage("El precio de entrega debe ser un numero positivo"),
               
    body("estimatedDeliveryTime").isFloat({ min: 0 })
                .withMessage("El  tiempo estimado de etrega debe ser un numero positivo"),

    body("cuisines").isArray()
                .withMessage("El platillo debe ser un arreglo")
                .not()
                .isEmpty()
                .withMessage("El arreglo de platillos no puede estar vacio"),
            
    body("menuItems").isArray()
                .withMessage("Los platillos deben ser un arreglo"),

    body("menuItems.*.name").notEmpty()
                .withMessage("El nombre del item del menu es requerido"),
                
    body("menuItems.*.price").isFloat({ min: 0 })
                .withMessage("El precio del item del menu es requerido y debe ser un numero positivo"),


    handleValidationErrors


];//Fin de validateRestauranteRequest