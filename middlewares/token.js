const jwt = require('jsonwebtoken')


async function authz(req, res, next) {
    const authHeader = req.headers["authorization"] || req.headers["Authorization"];

    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) return res.status(401).json("no token found");
    const tokenn = jwt.decode(token);
    if (!tokenn.isAdmin) return res.status(403).json("Forbidden");
    console.log(tokenn);
    // await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    //     if (err) console.log(err);
    //     console.log(decoded.name);
    //     return { tokenn };
    //     return decoded.name;
    // });
    next();
}

async function tokVerify(req, res, next) {
    // console.log(req.headers);
    const authHeader = req.headers["authorization"]||req.headers["Authorization"];
    // console.log(authHeader);
    const token = authHeader && authHeader.split(" ")[1]
    // console.log(token);
    if (!token) return res.status(401).json("no token found");
    jwt.verify(token, 'secret_key', (err, user) => {
        if (err)
            return res.status(403).json({ error: err.message, message: "please refresh or login again" });
        req.name = user;
        // console.log(req.name);
        next();
    });
  }

module.exports = { authz, tokVerify }