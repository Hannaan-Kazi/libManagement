const pgp = require('pg-promise')()

const db = pgp('postgres://postgres:hkpostgresql@localhost:5432/libManagement')
module.exports={db}