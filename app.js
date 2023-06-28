const express = require("express");
const app = express();
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");
const sqlite = require("sqlite");
const { open } = sqlite;
const sqlite3 = require("sqlite3");
app.use(express.json());

db = null;

const initialiseDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server starts running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error :${e.message}`);
    process.exit(1);
  }
};

initialiseDBAndServer();

//List of players
const convertDbObject = (objectItem) => {
  return {
    playerId: objectItem.player_id,
    playerName: objectItem.player_name,
    jerseyNumber: objectItem.jersey_number,
    role: objectItem.role,
  };
};

//Write API call for getting all players in the team using GET method

app.get("/players/", async (request, response) => {
  const getQueryDetails = `
    SELECT * FROM cricket_team
    ORDER BY player_id;
    `;
  const playersArray = await db.all(getQueryDetails);
  response.send(playersArray.map((eachPlayer) => convertDbObject(eachPlayer)));
});

//Write a API call to create new player using POST method
app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const createPlayerQuery = `insert into cricket_team(player_name,jersey_number,role)
  values('${playerName}',${jerseyNumber},'${role}');)`;
  const createPlayerQueryResponse = await db.run(createPlayerQuery);
  response.send(`Player Added to Team`);
});

//Write a API to get single player Data
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerDetailsQuery = `select * from cricket_team where 
  player_id = ${playerId};`;
  const getPlayerDetailsQueryResponse = await db.get(getPlayerDetailsQuery);
  response.send(convertDbObject(getPlayerDetailsQueryResponse));
});

//Write an API to update player data

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `
        update cricket_team set player_name = '${playerName}' , 
        jersey_number = ${jerseyNumber} , role = '${role}'
        where player_id=${playerId};
        `;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//Write an API to remove or delete a Player data

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
  DELETE FROM
    cricket_team
  WHERE
    player_id = ${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
