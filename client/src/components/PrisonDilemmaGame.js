import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GameScoresPanel from './GameScoresPanel.js';
import { useAuth } from './AuthContext.js';
import '../App.css'

const ResultDisplay = ({ totalJailYearsPlayer1, totalJailYearsPlayer2, winner, onPlayAgain, onLogout }) => {
  return (
    <div className="result-container">
      <h2>{`PC Total Jail Years: ${totalJailYearsPlayer1}`}</h2>
      <h2>{`YOU Total Jail Years: ${totalJailYearsPlayer2}`}</h2>
      {/* <h2>{`Winner: ${winner}`}</h2> */}
      <button onClick={onPlayAgain} className="play-button">
        Play Again
      </button>
    </div>
  );
};

const PrisonDilemmaGame = ({ onLogout }) => {
  const [roundCount, setRoundCount] = useState(0);
  const [player1Choices, setPlayer1Choices] = useState([]);
  const [player2Choices, setPlayer2Choices] = useState([]);
  const [totalJailYearsPlayer1, setTotalJailYearsPlayer1] = useState(0);
  const [totalJailYearsPlayer2, setTotalJailYearsPlayer2] = useState(0);
  const [winner, setWinner] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [showScoresPanel, setShowScoresPanel] = useState(false);
  const [gameScores, setGameScores] = useState([]);
  const [authToken, setAuthToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // const makeDecision = async (decision) => {
  //   if (gameOver) return;

  //   try {
  //     const response = await fetch('http://localhost:5000/api/play-round', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ userMove: decision }),
  //     });

  //     if (response.ok) {
  //       const data = await response.json();

  //       // Update state based on the API response
  //       setComputerMove(data.computerMove);
  //       setResult(data.result);
  //       setTotalJailYearsPlayer1(data.scores.user);
  //       setTotalJailYearsPlayer2(data.scores.computer);
  //       setGameOver(data.gameOver);
  //     } else {
  //       // Handle error response from the API
  //       console.error('Error playing round:', response.statusText);
  //     }
  //   } catch (error) {
  //     // Handle network or other errors
  //     console.error('Error playing round:', error);
  //   }

  //   setRoundCount(roundCount + 1);

  //   if (roundCount >= 3) {
  //     setGameOver(true);
  //   }
  // };

  // useEffect(() => {
  //   const scores = JSON.parse(localStorage.getItem('gameScores')) || [];
  //   setGameScores(scores);
  // }, []);

  const makeDecision = (decision) => {
    if (gameOver) return;

    const player1Decision = Math.random() < 0.5 ? 'cooperate' : 'betray';
    setPlayer1Choices([...player1Choices, player1Decision]);
    setPlayer2Choices([...player2Choices, decision]);

    calculatePoints(player1Decision, decision);

    setRoundCount(roundCount + 1);

    if (roundCount >= 3) {
      // determineWinner();
      setGameOver(true);
 
      const newScore = {
        totalJailYearsPlayer1,
        totalJailYearsPlayer2
      };
      const scores = [...gameScores, newScore];
      localStorage.setItem('gameScores', JSON.stringify(scores));
    }
  };


  const calculatePoints = (p1, p2) => {
    switch (true) {
      case p1 === 'cooperate' && p2 === 'cooperate':
        setTotalJailYearsPlayer1(totalJailYearsPlayer1 + 2);
        setTotalJailYearsPlayer2(totalJailYearsPlayer2 + 2);
        break;
      case p1 === 'betray' && p2 === 'cooperate':
        setTotalJailYearsPlayer1(totalJailYearsPlayer1 + 0);
        setTotalJailYearsPlayer2(totalJailYearsPlayer2 + 5);
        break;
      case p1 === 'cooperate' && p2 === 'betray':
        setTotalJailYearsPlayer1(totalJailYearsPlayer1 + 5);
        setTotalJailYearsPlayer2(totalJailYearsPlayer2 + 0);
        break;
      case p1 === 'betray' && p2 === 'betray':
        setTotalJailYearsPlayer1(totalJailYearsPlayer1 + 3);
        setTotalJailYearsPlayer2(totalJailYearsPlayer2 + 3);
        break;
      default:
        break;
    }
  };



  const resetGame = () => {
    const newScore = {
      totalJailYearsPlayer1,
      totalJailYearsPlayer2,
      winner,
      timestamp: Date.now()
    };

    setGameScores([...gameScores, newScore]);
    setRoundCount(0);
    setPlayer1Choices([]);
    setPlayer2Choices([]);
    setTotalJailYearsPlayer1(0);
    setTotalJailYearsPlayer2(0);
    setWinner(null);
    setGameOver(false);

    localStorage.setItem('gameScores', JSON.stringify([...gameScores, newScore]));
  };

  const handleLogout = async () => {
    try {
      // Your logout logic, e.g., calling a backend endpoint to invalidate the token
      const response = await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Include credentials (cookies) in the request
      });

      if (response.ok) {
        console.log('Logout successful');
        logout();
      } else {
        const data = await response.json();
        console.log('Logout failed. Message:', data.message);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className="game-container">
      <header>
        <h1>Prison Dilemma Game</h1>
        <button onClick={handleLogout} className="play-button">
          Logout
        </button>
      </header>
      {gameOver ? (
        <ResultDisplay
          totalJailYearsPlayer1={totalJailYearsPlayer1}
          totalJailYearsPlayer2={totalJailYearsPlayer2}
          winner={winner}
          onPlayAgain={resetGame}
          onLogout={handleLogout}
        />
      ) : (
        <>
          <h2>{`Round ${roundCount + 1}: Make your decision`}</h2>
          <div className="button-container">
            <button onClick={() => makeDecision('cooperate')} disabled={gameOver} className="play-button">
              Cooperate
            </button>
            <button onClick={() => makeDecision('betray')} disabled={gameOver} className="play-button">
              Betray
            </button>
          </div>
        </>
      )}
      <button onClick={() => setShowScoresPanel(true)} className="play-button">
        Show Scores
      </button>
      {showScoresPanel && <GameScoresPanel scores={gameScores} onClose={() => setShowScoresPanel(false)} />}
    </div>
  );
};

export default PrisonDilemmaGame;