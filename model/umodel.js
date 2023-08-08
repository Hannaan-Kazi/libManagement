const { db } = require("./db");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


async function addU(param) {
    try {
        const { name, email } = param;
        const query = 'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id';
        const result = await db.one(query, [name, email]);
        return { message: 'User created', userId: result.id }
    } catch (error) {
        return { error: 'An error occurred' }
    }
}

async function showAllU(param) {
    try {

        const query = 'SELECT * FROM users ';
        const user = await db.many(query);
        if (user) {
            console.log(user);
            return user
        } else {
            return { message: 'User not found' }
        }
    } catch (error) {
        return { error: error.message }
    }
}

async function gU(param) {
    try {
        const uname = param.name
        const query = 'SELECT * FROM users WHERE name= $1 ';
        const user = await db.oneOrNone(query, uname);
        if (user) {
            console.log(user);
            return user
        } else {
            return { Status: 404, message: 'User not found' }
        }
    } catch (error) {
        return { error: error.message }
    }
}

async function upU(params) {
    try {
        // const userId = req.params.id;
        const { userId, name, email } = params;
        const query = 'UPDATE users SET name = $1, email = $2 WHERE id = $3';
        await db.none(query, [name, email, userId]);
        return { message: `User ${name} updated` };
    } catch (error) {
        return { Status: 500, error: 'An error occurred in update user' };
    }
}

async function delU(params) {
    try {
        const { userId } = params
        const query = 'DELETE FROM users WHERE id = $1';
        await db.none(query, userId);
        return { message: 'User deleted' }
    } catch (error) {
        return { Status: 500, error: 'An error occurred in delete user' };
    }
}

async function delAll() {
    try {
        const query = 'DELETE FROM users'
        await db.none(query)
        return { message: 'All records deleted' }
    } catch (err) {
        return { Status: 500, error: 'An error occurred in delAll', message: err };

    }
}

async function regU(params) {
    const { name, email, password } = params;
    const already = await db.oneOrNone('SELECT * FROM users WHERE email= $1 ', email);
    if (already) return { status: 500, error: 'Email already registered' };

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await db.none('INSERT INTO users(name, email, password) VALUES($1, $2, $3)', [name, email, hashedPassword]);
        console.log(hashedPassword);
        const user = await db.one('SELECT * FROM users WHERE email= $1 ', email);
        console.log(user);
        // const token = jwt.sign({ userId: user.id }, 'secret_key', { expiresIn: '1h' });
        // const reftoken = jwt.sign({ userId: user.id }, 'ref_secret_key', { expiresIn: '1d' });
        // // console.log(token);
        // // console.log(reftoken);
        // const query = 'UPDATE users SET reftoken = $1 WHERE email=$2';
        // await db.none(query, [reftoken, email]);
        const { token, reftoken } = await tokenGen(user.id, user)
        const query = 'UPDATE users SET reftoken = $1 WHERE email=$2';
        await db.none(query, [reftoken, email]);
        return { status: 201, message: 'User registered successfully', token: token }
        // return { status: 201, message: 'User registered successfully' }
    } catch (error) {
        console.error(error);
        return { status: 500, error: 'An error occurred' };
    }
}

async function login(params) {
    const { email, password } = params;

    try {
        const user = await db.oneOrNone('SELECT * FROM users WHERE email = $1', email);
        console.log(user);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return { status: 401, error: 'Invalid credentials' }
        }

        // const token = jwt.sign({ userId: user.id, isAdmin: user.isAdmin }, 'secret_key', { expiresIn: '1h' });
        const { token, reftoken } = await tokenGen(user.id, user)
        const dToken = await jwt.decode(token);
        console.log(dToken, user.id);
        const query = 'UPDATE users SET reftoken = $1 WHERE email=$2';
        await db.none(query, [reftoken, email]);
        return { status: 200, token: token }
    } catch (error) {
        console.error(error);
        return { status: 500, error: 'An error occurred' }
    }
}

async function regAd(params) {
    const { name, email, password } = params;
    const already = await db.oneOrNone('SELECT * FROM users WHERE email= $1 ', email);
    if (already) return { status: 500, error: 'Email already registered' };

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await db.none('INSERT INTO users(name, email, password, isAdmin) VALUES($1, $2 ,$3, $4)', [name, email, hashedPassword, true]);
        console.log(hashedPassword);
        const user = await db.many('SELECT * FROM users WHERE email= $1 ', email);
        console.log(user);
        // const token = jwt.sign({ userId: user.id, isAdmin: true }, 'secret_key', { expiresIn: '1h' });
        // const reftoken = jwt.sign({ userId: user.id, isAdmin: true }, 'ref_secret_key', { expiresIn: '1d' });
        // // console.log(token);
        // // console.log(reftoken);
        // const query = 'UPDATE users SET reftoken = $1 WHERE email=$2';
        // await db.none(query, [reftoken, email]);
        const { token, reftoken } = await tokenGen(user.id, user)
        const query = 'UPDATE users SET reftoken = $1 WHERE email=$2';
        await db.none(query, [reftoken, email]);
        return { status: 201, message: 'User registered successfully', token: token }
        // return { status: 201, message: 'User registered successfully' }

    } catch (error) {
        console.error(error);
        return { status: 500, error: 'An error occurred' };
    }
}

async function refresh(param) {

    const authHeader = param["authorization"] || param['Authorizaion'];
    const tokenn = authHeader && authHeader.split(" ")[1];

    if (!tokenn) return "No token found";
    const dToken = await jwt.decode(tokenn);
    const user = await db.one('SELECT * FROM users WHERE id=$1', dToken.userId)
    if (!user.reftoken) return { Status: 401, message: 'please retry logging in' }

    let ret = await jwt.verify(user.reftoken, 'ref_secret_key', async (err, usr) => {
        if (err) return { status: 403 }
        const { token, reftoken } = await tokenGen(user.id, user)
        const query = 'UPDATE users SET reftoken = $1 WHERE id=$2';
        await db.none(query, [reftoken, user.id]);
        return { token: token }

    })
    return ret

    //   const user = await cons.findOne({ id: dToken.id });
}

async function tokenGen(param, b) {
    const token = jwt.sign(
        { userId: param, isAdmin: b.isadmin },
        'secret_key',
        { expiresIn: "1h" }
    );
    const reftoken = jwt.sign(
        { userId: param, isAdmin: b.isadmin },
        'ref_secret_key',
        { expiresIn: "1d" })
    return { token, reftoken };
}

module.exports = {
    addU,
    gU,
    showAllU,
    upU,
    delU,
    regU,
    login,
    delAll,
    regAd,
    refresh
}