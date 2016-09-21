var auth = require('./auth.js');
var Player = require('../data/models/player.js');
var League = require('../data/models/leagues.js');
var Team = require('../data/models/teams.js');
var ongair = require('ongair');
var admin = {

  createUser: function(req, res) {
    email = req.body.email;
    role = req.body.role;

    if (email && role && (role == "admin" || role == "user")) {
      token = auth.generateToken(email, role);
      res.json({ token: token });
    }
    else {
      res.status(422);
      res.json({
        "status": 422,
        "message": "Email and role are required"
      });
    }
  },

  getPlayers: function(req, res) {
    Player.find(function(err, players) {
      all = players.map(function(player) {
        return {
          id: player.id,
          contactId: player.contactId,
          name: player.contactName,
          state: player.state,
          credits: player.credits,
          beta: player.beta
        }
      });
      res.json(all);
    });
  },

  broadcast: function(req, res) {
    state = req.body.state;
    beta = req.body.beta;
    message = req.body.message;
    options = req.body.options;
    args = { state: state };

    if (beta)
      args.beta = beta

    Player.find(args, function(err, players) {
      if (players) {
        var client = new ongair.Client(process.env.ONGAIR_TOKEN);
        players.forEach(function(player) {
          client.sendMessage(player.to(), message, options)
        })
        res.json({ success: true, sent: players.length });
      }
    })
  },

  updatePlayer: function(req, res) {
    var id = req.params.id;
    Player.findOne({ contactId: id }, function(err, player) {
      if (player) {
        beta = req.body.beta;
        state = req.body.state;
        credits = req.body.credits;

        player.beta = beta;
        player.state = state;
        player.credits = credits;
        player.save();

        res.json({ success: true })
      }
    })
  },

  addGame: function(req, res) {
    res.json({ success: true });
  },

  addTeam: function(req, res) {
    var externalId = req.body.externalId;
    var key = req.body.key;
    var name = req.body.name;
    var code = req.body.code;
    var league = req.body.league;

    Team.findOne({ key: key, league: league }, function(err, team) {
      if (team) {
        res.status(422);
        res.json({ message: "Team with id " + id + " already exists"});
      }
      else {
        var team = new Team({ key: key, name: name, code: code, league: league, externalId: externalId });
        team.save();
        res.status(200);
        res.json({ success: true, id: team.id });
      }
    })
  },

  addLeague: function(req, res) {

    // var id = req.body.id;
    var key = req.body.key;
    var name = req.body.name;
    var code = req.body.code;
    var externalId = req.body.externalId;

    League.findOne({ key : key }, function(err, league) {
      if (league) {
        res.status(422);
        res.json({ message: "League with key " + key + " already exists"});
      }
      else {
        league = new League();
        league.key = key;
        league.code = code;
        league.name = name;
        league.externalId = externalId;
        league.save();

        res.json({ success: true, id:  league.id });
      }
    })
  }


};

module.exports = admin;
