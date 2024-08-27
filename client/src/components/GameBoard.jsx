import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import ChatArea from './ChatArea';

const socket = io('http://localhost:4000');

function GameBoard() {
  const gridSize = 5;

  const initialBoardState = [
    ['A_P1', 'A_P2', 'A_H1', 'A_H2', 'A_P3'], // Player 1
    [null, null, null, null, null],
    [null, null, null, null, null],
    [null, null, null, null, null],
    ['B_P3', 'B_H2', 'B_H1', 'B_P2', 'B_P1'], // Player 2
  ];

  const [board, setBoard] = useState(initialBoardState);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [playerType, setPlayerType] = useState(null);
  const [moveHistory, setMoveHistory] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    socket.on('movePiece', ({ updatedBoard, move }) => {
      setBoard(updatedBoard);
      setMoveHistory((prevHistory) => [...prevHistory, move]);
      setCurrentPlayer((prevPlayer) => (prevPlayer === 1 ? 2 : 1));
    });

    return () => {
      socket.off('movePiece');
    };
  }, []);

  useEffect(() => {
    setPlayerType(currentPlayer === 1 ? 'A' : 'B');
  }, [currentPlayer]);

  useEffect(() => {
    const checkWinCondition = () => {
      const pieces = board.flat();
      const playerAHasPieces = pieces.every(
        (piece) => !piece || piece.startsWith('A')
      );
      const playerBHasPieces = pieces.every(
        (piece) => !piece || piece.startsWith('B')
      );

      if (playerAHasPieces) {
        setGameOver(true);
        setWinner('A');
      } else if (playerBHasPieces) {
        setGameOver(true);
        setWinner('B');
      }
    };

    checkWinCondition();
  }, [board]);

  const handleCellClick = (x, y) => {
    if (gameOver) return;

    const piece = board[x][y];
    const isPlayerPiece =
      currentPlayer === 1
        ? piece && piece.startsWith('A')
        : piece && piece.startsWith('B');

    if (isPlayerPiece) {
      setSelectedPiece({ x, y, piece });
    }
  };

  const isValidMove = (newX, newY) => {
    if (newX < 0 || newX >= gridSize || newY < 0 || newY >= gridSize) {
      return false;
    }

    const targetCell = board[newX][newY];
    const isPlayerPiece =
      currentPlayer === 1
        ? targetCell && targetCell.startsWith('A')
        : targetCell && targetCell.startsWith('B');

    return !isPlayerPiece;
  };

  const movePiece = (direction) => {
    if (selectedPiece) {
      const { x, y, piece } = selectedPiece;
      let newX = x,
        newY = y;
      let capturedPiece = null;

      if (piece.endsWith('H2')) {
        // Existing logic for H2 pieces
        switch (direction) {
          case 'Back Left':
            newX = currentPlayer === 1 ? x - 2 : x + 2;
            newY = y - 2;
            break;
          case 'Back Right':
            newX = currentPlayer === 1 ? x - 2 : x + 2;
            newY = y + 2;
            break;
          case 'Front Left':
            newX = currentPlayer === 1 ? x + 2 : x - 2;
            newY = y - 2;
            break;
          case 'Front Right':
            newX = currentPlayer === 1 ? x + 2 : x - 2;
            newY = y + 2;
            break;
          default:
            break;
        }
      } else if (piece.endsWith('H3')) {
        // Existing logic for H3 pieces
        switch (direction) {
          case 'FL':
            newX = currentPlayer === 1 ? x + 2 : x - 2;
            newY = y - 1;
            break;
          case 'FR':
            newX = currentPlayer === 1 ? x + 2 : x - 2;
            newY = y + 1;
            break;
          case 'BL':
            newX = currentPlayer === 1 ? x - 2 : x + 2;
            newY = y - 1;
            break;
          case 'BR':
            newX = currentPlayer === 1 ? x - 2 : x + 2;
            newY = y + 1;
            break;
          case 'RF':
            newX = currentPlayer === 1 ? x + 1 : x - 1;
            newY = y + 2;
            break;
          case 'RB':
            newX = currentPlayer === 1 ? x - 1 : x + 1;
            newY = y + 2;
            break;
          case 'LF':
            newX = currentPlayer === 1 ? x + 1 : x - 1;
            newY = y - 2;
            break;
          case 'LB':
            newX = currentPlayer === 1 ? x - 1 : x + 1;
            newY = y - 2;
            break;
          default:
            break;
        }
      } else if (piece.endsWith('H1')) {
        // New logic for H1 pieces (moving two squares)
        switch (direction) {
          case 'Front':
            newX = currentPlayer === 1 ? x + 2 : x - 2;
            break;
          case 'Back':
            newX = currentPlayer === 1 ? x - 2 : x + 2;
            break;
          case 'Left':
            newY = y - 2;
            break;
          case 'Right':
            newY = y + 2;
            break;
          default:
            break;
        }
      } else {
        // Existing logic for other pieces
        let front = 'Front';
        let back = 'Back';
        switch (direction) {
          case front:
            newX = currentPlayer === 1 ? x + 1 : x - 1;
            break;
          case back:
            newX = currentPlayer === 1 ? x - 1 : x + 1;
            break;
          case 'Left':
            newY = y - 1;
            break;
          case 'Right':
            newY = y + 1;
            break;
          default:
            break;
        }
      }

      if (isValidMove(newX, newY)) {
        const updatedBoard = board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            if (rowIndex === x && colIndex === y) return null;
            if (rowIndex === newX && colIndex === newY) {
              capturedPiece = board[newX][newY];
              return piece;
            }
            return cell;
          })
        );

        let moveDescription = `${piece} moved ${direction}`;
        if (capturedPiece) {
          moveDescription += ` and captured ${capturedPiece}`;
        }
        const moveData = { updatedBoard, move: moveDescription };
        socket.emit('movePiece', moveData);
        setSelectedPiece(null);
      }
    }
  };

  const resetGame = () => {
    setBoard(initialBoardState);
    setSelectedPiece(null);
    setCurrentPlayer(1);
    setMoveHistory([]);
    setGameOver(false);
    setWinner(null);
  };

  const addHero3 = () => {
    const updatedBoard = board.map((row, rowIndex) =>
      row.map((cell) => {
        if (cell === 'A_P3') return 'A_H3';
        if (cell === 'B_P3') return 'B_H3';
        return cell;
      })
    );
    setBoard(updatedBoard);
    socket.emit('movePiece', { updatedBoard, move: 'Hero3 pieces added' });
  };

  const renderBoard = () => {
    return board.map((row, rowIndex) =>
      row.map((cell, colIndex) => (
        <div
          key={`${rowIndex}-${colIndex}`}
          className={`w-16 h-16 border border-gray-400 flex items-center justify-center
          ${cell && cell.startsWith('A') ? 'border-red-500' : ''}
          ${cell && cell.startsWith('B') ? 'border-blue-500' : ''}
          `}
          onClick={() => handleCellClick(rowIndex, colIndex)}
        >
          {cell}
        </div>
      ))
    );
  };

  useEffect(() => {
    if (moveHistory.length > 0) {
      setGameStarted(true);
    }
  }, [moveHistory]);

  return (
    <div className="flex justify-around items-center">
      <div>
        <div className="mt-4 text-lg font-semibold">Move History:</div>
        <div className="w-64 text-sm h-32 overflow-y-scroll border border-gray-400 bg-white p-2">
          {moveHistory.map((move, index) => (
            <div key={index}>{move}</div>
          ))}
        </div>
      </div>
      <div>
        <button
          className={`mb-4 text-white p-2 rounded-md bg-yellow-500 ${
            gameStarted ? 'hidden' : 'block'
          }`}
          onClick={addHero3}
        >
          Add Hero3
        </button>
        <div className="mb-4 text-lg font-semibold">
          {gameOver
            ? `Player ${winner} Wins!`
            : `Player ${currentPlayer === 1 ? 'A' : 'B'}'s Turn`}
        </div>
        <div className="flex flex-col items-center">
          <div className="grid grid-cols-5 gap-1">{renderBoard()}</div>
          {selectedPiece && !gameOver && (
            <div className="mt-5 flex space-x-4">
              {selectedPiece.piece.endsWith('H2') ? (
                <>
                  <button
                    onClick={() => movePiece('Back Left')}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Back Left
                  </button>
                  <button
                    onClick={() => movePiece('Back Right')}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Back Right
                  </button>
                  <button
                    onClick={() => movePiece('Front Left')}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Front Left
                  </button>
                  <button
                    onClick={() => movePiece('Front Right')}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Front Right
                  </button>
                </>
              ) : selectedPiece.piece.endsWith('H3') ? (
                <>
                  <button
                    onClick={() => movePiece('FL')}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Front Left
                  </button>
                  <button
                    onClick={() => movePiece('FR')}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Front Right
                  </button>
                  <button
                    onClick={() => movePiece('BL')}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Back Left
                  </button>
                  <button
                    onClick={() => movePiece('BR')}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Back Right
                  </button>
                  <button
                    onClick={() => movePiece('RF')}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Right Front
                  </button>
                  <button
                    onClick={() => movePiece('RB')}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Right Back
                  </button>
                  <button
                    onClick={() => movePiece('LF')}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Left Front
                  </button>
                  <button
                    onClick={() => movePiece('LB')}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Left Back
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => movePiece('Front')}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Front
                  </button>
                  <button
                    onClick={() => movePiece('Back')}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => movePiece('Left')}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Left
                  </button>
                  <button
                    onClick={() => movePiece('Right')}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Right
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <button
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
          onClick={resetGame}
        >
          Reset Game
        </button>
      </div>
      <ChatArea />
    </div>
  );
}

export default GameBoard;
