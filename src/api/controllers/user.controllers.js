const User = require("../models/user.model");
const { validateEmail, usedEmail, validateEmailDomain } = require("../../utils/validation")
const { generateSign } = require("../../utils/jwt")
const bcrypt = require("bcrypt");

const register = async (req, res) => {
    const userData = new User(req.body);
    console.log(req.body.email)
    const isValid = validateEmail(req.body.email)
    const isValidDomain = validateEmailDomain(req.body.email);
    

    if (!isValid) {
        return res.status(400).json({ success: false, data: "Email con formato incorrecto" });
    } else if (!isValidDomain) {
        return res.status(400).json({ success: false, data: "Dominio de correo no permitido" });
    } else {
        const validate = await usedEmail(req.body.email);
        if (validate === 0) {
          userData.password = bcrypt.hashSync(req.body.password, 10);
          const createdUser = await userData.save();
          return res.status(200).json({ success: true, data: createdUser });
        } else {
          return res.status(400).json({ success: false, data: "Correo ya existe" });
        }
    }
}

const login = async (req, res) => {
    try {
        const getUser = await User.findOne({email: req.body.email});
        if(!getUser) {
            return res.status(404).json({message: 'user not found'});
        }
        if(!bcrypt.compareSync(req.body.password, getUser.password)){
            return res.status(404).json({message: 'invalid password'});
        }
        const token = generateSign(getUser._id, getUser.email);
        return res.status(200).json({getUser, token});
    } catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
};

const profile = (req, res) => {
    // devuelve la respuesta al front
    console.log(req.user);
    return res.status(200).json({ success: true, data: req.user })
}

const getUsers = async (req, res) => {
    try {
        const getUsers = await User.find();
        return res.status(200).json(getUsers);
    } catch (error) {
        return res.status(500).json(error);
    }
}

const putUsers = async (req, res) => {
    const userId = req.params.id;
    const updateUser = req.body;
    try {
        const updatedUser = await User.findByIdAndUpdate(userId, updateUser, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        } else {
            return res.status(200).json(updatedUser);
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Usuario no modificado" });
    }
}
  
const deleteUsers = async(req, res) => {
    try {
        const deleteUsers = await User.findByIdAndDelete(req.params.id);
        return res.status(200).json(deleteUsers);
    } catch (error) {
        return res.status(500).json(error);
    }
}  


module.exports = { register, login, profile, getUsers, putUsers, deleteUsers }