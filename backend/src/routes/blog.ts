
import {Hono} from "hono";
import {withAccelerate} from "@prisma/extension-accelerate";
import {PrismaClient} from "@prisma/client/edge";
import {verify} from "hono/jwt";

export const blogRouter=new Hono<{
    Bindings:{
        JWT_SECRET:string,
        DATABASE_URL:string
    },
    Variables:{
        userId:string
    }
}>()

blogRouter.use('/*',async (c,next)=>{
    const jwt=c.req.header('Authorization')
    if(!jwt){
        return c.json({
            msg:"jwt not found"
        })
    }
    const token=jwt.split('')[1]
    const payload=await verify(token,c.env.JWT_SECRET)
    if(!payload){
        return c.json({
            msg:"unauthorized"
        })
    }
    c.set('userId',payload.id)
    await next()
})
blogRouter.get('/:id', async (c) => {
    const id = c.req.param('id')
    const prisma=new PrismaClient({
        datasourceUrl:c.env?.DATABASE_URL
    }).$extends(withAccelerate())
    const post=await prisma.post.findUnique({
        where:{
            id:id
        }
    })
    return c.json({
        blog:post
    })
})

blogRouter.post('/',async (c)=>{
    const userId=c.get('userId')
    const prisma=new PrismaClient({
        datasourceUrl:c.env?.DATABASE_URL
        }
    ).$extends(withAccelerate())

    const body=await c.req.json()
    const post=await prisma.post.create({
        data:{
            title:body.title,
            content:body.content,
            authorId:userId,
        }
    })
    return c.json({
        id:post.id
    })
})

blogRouter.put('/update/:id', async (c) => {
    const id=c.req.param('id')
    const body=await c.req.json()
    const prisma=new PrismaClient({
        datasourceUrl:c.env?.DATABASE_URL
    }).$extends(withAccelerate())

    prisma.post.update({
        where:{
            id:id,
            authorId:c.get('userId')
        },
        data:{
            title:body.title,
            content:body.content
        }
    })
   return c.json({
       msg:"updated"
   })
})


// pagination
blogRouter.get('/bulk',async (c)=>{
    const prisma=new PrismaClient({
        datasourceUrl:c.env?.DATABASE_URL
    }).$extends(withAccelerate())

    const posts=await prisma.post.findMany({})
    return c.json({
        posts:posts
    })
})