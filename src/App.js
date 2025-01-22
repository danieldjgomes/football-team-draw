import React, { useState, useEffect } from 'react';
import './App.css';


function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    players: params.get('players')?.split(',') || [],
    teamsCount: parseInt(params.get('teamsCount')) || 2,
    maxPlayersPerTeam: parseInt(params.get('maxPlayersPerTeam')) || 4, // Novo parâmetro
  };
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function distributePlayers(players, teamsCount, maxPlayersPerTeam) {
  const teams = Array.from({ length: teamsCount }, () => []);
  const nextPlayers = [];

  players.forEach((player, index) => {
    const teamIndex = index % teamsCount;
    if (teams[teamIndex].length < maxPlayersPerTeam) {
      teams[teamIndex].push(player);
    } else {
      nextPlayers.push(player);
    }
  });

  return { teams, nextPlayers };
}
function App() {
  const { players, teamsCount, maxPlayersPerTeam } = getQueryParams();
  const [teams, setTeams] = useState([]);
  const [nextPlayers, setNextPlayers] = useState([]);

  useEffect(() => {
    const shuffledPlayers = shuffle([...players]);
    const { teams, nextPlayers } = distributePlayers(shuffledPlayers, teamsCount, maxPlayersPerTeam);
    setTeams(teams);
    setNextPlayers(nextPlayers);
  }, []);

  return (
      <div>
        <h1>Super Futebolas da Sapopa</h1>
        <div className="team-list">
          <h2>Times</h2>
          {teams.map((team, index) => (
              <div className="team" key={index}>
                <strong>Time {index + 1}:</strong>
                <ul>
                  {team.map((player, playerIndex) => (
                      <li key={playerIndex}>{player}</li>
                  ))}
                </ul>
              </div>
          ))}
        </div>
        <div className="next-players">
          <h2>Próximos</h2>
          <p>{nextPlayers.length > 0 ? nextPlayers.join(', ') : 'Não tem proximo'}</p>
        </div>
      </div>
  );
}

export default App;
