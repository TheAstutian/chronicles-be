const express = require('express');
const router= express.Router(); 
const bcrypt = require ('bcrypt')
const {BSON, ObjectId} = require( 'mongodb')
require("dotenv").config()
 
const {Users, Posts} = require ('./models')

/*{
    id: 9,
    title: "The King of Bollywood: Shah Rukh Khan",
    slug: "shah-rukh-khan",
    category: "Film & Entertainment",
    image: "https://variety.com/wp-content/uploads/2024/08/Shah-Rukh-Khan-Locarno1.jpg",
    tags:["none"],
    content:"Not available",
    date: '2024-02-15',
  }*/

    //home page. fetch all posts
router.get('/', async(req,res)=>{
    
    try{
        const data = await Posts.find().then(result=>{
            if(!result){
                res.json({
                    status:"FAILED", 
                    message: "An error occurred while fetching"
                })
            } else if (result){
                let a = result
                let reversed = [...a].reverse();
                res.json({
                    status: "SUCCESS", 
                    data: reversed
                })
                
            }
        })

    }catch(err){
        console.log(err)
    }
 
})

//fetch sidebar items 
router.get('/sidebar', async(req,res)=>{
    try{
        const data = await Posts.find().then(result=>{
            
            let sidebar=[];
            for(let i=0; i<3; i++){
                sidebar.push(result[Math.floor(Math.random() * result.length) + 1])
            }
            res.json({
                status: "SUCCESS",
                data: sidebar
            })
        })
        

    }catch(err){
        console.log(err)
    }
})

//add new post
router.post('/write', async (req,res)=>{
    let { title, slug, category, image, tags, content} = req.body;     

    Posts.find({slug}).then(post=>{
        if(post.length){
            res.json({
                status: "FAILED",
                message: "Duplicate post"
            })
            return
        } else {   
                const generateID = (length)=>{
                    const id = Math.random().toString(8).slice(2);
                    const uid = [...Array(length)].reduce((r)=>{
                        return r+id[~~(Math.random()*id.length)]
                    },'')
                    return uid
                }

                const newPost = new Posts({
                    id:  generateID(8),
                    title,
                    slug,
                    category,
                    image,
                    tags,
                    content,
                    date: Date.now(), 
                })

                newPost.save().then(result=>{
                    
                    res.json({
                        status: "SUCCESS", 
                        message: "New post added successfully",
                        data: result
                    })
                }).catch((err)=>{
                    console.log(err)
                    res.json({
                        status: "FAILED", 
                        message: "An error occurred whileadding the post"
                    })
                })
                 
        }
    }) 

   
    
})

//fetch single post 
router.get('/posts/:id', async (req,res)=>{

    try{
        const idQuery = new ObjectId(req.params.id) 
        if (idQuery){
            Posts.findOne({
                _id: idQuery,
            }).then(result=>{
                if(!result){
                    res.json({
                        status: "FAILED",
                        message: "Post not found"
                    })
                } else if (result){
                    res.json({
                        status: "SUCCESS", 
                        data: result 
                    })
                }
            })
        } else {
            res.json({
                status: "FAILED", 
                message: "invalid url"
            })
        } 
        
    }catch(err){
        console.log(err)
        res.json({
            status: "FAILED", 
            message: "An error occurred",
            
        })
    }

})

//edit single post
router.put('/edit/:id', async (req,res)=>{
    let { title, slug, category, image, tags, content} = req.body;
    
    try{
        const idQuery = new ObjectId(req.params.id) 
        if(!idQuery){
            res.json({
                status: "FAILED", 
                message: "Error getting IdQuery"
            })
        } else if (idQuery){
            Posts.findOne({_id:idQuery}).then(result=> {
                if(!result){
                    res.json({
                        status: "FAIILED", 
                        message: "Cannot find post in DB"
                    })
                } else if (result){
                    //update item
                    Posts.updateOne(
                        {_id:idQuery }, 
                        {
                            $set:{
                                title,
                                slug,
                                category,
                                image,
                                tags,
                                content
                            }
                        }
                    ).then(result=>{
                        if(!res){
                            res.json({
                                status: "FAILED",
                                message: "Error updating post"
                            })
                        } else if (result){
                            
                            res.json({
                                status: "SUCCESS", 
                                message: "Post successfully updated",
                                
                            })
                        }
                    })
                }
            }
                 
            )
        }

    } catch (err){
        console.log(err)
        res.json({
            status: "FAILED", 
            message: "An error occurred while updating the post"
        })
    }
})

//delete single post 
router.delete('/delete/posts/:id', async (req,res)=>{

    try{
        const postId = req.params.id
        
        if(!ObjectId.isValid(postId)){
            return res.status(400).json({
                message: "Invalid post ID"
            })
        }

        const result = await Posts.deleteOne({_id: new ObjectId(postId)});
        if (result.deletedCount ===0){
            return res.status(404).json({message: 'Post not found'});
        }
        res.json({message: "Post deleted successfully"})
    }catch(err){
        console.log(err)
        res.json({
            status: "FAILED", 
            message: "There was an error deleting the post"
        })
    }

})

//sign up route
router.post('/signup', (req,res)=>{
    let {email, password, username} = req.body.inputs; 
    
    username = username.trim()
    email = email.trim()
    password = password.trim()

    if (username==''|| email ==''|| password==''){
        res.json({
            status: "FAILED", 
            message: "Empty input fields"
        })
    } else if (!/^[a-zA-Z ]*$/.test(username)){
        res.json({
            status: "FAILED",
            message: "Invalid name entered"
        })
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)){
        res.json({
            status: "FAILED", 
            message: "Invalid email address"
        })
    } else if (password.length<8){
        res.json({
            status: "Failed",
            message: "Password too short"
        })
    } else {
        Users.find({email}).then(result=>{
            
            if(result.length){
                res.json({
                    status: "FAILED", 
                    message: "User exists already"
                })
                 
            } else if (!result.length) {
                const saltRounds = 10;
                bcrypt.hash(password, saltRounds).then(hashedPassword=>{
                    const newUser = new Users({
                        username, 
                        email,
                        password: hashedPassword
                    });

                    newUser.save().then(result=>{
                        
                        if (result){
                            res.send({
                                status: "SUCCESS",
                                message: "User created",
                                data: "Congratulations and welcome"
                            })
                        } else if(!result){
                            res.send({
                                status: "FAILED", 
                                message: "Can't save new user"
                            })
                        }
                        
                    }).catch((err)=>{
                        console.log(err)
                        res.send({
                            status: "FAILED",
                            message: "An error occurred while saving new user"
                        })
                    })
                })
            }
        })
    }



    
})

//sign in route
router.post('/login', async (req,res)=>{
    
    let {email, password} = req.body; 
    if(!email || !password){
        res.json({
            status: "FAILED",
            message: "An error occurred accessing the server"
        })
        return 
    }
    
    email = email.trim()
    password = password.trim()

    if(email=="" || password==""){
        res.json({
            status: "FAILED", 
            message: "Empty credentials"
        }) 
        return
    }  

   await Users.find({email}).then(data=>{
    
        if(data.length){
            const hashedPassword = data[0].password 
            bcrypt.compare(password, hashedPassword).then(result=>{
                if(result){
                    const user = {
                        username: data[0].username,
                        email: data[0].email
                    }
                    res.json({
                        status: 'SUCCESS', 
                        message: 'Login successful',
                        data: user
                    })
                }else if (!result){
                    res.json({
                        status: "FAILED", 
                        message: 'Wrong password'
                    })
                    
                }
            })
        } else if (!data.length){
            res.json({
                status: "FAILED", 
                message: "Wrong username and or password"
            })
        } else {
            res.json({
                status: "FAILED", 
                message: "An error occurred"
            })
        }
    })


})





module.exports = router; 