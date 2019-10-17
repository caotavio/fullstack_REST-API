'use strict';

const { User } = require('../models');
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');

const authenticateUser = async (req, res, next) => {
    let message = null;
    //check for user credentials and if authorized look for an email match
    const credentials = auth(req);
    if(credentials) {
        let error = Array();
        let message = null;

        if (!credentials.name){
          message = `Please include email address.`;
          error.push(message);
        }
        
        if (! credentials.pass){
          message = `Please include password.`;
          error.push(message);
        }

        if (error.length > 0) {
          res.status(422).json({ errors: error });
        }

        const user = await User.findOne(
            {
                raw: true,
                where: {
                  emailAddress: credentials.name,
            },
        });

        //if email is a match, check and match password
        if(user) {
          const authenticated = bcryptjs.compareSync(credentials.pass, user.password);
          //if full authentication is successful, dependig on the endpoint match with user.id - course(userId) || user(id)
          if(authenticated) {
                if(req.originalUrl.includes('courses')) {
                    req.body.userId = user.id;
                } else if(req.originalUrl.includes('users')) {
                    req.body.id = user.id;
                }
          } else {
              //authentication was not successful
              message = `Login failed`;
              res.status(401).json({ errors: [ message ]});
          }
        } else {
            //there was no user with an email address matching the email address in the authorization header
            message = `Username not found: ${credentials.name}`;
            res.status(401).json({ errors: [ message ]});
        }
    } else {
      message = `Username or password invalid`;
      res.status(401).json({ errors: [ message ]});
    }

    if(message) {
      console.warn(message);
      const err = new Error('Access Denied');
      err.status = (401);
      next(err);
    } else {
      //if there is no error message, user gets authenticated
      next();
    }
  }

  module.exports = authenticateUser;