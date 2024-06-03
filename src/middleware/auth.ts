import { Request,Response, NextFunction } from "express";
import { auth } from "express-oauth2-jwt-bearer";
import Jwt from "jsonwebtoken";
import User from "../models/userModels";


declare global{
  namespace Express {
    interface Request {
      userId: string,
      auth0Id: string
    }
  }
}//Fin de declare

export const jwtCheck = auth({
    audience: process.env.AUTH0_AUDIENCE,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
    tokenSigningAlg: 'RS256'
  });
  
  export const jwtParse = async (
    req: Request, 
    res: Response, 
    next: NextFunction
  )=>{
    const { authorization } = req.headers;
    
    //Los headers comenzan con una cadena
    //Bearer token, por ejemplo
    //Bearer 123xeslfdkadkñs
    //Por lo tanto es necesario verificar que la authorizacion comience
    //con la cadena Bearer
    if (!authorization || !authorization.startsWith('Bearer')) 
      return res.sendStatus(401)
    .json({message: 'Authorizacion denegada'})

    //Obtenemos el token del header
    //Bearer 1234xeslfdkadkñs
    //  [   0            1       ]
    //split = ["bearer", "1234xeslfdkadkñs"]
    const token = authorization.split(" ")[1];

    try {
      //Analizamos el token para validar que sea correcto
      //Decoded decodifica el token dividiendolo en partes
      const decoded = Jwt.decode(token) as Jwt.JwtPayload
      
      //el elemento sub del token contiene el Id del usuario
      //que inicio sesion en la Api Auth0
      const auth0Id = decoded.sub;

      //Comprobamos que exista el usuario en la base de datos
      const user = await User.findOne({ auth0Id})

      if (!user)
        return res.sendStatus(401).json({ message: 'Authorizacion denegada '})

      req.auth0Id = auth0Id as string;
      req.userId = user._id.toString();
      next();
    } catch (error) {
      return res.sendStatus(401).json({ message: 'Authorizacion denegada'})
    }
  
  }