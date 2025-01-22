import React, { useState, useEffect } from 'react';
import './App.css';

function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    players: params.get('players')?.split(',') || [],
    teamsCount: parseInt(params.get('teamsCount')) || 2,
    maxPlayersPerTeam: parseInt(params.get('maxPlayersPerTeam')) || 4,
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
  const { players: initialPlayers, teamsCount, maxPlayersPerTeam } = getQueryParams();
  const [players, setPlayers] = useState(initialPlayers);
  const [teams, setTeams] = useState([]);
  const [nextPlayers, setNextPlayers] = useState([]);
  const [newPlayer, setNewPlayer] = useState("");
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const updateTeams = (playersList) => {
    const shuffledPlayers = shuffle([...playersList]);
    const { teams, nextPlayers } = distributePlayers(shuffledPlayers, teamsCount, maxPlayersPerTeam);
    setTeams(teams);
    setNextPlayers(nextPlayers);
  };

  useEffect(() => {
    updateTeams(players);
    updateURL(players);
  }, [players, teamsCount, maxPlayersPerTeam]);

  const updateURL = (players) => {
    const params = new URLSearchParams(window.location.search);
    params.set('players', players.join(','));
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  };

  const handleReshuffle = () => {
    updateTeams(players);
  };

  const handleAddPlayer = () => {
    if (newPlayer.trim() && !players.includes(newPlayer)) {
      setPlayers([...players, newPlayer]);
      setNewPlayer('');
    }
  };

  const handleRemovePlayer = (player) => {
    setPlayers(players.filter((p) => p !== player));
  };

  const copyToClipboard = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
      <div className="app-container">
        <h1>Super Futebolas da Sapopa</h1>
        {players.length === 0 &&
            <h3>Adicione Jogadores para começar a sortear os times.</h3>
        }
        {players.length > 0 && <div className="team-section">
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
        }

        {players.length > 0 && <div className="next-players">
          <h2>Próximos</h2>
          <p>{nextPlayers.length > 0 ? nextPlayers.join(', ') : 'Não tem próximo'}</p>
        </div>
        }

        <div className="actions-section">
          <div className="grouped-buttons">
            {players.length > 1 &&
                <button className="reshuffle-btn" onClick={handleReshuffle}>
                  Resortear
                </button>
            }
            <button className="edit-btn" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? "Fechar Editor" : "Editar Lista de Jogadores"}
            </button>
          </div>
          {isEditing && (
              <div className="players-section">
                <h2>Editar Jogadores</h2>
                <ul className="players-list">
                  {players.map((player, index) => (
                      <li key={index} className="player-item">
                        {player}
                        <button className="remove-btn" onClick={() => handleRemovePlayer(player)}>
                          ✖
                        </button>
                      </li>
                  ))}
                </ul>
                <div className="add-player">
                  <input
                      type="text"
                      value={newPlayer}
                      onChange={(e) => setNewPlayer(e.target.value)}
                      placeholder="Adicionar jogador"
                      className="player-input"
                  />
                  <button className="add-btn" onClick={handleAddPlayer}>
                    Adicionar
                  </button>
                </div>
              </div>
          )}
        </div>


          <div className="copy-url">
            <button className="copy-btn" onClick={copyToClipboard}>
              {copied ? "Link Copiado!" : "Copiar Link"}
            </button>
          </div>
      </div>
  );
}

export default App;
