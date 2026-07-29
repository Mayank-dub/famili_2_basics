const jwt = require('jsonwebtoken');
function authenticateToken(req,res,next){
    const head = req.headers.authorization;
    const token = head && head.split(' ')[1];

    if(!token){
        return res.status(401).json({error:"Access denied"});
    }

    const verified = jwt.verify(token,process.env.JWT_SECRET, (err,user)=>{
        if(err){
            return res.status(403).json({err:"Access Denied"});

            
        }

        req.user = user;
        next();
    })
}

module.exports = authenticateToken;