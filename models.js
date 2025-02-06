const mongoose = require ('mongoose')

const Schema = mongoose.Schema; 

const PostsSchema = new Schema ({
    id: Number, 
    title: String, 
    slug: String, 
    category: String, 
    image: String, 
    tags: String, 
    content: String, 
    date: Date, 
})

const UserSchema = new Schema ({
    username: String,
    email: String,
    password: String
})

const Users = mongoose.model('users', UserSchema)
const Posts = mongoose.model('posts', PostsSchema)

module.exports = {Users, Posts}