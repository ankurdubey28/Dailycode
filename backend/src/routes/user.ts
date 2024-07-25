import {sign, verify} from "hono/jwt";
import {PrismaClient} from "@prisma/client/edge";
import {withAccelerate} from "@prisma/extension-accelerate";

import {Hono} from "hono";

export const userRouter=new Hono<{
    Bindings:{
        JWT_SECRET:string,
        DATABASE_URL:string
    },
    Variables:{
        userId:string
    }
}>()

userRouter.use('/api/v1/blog/*', async (c, next) => {
    const jwt = c.req.header('Authorization');
    if (!jwt) {
        c.status(401);
        return c.json({ error: "unauthorized" });
    }
    const token = jwt.split(' ')[1];
    const payload = await verify(token, c.env.JWT_SECRET);
    if (!payload) {
        c.status(401);
        return c.json({ error: "unauthorized" });
    }
    c.set('userId', payload.id);
    await next()
})

userRouter.post('/signup', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());
    const body=await c.req.json()
    try {
        const user = await prisma.user.create({
            data: {
                email: body.email,
                password: body.password
            }
        });
        const jwt=await sign({id:user.id},c.env.JWT_SECRET)
        return c.json({
            JWT:jwt
        },200);
    } catch(e:any) {
        console.log(e.type)
        return c.json({
            msg:"error while signing up"
        },403)
    }
})

userRouter.post('/signin', async (c) => {
    const prisma=new PrismaClient({
        datasourceUrl:c.env?.DATABASE_URL
    }).
    $extends(withAccelerate())
    const body=await c.req.json()

    const user=await prisma.user.findUnique({
        where:{
            email:body.email,
            password:body.password
        }
    })
    if(!user){
        return c.json({
            msg:"user not found"
        },404)
    }
    const jwt=sign({id:user.id},c.env.JWT_SECRET)
    return c.json({
        JWT:jwt
    },200)
})