const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const User = require('../../models/user');

module.exports = {
  createUser: async args => {
    try {
      const existingUser = await User.findOne({ email: args.userInput.email });

      if (existingUser) {
        throw new Error("User exists already");
      }

      const hash = await argon2.hash(args.userInput.password);
      const user = new User({
        email: args.userInput.email,
        password: hash,
      });

      const result = await user.save();
      console.log(result);
      return { ...result._doc, password: null, _id: result.id }
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
  login: async ({ email, password }) => {
    try {
      const user = await User.findOne({ email });
      
      if(!user) {
        throw new Error('User does not exist');
      }

      const isEqual = await argon2.verify(user.password, password);

      if(!isEqual) {
        throw new Error('Password is incorrect!');
      }

      const token = jwt.sign({
        userId: user.id,
        email: user.email
      }, 
      'somesupersecretkey',
      { 
        expiresIn: '1h',
      });

      return { 
        userId: user.id,
        token: token,
        tokenExpiration: 1
      }
    } catch (err) {
      throw err;
    }
  }
}