import React, { useState, useEffect, useRef } from 'react';

const ChessGame = () => {
  const [playerId, setPlayerId] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize WebSocket connection
    socketRef.current = new WebSocket('ws://localhost:6789');

    socketRef.current.addEventListener('open', () => {
      console.log('Connected to the game server.');
    });

    socketRef.current.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'player_assignment') {
        setPlayerId(data.player_id);
        console.log(`You are player: ${data.player_id}`);
      }

      if (data.type === 'update') {
        setGameState(data.state);
        if (data.message && data.message.includes('wins')) {
          handleGameOver(data.message);
        }
      }

      if (data.type === 'chat') {
        setChatMessages((prevMessages) => [...prevMessages, data.message]);
      }
    });

    socketRef.current.addEventListener('close', () => {
      console.log('Disconnected from the game server.');
    });

    socketRef.current.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Cleanup WebSocket connection on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const renderBoard = () => {
    if (!gameState) return null;

    return gameState.board.map((row, rowIndex) =>
      row.map((cell, colIndex) => (
        <div
          key={`${rowIndex}-${colIndex}`}
          className={cell === '' ? 'empty' : cell[0]}
          data-row={rowIndex}
          data-col={colIndex}
          onClick={() => onCellClick(rowIndex, colIndex, cell)}
        >
          {cell}
        </div>
      ))
    );
  };

  const onCellClick = (row, col, character) => {
    if (
      character &&
      character.startsWith(playerId) &&
      playerId === gameState.current_player
    ) {
      setSelectedCharacter({ character, row, col });
    }
  };

  const renderMoveButtons = () => {
    if (!selectedCharacter) return null;

    const { character } = selectedCharacter;
    let moves;
    if (character.includes('H3')) {
      moves = ['FL', 'FR', 'BL', 'BR', 'RF', 'LF', 'RB', 'LB'];
    } else if (character.includes('H2')) {
      moves = ['FL', 'FR', 'BL', 'BR'];
    } else {
      moves = ['L', 'R', 'F', 'B'];
    }

    return moves.map((move) => (
      <button
        key={move}
        className="move-button"
        onClick={() => makeMove(move)}
      >
        {move}
      </button>
    ));
  };

  const makeMove = (move) => {
    if (selectedCharacter && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const { character, row, col } = selectedCharacter;

      socketRef.current.send(
        JSON.stringify({
          type: 'move',
          player: playerId,
          character,
          move,
          fromX: col,
          fromY: row,
        })
      );
      setSelectedCharacter(null);
    } else {
      console.error('WebSocket is not open.');
    }
  };

  const renderMoveHistory = () => {
    if (!gameState) return null;

    return (
      <ul>
        {gameState.move_history.map((move, index) => (
          <li key={index}>{move}</li>
        ))}
      </ul>
    );
  };

  const handleGameOver = (message) => {
    alert(message);
    setGameState(null);
  };

  const restartGame = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'restart' }));
      setGameState(null);
    } else {
      console.error('WebSocket is not open.');
    }
  };

  const handleChatSend = () => {
    if (chatInput.trim() !== '') {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: 'chat',
            message: `[${playerId}] ${chatInput}`,
          })
        );
        setChatInput('');
      } else {
        console.error('WebSocket is not open.');
      }
    }
  };

  return (
    <div className="main-container">
      <div id="move-history" className="panel history-panel">
        <h3>Move History</h3>
        {renderMoveHistory()}
      </div>

      <div className="game-container">
        <h1 id="current-player">Current Player: {gameState?.current_player}</h1>
        <div id="board">{renderBoard()}</div>
        <div id="controls">
          <h3>
            Selected: <span id="selected-character">{selectedCharacter?.character}</span>
          </h3>
          <div id="move-buttons">{renderMoveButtons()}</div>
        </div>
      </div>

      <div id="chat" className="panel chat-panel">
        <div id="chat-messages">
          {chatMessages.map((message, index) => (
            <div key={index}>{message}</div>
          ))}
        </div>
        <div id="chat-input-container">
          <input
            type="text"
            id="chat-input"
            placeholder="Type a message..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
          />
          <button id="chat-send" onClick={handleChatSend}>
            Send
          </button>
        </div>
      </div>

      {gameState?.winner && (
        <div id="game-over">
          <h2 id="winner-announcement">{gameState.winner} wins!</h2>
          <button onClick={restartGame}>Start a New Game</button>
        </div>
      )}
    </div>
  );
};

export default ChessGame;
