const { RoomCategory, Contact } = require("../models");

const contactDetails = async (req, res, next)=> {
    const {
        name,
        email,
        mobile,
        subject,
        message
    } = req.body
    if(!name || !email || !mobile || !subject || !message){
        res.status(400).send({
         status: "Failure",
         message: "Please fill the fields",
        })
    }else{
    new Contact({
        name:name,
        email:email,
        mobile:mobile,
        subject:subject,
        message:message
    }).save().then((result)=>{
        res.status(200).send({
            status: "success",
            message: "Your inquiry has been made",
            data: result
        });
    })
}
}


module.exports = {
    contactDetails
};








// const { RoomCategory, Contact } = require("../models");

// const contactDetails = async (req, res, next)=> {
//     const {
//         name,
//         email,
//         mobile,
//         subject,
//         message
//     } = req.body
//     new Contact({
//         name:name,
//         email:email,
//         mobile:mobile,
//         subject:subject,
//         message:message
//     }).save().then((result)=>{
//         res.status(200).send(result);
//     })
// }
// module.exports = {
//     contactDetails
// };