import { Request, Response, response } from  'express';
import Restaurante from '../models/restauranteModel';
import cloudinary from 'cloudinary';
import mongoose from 'mongoose';


//Funcion para obtener los datos de un restaurante
const getRestaurante = async (req: Request, res: Response) => {
    try{
        const restaurante = await Restaurante.findOne({ user: req.userId });
        if(!restaurante) {
            console.log("Restaurante no encontrado");
            return res.status(404)
            .json({message: "Restaurante no encontrado"})
        }
        res.json(restaurante);

    }catch (error) {
        console.log(error);
        res.status(500).json({message: 'Error al obtener los datos del restaurante'})
    }
}//Fin de getRestaurante

//Funcion para crear un restaurante
const createRestaurante = async (req: Request, res: Response) => {
    console.log("crear restaurante");
    try{
        const existingRestaurante = await Restaurante.findOne({ user: req.userId });
        
        if (existingRestaurante) {
            return res.status(409)
            .json({ message: "El restaurante para este usuario ya existe"})
        }

        const imageUrl = await uploadImage(req.file as Express.Multer.File);
        //console.log(imageUrl);
        //Creamos una url de cloudinary para la imagen del restaurante
        const restaurante = new Restaurante(req.body)
        restaurante.imageUrl = imageUrl;
        restaurante.user = new mongoose.Types.ObjectId(req.userId);
        restaurante.lastUpdated = new Date();

        await restaurante.save();
        res.status(201).send(restaurante);
    } catch (error) {
        console.log(req.body, req.file);
        res.status(500).json({Message: 'Error al crear el restaurante'})
    }
}//Fin de createRestaurante

//Funcion para actualizar un restaurante
const updateRestaurante = async (req: Request, res: Response) => {
    try {
        const restaurante = await Restaurante.findOne({ user: req.userId });
        if(!restaurante) {
            return res.status(404)
            .json({ message: "Restaurante no encontrado"})
        }

        restaurante.restauranteName = req.body.restauranteName;
        restaurante.city = req.body.city;
        restaurante.country = req.body.country;
        restaurante.deliveryPrice = req.body.deliveryPrice;
        restaurante.estimatedDeliveryTime = req.body.estimatedDeliveryTime;
        restaurante.cuisines = req.body.cuisines;
        restaurante.menuItems = req.body.menuItems;
        restaurante.lastUpdated = new Date();

        if(req.file){
            const imageUrl = await uploadImage(req.file as Express.Multer.File);
            restaurante.imageUrl = imageUrl;
        }    

        await restaurante.save();
        res.status(200).send(restaurante);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: 'Error al actualizar el restaurante'})
       }

}//Fin de updateRestaurante

const uploadImage = async (file: Express.Multer.File) => {
        //Creamos una url de cloudinary para la imagen del restaurante
        const image = file;

        //Convertimos el objeto de la imagen a un objeto base 64 para poderlo
        //almacenar como imagen en Cloudinary
        const base64Image = Buffer.from(image.buffer).toString("base64");
        const dataUri = "data:" + image.mimetype + ";base64," + base64Image;

        //Subimos la imagen a Cloudinary
        const uploadResponse = await cloudinary.v2.uploader.upload(dataUri);

        //Retornamos la url de la imagen en cloudinary
        return uploadResponse.url;
    } //Fin de uploadImage

const searchRestaurante = async (req: Request, res: Response) => {
    try {
        const city = req.params.city;
        const searchQuery = (req.query.searchQuery as string) || "";
        const selectedCuisines = (req.query.selectedCuisines as string) || "";
        const sortOptions = (req.query.sortOptions as string) || "lastUpdated";
        const page = parseInt(req.query.page as string) || 1;
        
           let query: any = {};

           //Esta query se va a utilizar para buscar por ciudad
           //sin diferenciar mayusculas o minusculas
           //zacatecas = Zacatecas
           query["city"] = new RegExp(city, "i");

           //obtenemos las cuidades en la base de datos
           const cityCheck = await Restaurante.countDocuments(query)
           if (cityCheck === 0) {
            return res.status(404).json({
                data: [],
                pagination: {
                    total: 0,
                    page : 1,
                    pages: 1
                }
            });

           }

           //Si existen cocinas en los parametros de busqueda
           //las convertimos del texto a un arreglo
           if (selectedCuisines) {
                const cuisinesArray =
                        selectedCuisines.split(',')
                                        .map( (cuisine)=> new RegExp(cuisine, "i"))
                query["cuisines"] = {$all: cuisinesArray}
           }

           //Por ejemplo, si en la query tenemos:
           // restauranteName= AppITZ Food
           //cuisines = [pizza, pasta, italian]
           // searchQuery= Pasta
           //La busqueda regresaria el restaurante APITZ Food, dado que
           //contiene la palabra pasta en su tipo de cocina
           if (searchQuery) {
            const searchRegex = new RegExp(searchQuery, "i");
            query["$or"] = [
                { restauranteName: searchRegex },
                { cuisines: {$in: [searchRegex] } }
            ]
           }
           //Tendrriamos 10 restaurantes por pagina de busqueda
           const pageSize = 10;

           //skip sirve para irnos a primer restaurante de cada pagina,
           //por ejemplo la pagina 1, tiene del 0 al 10,
           //la pagina 2 del 11 al 19
           //la pagina 3 del 20 al 29
           const skip = (page - 1) * pageSize

           const restaurants = await Restaurante.find(query)
           .sort({ [sortOptions]: 1})
           .skip(skip)
           .limit(pageSize)
           .lean() //se utiliza para recibir objetos JS

           const total = await Restaurante.countDocuments(query);
           const response = {
            data: restaurants,
            pagination: {
                total,
                page,
                //Por ejemplo, si tenemos 50 resultados
                //pageSize=10,
                //Al dividir 50/10 = paginas
                pages: Math.ceil(total / pageSize)
            }
           };

           res.json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: 'Error al buscar el restaurante'})
    }
}//Fin de searchRestaurante
export default {
    getRestaurante,
    createRestaurante,
    updateRestaurante,
    searchRestaurante
}
