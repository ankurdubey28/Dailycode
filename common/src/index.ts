import z from 'zod'

export const SignUp=z.object({
username:z.string().email(),
    password:z.string().min(6),
    name:z.string().optional()
})

export const SignIn=z.object({
    username:z.string().email(),
    password:z.string().min(6),
})

export const CreatePost=z.object({
    title:z.string(),
    content:z.string(),
})

export const UpdatePost=z.object({
    title:z.string(),
    content:z.string(),
    id:z.number()
})

export type singUp=z.infer<typeof SignUp>
export type singIn=z.infer<typeof SignIn>
export  type createPost=z.infer<typeof CreatePost>
export type updatePost=z.infer<typeof UpdatePost>