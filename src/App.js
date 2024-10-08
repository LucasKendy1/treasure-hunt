import React, { useState, useEffect } from "react";
import "./App.css";
import { ref, set, onValue } from "firebase/database"; // Importa os métodos necessários
import database from "./firebase"; // Importa a configuração do Firebase

const BOARD_SIZE = 10;

function App() {
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
  const [treasurePosition, setTreasurePosition] = useState({ x: 5, y: 5 });
  const [players, setPlayers] = useState({});

  // Gera uma posição aleatória para o tesouro
  function generateRandomPosition() {
    const x = Math.floor(Math.random() * BOARD_SIZE);
    const y = Math.floor(Math.random() * BOARD_SIZE);
    return { x, y };
  }

  // Sincroniza a posição do tesouro no Firebase
  useEffect(() => {
    const treasureRef = ref(database, "treasure"); // Atualiza para usar ref da nova API

    onValue(treasureRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTreasurePosition(data);
      } else {
        // Se ainda não houver um tesouro, gera um aleatório
        const newTreasure = generateRandomPosition();
        set(treasureRef, newTreasure); // Atualiza a posição do tesouro no Firebase
      }
    });

    return () => {
      // Remove listener quando o componente é desmontado
      onValue(treasureRef, () => {});
    };
  }, []);

  // Sincroniza a posição dos jogadores no Firebase
  useEffect(() => {
    const playersRef = ref(database, "players"); // Atualiza para usar ref da nova API

    onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPlayers(data);
      }
    });

    return () => {
      onValue(playersRef, () => {});
    };
  }, []);

  const playerId = localStorage.getItem("playerId") || generatePlayerId();

  useEffect(() => {
    const playerRef = ref(database, `players/${playerId}`);

    // Remove o jogador do Firebase quando ele sai da página
    window.addEventListener("beforeunload", () => {
      set(playerRef, null);
    });

    return () => {
      set(playerRef, null);
    };
  }, [playerId]);

  // Função para mover o jogador
  const handleKeyPress = (e) => {
    let { x, y } = playerPosition;

    switch (e.key) {
      case "ArrowUp":
        y = Math.max(0, y - 1);
        break;
      case "ArrowDown":
        y = Math.min(BOARD_SIZE - 1, y + 1);
        break;
      case "ArrowLeft":
        x = Math.max(0, x - 1);
        break;
      case "ArrowRight":
        x = Math.min(BOARD_SIZE - 1, x + 1);
        break;
      default:
        break;
    }

    setPlayerPosition({ x, y });

    // Atualiza a posição do jogador no Firebase
    const playerRef = ref(database, `players/${playerId}`);
    set(playerRef, { x, y });

    // Verifica se o jogador encontrou o tesouro
    if (x === treasurePosition.x && y === treasurePosition.y) {
      alert("Você encontrou o tesouro!");
      const newTreasure = generateRandomPosition();
      const treasureRef = ref(database, "treasure");
      set(treasureRef, newTreasure); // Atualiza a posição do tesouro no Firebase
    }
  };

  // Função para gerar um ID único
  const generatePlayerId = () => {
    return "player_" + Math.random().toString(36).substring(2, 15);
  };

  // Função para verificar ou criar o jogador
  const initializePlayer = () => {
    let playerId = localStorage.getItem("playerId");

    if (!playerId) {
      // Se não existir, cria um novo ID e salva no localStorage
      playerId = generatePlayerId();
      localStorage.setItem("playerId", playerId);

      // Cria o jogador no Firebase
      set(ref(database, `players/${playerId}`), {
        id: playerId,
        x: 0, // posição inicial x
        y: 0, // posição inicial y
        score: 0, // pontuação inicial
      });
    } else {
      // Se já existir, apenas pega o jogador da database
      console.log("Jogador já existe com ID:", playerId);
    }

    return playerId;
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [playerPosition, treasurePosition]);

  return (
    <div>
      <div className="board">
        {Array.from({ length: BOARD_SIZE }).map((_, row) => (
          <div key={row} className="row">
            {Array.from({ length: BOARD_SIZE }).map((_, col) => {
              const isTreasure =
                treasurePosition.x === col && treasurePosition.y === row;
              const playerInCell = Object.entries(players).find(
                ([_, pos]) => pos.x === col && pos.y === row
              );
              return (
                <div
                  key={col}
                  className={`cell ${playerInCell ? "player" : ""} ${
                    isTreasure ? "treasure" : ""
                  }`}
                >
                  {playerInCell && <span>{playerInCell[0]}</span>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {/* Setas simuladas para jogar no celular - formato de teclado direcional */}
      <div className="arrows">
        <div className="row">
          <div></div>
          <div
            className="seta"
            onClick={() => handleKeyPress({ key: "ArrowUp" })}
          >
            &uarr;
          </div>
          <div></div>
        </div>
        <div className="row">
          <div
            className="seta"
            onClick={() => handleKeyPress({ key: "ArrowLeft" })}
          >
            &larr;
          </div>
          <div></div>
          <div
            className="seta"
            onClick={() => handleKeyPress({ key: "ArrowRight" })}
          >
            &rarr;
          </div>
        </div>
        <div className="row">
          <div></div>
          <div
            className="seta"
            onClick={() => handleKeyPress({ key: "ArrowDown" })}
          >
            &darr;
          </div>
          <div></div>
        </div>
      </div>
    </div>
  );
}

export default App;
