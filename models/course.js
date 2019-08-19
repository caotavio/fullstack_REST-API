"use strict";
module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define("Course",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "A title is required for the course"
          }
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "A course description is required"
          }
        }
      },
      estimatedTime: {
        type: DataTypes.STRING,
        allowNull: true
      },
      materialsNeeded : {
        type: DataTypes.STRING,
        allowNull: true
      }
    }, {});
  //association: a course can belong to any user (belongsTo)
  Course.associate = models => {
    Course.belongsTo(models.User, {
      as: "user",
      foreignKey : {
        fieldName: "userId",
        allowNull: false
      }
    });
  };
  return Course;
};