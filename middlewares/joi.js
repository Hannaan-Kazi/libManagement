const joi = require("joi");

const uSchema = joi.object().keys({
  name: joi.string().alphanum().min(3).max(50).required(),
  email: joi.string().alphanum().min(3).max(50).required(),
  password: joi.string().alphanum().min(3).max(50).required(),
});
const pSchema = joi.object().keys({
  oPassword: joi.string().alphanum().min(3).max(50).required(),
  nPassword1: joi.string().alphanum().min(3).max(50).required(),
  nPassword2: joi.string().alphanum().min(3).max(50).required(),
});

async function uValidate(req, res, next) {
  const result = uSchema.validate(req.body);
  if (result.error) {
    console.log(result.error.message);
    res.status(400).send(result.error.message);
  }
  console.log(result);
   next();
}
async function passValidate(req, res, next) {
  const result = pSchema.validate(req.body);
  if (result.error) {
    console.log(result.error.message);
    res.status(400).send(result.error.message);
  }
  // console.log(result);
  return next();
}
// const admschema = joi.object().keys({
//   name: joi.string().alphanum().min(3).max(50).required(),
//   password: joi.string().alphanum().min(3).max(50).required(),
// });
// async function admvalidate(req, res, next) {
//   const result = admschema.validate(req.body);
//   if (result.error) {
//     console.log(result.error.message);
//     return res.status(400).send(result.error.message);
//   }
//   return next();
// }
module.exports = { uValidate,passValidate };
