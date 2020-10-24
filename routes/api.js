/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
let mongoDb = require("mongodb");
let mongoose = require("mongoose");

let URI = `mongodb+srv://adi:${process.env.PW}@cluster0.azfi6.mongodb.net/issue_tracker?retryWrites=true&w=majority`;

mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true });

const issueSchema = new mongoose.Schema({
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_by: { type: String, required: true },
  assigned_to: String,
  status_text: String,
  open: { type: Boolean, default: true, required: true },
  created_on: { type: Date, required: true },
  last_updated: { type: Date, required: true },
  project: String
});

let Issue = mongoose.model("Issue", issueSchema);

module.exports = function(app) {
  app
    .route("/api/issues/:project")

    .get(function(req, res) {
      var project = req.params.project;

      let filterIssues = Object.assign(req.query);
      filterIssues["project"] = project;

      Issue.find(filterIssues, (err, results) => {
        if (!err && results) {
          return res.json(results);
        }
      });
    })

    .post(function(req, res) {
      var project = req.params.project;

      if (
        !req.body.issue_title ||
        !req.body.issue_text ||
        !req.body.created_by
      ) {
        return res.json("please fill the required fields!");
      }

      let newIssue = new Issue({
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || "",
        status_text: req.body.status_text || "",
        open: true,
        created_on: new Date().toUTCString(),
        last_updated: new Date().toUTCString(),
        project
      });

      newIssue.save(function(err, savedIssue) {
        if (err) console.log("Saving error", err);
        //console.log("Issue Saved", savedIssue);
        return res.json(savedIssue);
      });
    })

    .put(function(req, res) {
      var project = req.params.project;

      let updateIssue = {};

      Object.keys(req.body).forEach(key => {
        if (req.body[key] !== "") {
          updateIssue[key] = req.body[key];
        }
      });

      if (Object.keys(updateIssue).length <= 1) {
        return res.json("please complete fields");
      }

      updateIssue["last_updated"] = new Date().toUTCString();

      Issue.findByIdAndUpdate(
        req.body._id,
        updateIssue,
        { new: true, useFindAndModify: false },
        (err, updatedIssue) => {
          if (!err && updatedIssue) return res.json("succesfully updated");
          if (!updatedIssue)
            return res.json("could not update " + req.body._id);
        }
      );
    })

    .delete(function(req, res) {
      var project = req.params.project;

      if (!req.body._id) {
        return res.json("id error");
      }

      Issue.findByIdAndRemove(req.body._id,{useFindAndModify: false}, (err, deletedIssue) => {
        if (!err && deletedIssue) {
          return res.json("deleted " + deletedIssue.id);
        } else if (!deletedIssue) {
          res.json("could not delete " + req.body._id);
        }
      });
    });
};
