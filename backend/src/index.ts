import { Hono } from 'hono';
import {userRouter} from "./routes/user";
import {blogRouter} from "./routes/blog";
import {verify} from "hono/jwt";

const app=new Hono<{
    Bindings:{
        JWT_SECRET:string,
        DATABASE_URL:string
    },
    Variables:{
        userId:string
    }
}>().basePath('/api/v1')



app.route('/user',userRouter)
app.route('/blog',blogRouter)

export default app







