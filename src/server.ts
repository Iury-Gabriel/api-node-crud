import { fastifyCors } from "@fastify/cors";
import { PrismaClient } from "@prisma/client";
import fastify from "fastify";

const app = fastify();

const prisma = new PrismaClient();

app.register(fastifyCors, {
    origin: '*'
})

app.post('/users', async (request, reply) => {
    const { name, email, password }: any = request.body;

    const userExists = await prisma.user.findUnique({
        where: {
            email
        }
    })

    if (userExists) {
        return reply.status(409).send({ message: 'User already exists' })
    }

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password
        }
    })

    return reply.status(201).send({ message: 'User created', success: true })
})

app.get('/users', async (request, reply) => {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true
        }
    });

    return reply.status(200).send({ users })
})

app.put('/users/:id', async (request, reply) => {
    const { id }: any = request.params;

    const userId = Number(id);

    const { name, email }: any = request.body;

    const user = await prisma.user.update({
        select: {
            id: true,
            name: true,
            email: true
        },
        where: {
            id: userId
        },
        data: {
            name,
            email
        }
    })

    if (!user) {
        return reply.status(404).send({ message: 'User not found' })
    }

    return reply.status(201).send({ user })
})

app.delete('/users/:id', async (request, reply) => {
    const { id }: any = request.params;

    const userId = Number(id);

    const userExists = await prisma.user.findUnique({
        where: {
            id: userId
        }
    })

    if (!userExists) {
        return reply.status(404).send({ message: 'User not found' })
    }

    const user = await prisma.user.delete({
        where: {
            id: userId
        }
    })

    return reply.status(200).send({ message: 'User deleted' })
})

app.get('/users/:id', async (request, reply) => {
    const { id }: any = request.params;

    const userId = Number(id);

    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },
        select: {
            id: true,
            name: true,
            email: true
        }
    })

    if (!user) {
        return reply.status(404).send({ message: 'User not found' })
    }

    return reply.status(200).send({ user })
})

app.post('/login', async (request, reply) => {
    const { email, password }: any = request.body;

    const user = await prisma.user.findUnique({
        where: {
            email
        }
    })

    if (!user) {
        return reply.status(404).send({ message: 'User not found' })
    }

    if (user.password !== password) {
        return reply.status(401).send({ message: 'Invalid password' })
    }

    return reply.status(200).send({ message: 'Login successful', success: true })
})

app.listen({ port: 3333, host: '0.0.0.0' }).then(() => {
    console.log('HTTP server running')
})

