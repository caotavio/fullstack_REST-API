"use strict";
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "A first name is required for the user"
          }
        }
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "A last name is required for the user"
          }
        }
      },
      emailAddress: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "An email address is required"
          },
          isEmail: {
            msg: "Please provide a valid email address"
          }
        },
        unique: {
          args: true,
          msg: "User`s email address must be unique to that user"
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Please provide a password"
          }
        }
      }
    }, {});
  //association: a user can have many courses (hasMany)
  User.associate = models => {
    User.hasMany(models.Course);
  };
  return User;
};
