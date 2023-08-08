const { db } = require("./db");
const jwt = require('jsonwebtoken')


async function addB(param) {
    try {
        const { name, subject, availability } = param;
        const already = await db.oneOrNone('SELECT * FROM books WHERE name= $1 AND subject=$2 ', [name, subject]);
        if (already) return { status: 403, error: 'Book already registered' };

        const query = 'INSERT INTO books (name, subject, availability) VALUES ($1, $2, $3) RETURNING book_id';
        const result = await db.one(query, [name, subject, availability]);
        return { message: 'Book added', book_id: result.id }
    } catch (error) {
        return { error: 'An error occurred', message: error }
    }
}

async function showall(param) {
    try {
        const query = 'SELECT * FROM books'
        const result = await db.many(query)
        return result
    } catch (error) {
        return { error: 'An error occurred', message: error }
    }
}

async function gB(param) {
    try {
        const bname = param.name
        const query = 'SELECT * FROM books WHERE name= $1 ';
        const book = await db.manyOrNone(query, bname);
        if (book) {
            console.log(book);
            return book
        } else {
            return { Status: 404, message: 'Book not found' }
        }
    } catch (error) {
        return { error: error.message }
    }
}

async function upB(params) {
    try {
        // const userId = req.params.id;
        const { book_id, name, subject } = params;
        const query = 'UPDATE books SET name = $1, subject = $2 WHERE book_id = $3';
        await db.none(query, [name, subject, book_id]);
        return { message: `Book ${name} updated` };
    } catch (error) {
        return { Status: 500, error: 'An error occurred in update user' };
    }
}

async function delB(params) {
    try {
        const { book_id } = params
        const query = 'DELETE FROM books WHERE id = $1';
        await db.none(query, book_id);
        return { message: 'Book deleted' }
    } catch (error) {
        return { Status: 500, error: 'An error occurred in delete user' };
    }
}

async function delAllB() {
    try {
        const query = 'DELETE FROM books'
        await db.none(query)
        return { message: 'All records deleted' }
    } catch (err) {
        return { Status: 500, error: 'An error occurred in delAll', message: err };

    }
}

async function booking(param) {
    try {
        const authHeader = param.headers["authorization"] || param.headers['Authorizaion'];
        const tokenn = authHeader && authHeader.split(" ")[1];

        if (!tokenn) return "No token found";
        const dToken = await jwt.decode(tokenn);
        const query = 'INSERT INTO issue (id, book_id, borrowed_date) VALUES ($1, $2, $3) returning issue_id'
        // const d=await db.one('SELECT CURRENT_DATE')
        const d = new Date().toISOString()
        const vals = [dToken.userId, param.body.book_id, d]
        const result = await db.one(query, vals)
        const avail = await db.oneOrNone('UPDATE books SET availability=availability-1 WHERE book_id=$1 AND availability>0 returning book_id', param.body.book_id)
        if (!avail) return { message: 'book out of stock' }
        return { issue_id: result }
    } catch (err) {
        return { status: 500, message: 'Something went wrong in booking fnc', error: err.message }
    }
}

async function iShowall(param) {
    try {
        const query = 'SELECT * FROM issue'
        const result = await db.many(query)
        return result
    } catch (error) {
        return { error: 'An error occurred', message: error.message }
    }
}

async function retBook(param) {
    try {
        const {book_id,id}=param
        const query='UPDATE issue SET returned_date= $1 WHERE book_id=$2 AND id=$3 RETURNING issue_id'
        const d=new Date().toISOString()
        const result=await db.oneOrNone(query,[d,book_id,id])
        await db.none('UPDATE books SET availability=availability+1 WHERE book_id=$1',book_id)
        return result
    } catch (err) {
        return { eror: 'an error occured in retbook', message: err.message }
    }
}

module.exports = {
    addB, showall, gB, upB, delB, delAllB, booking, iShowall, retBook
}