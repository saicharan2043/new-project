const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const express = require("express");
let app = express();
app.use(express.json());
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;
const listenDbToServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running http://localhost:3000/");
    });
  } catch (e) {
    console.log(`db error : ${e.message}`);
  }
};

listenDbToServer();

app.get("/players/", async (request, response) => {
  let playerDetailes = `SELECT * FROM cricket_team`;
  let dbResponse = await db.all(playerDetailes);
  const convertDbObjectToResponseObject = (dbObject) => {
    let myArray = [];
    for (let value of dbObject) {
      let object = {
        playerId: value.player_id,
        playerName: value.player_name,
        jerseyNumber: value.jersey_number,
        role: value.role,
      };
      myArray.push(object);
    }
    return myArray;
  };

  response.send(convertDbObjectToResponseObject(dbResponse));
});

app.post("/players", async (request, response) => {
  try {
    let playerDetails = request.body;
    let { PlayerName, jerseyNumber, role } = playerDetails;
    let requestDetailes = `INSERT INTO cricket_team
                (player_name , jersey_number ,role)
                VALUES ('${PlayerName}' , '${jerseyNumber}' , '${role}')
            `;
    let dbresponse = await db.run(requestDetailes);
    response.send("Player Added to Team");
  } catch (e) {
    console.log(e.message);
  }
});

app.get("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  let playerDetailes = `SELECT * FROM cricket_team WHERE player_id = ${playerId}`;
  let dbResponse = await db.get(playerDetailes);
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    };
  };

  response.send(convertDbObjectToResponseObject(dbResponse));
});

app.put("/players/:playerId/", async (request, response) => {
  try {
    let { playerId } = request.params;
    let playerDetails = request.body;
    let { PlayerName, jerseyNumber, role } = playerDetails;
    let requestDetailes = `UPDATE  cricket_team
                SET 
                   player_name =  '${PlayerName}' , 
                   jersey_number = '${jerseyNumber}' , 
                   role = '${role}'
                WHERE player_id = ${playerId}
            `;
    let dbresponse = await db.run(requestDetailes);
    response.send("Player Details Updated");
  } catch (e) {
    console.log(e.message);
  }
});

app.delete("/players/:playerId/", async (request, response) => {
  try {
    let { playerId } = request.params;
    let playerDetails = `DELETE FROM cricket_team WHERE player_id = ${playerId}`;
    let dbResponse = await db.run(playerDetails);
    response.send("Player Removed");
  } catch (e) {
    console.log(e.message);
  }
});

module.exports = app;
