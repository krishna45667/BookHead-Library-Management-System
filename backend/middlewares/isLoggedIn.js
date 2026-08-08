const jwt = require('jsonwebtoken')

const isLoggedIn = (req,res,next)=>{
    try{
        if(!req.cookies.token){
            return res.status(401).json({
                message: "Please Login First"
        })
    }
    const data = jwt.verify(req.cookies.token,process.env.JWT_SECRET)
    req.user = data;
    next()
    }
    catch(err){
        return res.status(401).json({
            message: "Invalid or Expired Token"
        })
    }  
}

module.exports = isLoggedIn