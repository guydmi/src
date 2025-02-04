import { PrismaClient } from '@prisma/client'
import cors from 'cors'
import express from 'express'

const prisma = new PrismaClient()
const app = express()

app.use(express.json())
app.use(cors())

app.get('/drafts', async (req, res) => {
  const posts = await prisma.post.findMany({
    where: { published: false },
    include: { author: true }
  })
  res.json(posts)
})

app.get('/feed', async (req, res) => {
  const posts = await prisma.post.findMany({
    where: { published: true },
    include: { author: true }
  })
  res.json(posts)
})

app.get('/filterPosts', async (req, res) => {
  const { searchString }: { searchString?: string } = req.query;
  const filteredPosts = await prisma.post.findMany({
    where: {
      OR: [
        {
          title: {
            contains: searchString,
          },
        },
        {
          content: {
            contains: searchString,
          },
        },
      ],
    },
  })
  res.json(filteredPosts)
})

app.post(`/post`, async (req, res) => {
  const { title, content, authorEmail } = req.body
  const result = await prisma.post.create({
    data: {
      title,
      content,
      published: false,
      author: { connect: { email: authorEmail } },
    },
  })
  res.json(result)
})

app.delete(`/post/:id`, async (req, res) => {
  const { id } = req.params
  const post = await prisma.post.delete({
    where: {
      id: Number(id),
    },
  })
  res.json(post)
})

app.get(`/post/:id`, async (req, res) => {
  const { id } = req.params
  const post = await prisma.post.findUnique({
    where: {
      id: Number(id),
    },
    include: { author: true, comments:{include: {author: true}} }
  })
  res.json(post)
})

app.put('/publish/:id', async (req, res) => {
  const { id } = req.params
  const post = await prisma.post.update({
    where: { id: Number(id) },
    data: { published: true },
  })
  res.json(post)
})

app.post(`/user`, async (req, res) => {
  const result = await prisma.user.create({
    data: {
      ...req.body,
    },
  })
  res.json(result)
})

app.post(`/signin`, async (req, res) => {
  const {username} = req.body
  const result = await prisma.signin.create({
    data: {
      username: username,
    },
  })
  res.json(result)
})

app.get(`/signin`, async (req, res) => {
  const suppr = await prisma.signin.deleteMany({})
  const post = await prisma.signin.findMany({
    where: {
      id: Number()
    },
  })
  res.json(post)
})

app.get(`/users`, async (req, res) => {
  const { email } = req.query
  let user = await prisma.user.findUnique({
    where: {
      email: String(email)
    }
  })
  res.json({userFound: user!=null})
})

app.post(`/comment`, async (req, res) => {
  const { content, username, postId } = req.body
  const result = await prisma.comments.create({
    data: {
      content,
      author: { connect: { email: username } },
      post: {connect: {id: postId } },
    },
  })
  res.json(result)
})

app.get(`/post/:id/comment`, async (req, res) => {
  const { id } = req.params
  const post = await prisma.comments.findMany({
    where: {
      postId: Number(id),
    },
    include: { author: true }
  })
  res.json(post)
})

app.post('/auth', async (req, res) => {
  const email = req.body.username
  const users = await prisma.user.findUnique({
    where: {
      email: email
    }
  })
  res.json(users)
})

const server = app.listen(3001, () =>
  console.log(
    '🚀 Server ready at: http://localhost:3001',
  ),
)
