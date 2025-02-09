import React, { useState, useEffect } from 'react';
import './App.css';

function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    players: params.get('players')?.split(',') || [],
    initialTeamsCount: parseInt(params.get('teamsCount')) || 2,
    initialMaxPlayersPerTeam: parseInt(params.get('maxPlayersPerTeam')) || 4,
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
  const { players: initialPlayers, initialTeamsCount, initialMaxPlayersPerTeam } = getQueryParams();

  const [teamsCount, setTeamsCount] = useState(initialTeamsCount)
  const [maxPlayersPerTeam, setMaxPlayersPerTeam] = useState(initialMaxPlayersPerTeam)
  const [players, setPlayers] = useState(initialPlayers);
  const [teams, setTeams] = useState([]);
  const [nextPlayers, setNextPlayers] = useState([]);
  const [newPlayer, setNewPlayer] = useState("");
  const [copied, setCopied] = useState(false);
  const [isEditingPlayers, setIsEditingPlayers] = useState(false);
  const [isEditingRules, setIsEditingRules] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);

  const updateTeams = (playersList) => {
    const shuffledPlayers = shuffle([...playersList]);
    const { teams, nextPlayers } = distributePlayers(shuffledPlayers, teamsCount, maxPlayersPerTeam);
    setTeams(teams);
    setNextPlayers(nextPlayers);
  };

  const isEditing = () => {
    return isEditingRules || isEditingPlayers
  }

  useEffect(() => {
    updateURL(players);
    setIsShuffled(false);
  }, [players, teamsCount, maxPlayersPerTeam]);

  const updateURL = (players) => {
    const params = new URLSearchParams(window.location.search);
    if (players.length > 0) {
      params.set('players', players.join(','));
    } else {
      params.delete('players');
    }
      params.set('teamsCount', teamsCount.toString())
      params.set('maxPlayersPerTeam', maxPlayersPerTeam.toString())
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  };

  const handleReshuffle = () => {
    updateTeams(players);
    setIsShuffled(true);
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
        {players.length > 0 && isShuffled && !isEditing() && <div className="team-section">
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

        {players.length > 0 && isShuffled && !isEditing() && <div className="next-players">
          <h2>Próximos</h2>
          <p>{nextPlayers.length > 0 ? nextPlayers.join(', ') : 'Não tem próximo'}</p>
        </div>
        }

        <div className="actions-section">
          <div className="grouped-buttons">
            {players.length > 1 && !isEditing() &&
                <button className="reshuffle-btn" onClick={handleReshuffle}>
                  {isShuffled ? "Resortear" : "Sortear"}
                </button>
            }

            { !isEditingPlayers &&
            <button className="edit-rule-btn" onClick={() => setIsEditingRules(!isEditingRules)}>
              {isEditingRules ? "Fechar Editor" : "Configuracoes do sorteio"}
            </button>
            }

            { !isEditingRules &&
              <button className="edit-btn" onClick={() => setIsEditingPlayers(!isEditingPlayers)}>
              {isEditingPlayers ? "Fechar Editor" : "Editar Lista de Jogadores"}
            </button>
            }

          </div>
          {isEditingPlayers && (
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

          {isEditingRules && (
              <div className="players-section">
                <h2>Regras</h2>
                <div className="setting">
                  <span>Jogadores por equipe:</span>
                  <br />
                  <button className="edit-btn" onClick={() => setMaxPlayersPerTeam((prev) => Math.max(1, prev - 1))}>-</button>
                  <span className="count">{maxPlayersPerTeam}</span>
                  <button className="edit-btn"  onClick={() => setMaxPlayersPerTeam((prev) => prev + 1)}>+</button>
                </div>

                <div className="setting">
                  <span> Quantidade de equipes:</span>
                  <br />
                  <button className="edit-btn" onClick={() => setTeamsCount((prev) => Math.max(1, prev - 1))}>-</button>
                  <span className="count" >{teamsCount}</span>
                  <button className="edit-btn" onClick={() => setTeamsCount((prev) => prev + 1)}>+</button>
                </div>
              </div>
          )}
        </div>

        {
          !isEditing() &&
          <div className="copy-url">
            <button className="copy-btn" onClick={copyToClipboard}>
              {copied ? "Link Copiado!" : "Copiar Link"}
            </button>
          </div>
        }
      </div>
  );
}

export default App;
