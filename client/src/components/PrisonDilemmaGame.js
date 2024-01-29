import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GameScoresPanel from './GameScoresPanel.js';

const ResultDisplay = ({ totalJailYearsPlayer1, totalJailYearsPlayer2, winner, onPlayAgain, onLogout }) => {
  return (
    <div className="result-container">
      <h2>{`Player 1 Total Jail Years: ${totalJailYearsPlayer1}`}</h2>
      <h2>{`Player 2 Total Jail Years: ${totalJailYearsPlayer2}`}</h2>
      <h2>{`Winner: ${winner}`}</h2>
      <button onClick={onPlayAgain} className="play-again-button">
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

  const navigate = useNavigate();

  useEffect(() => {
    const scores = JSON.parse(localStorage.getItem('gameScores')) || [];
    setGameScores(scores);
  }, []);

  const makeDecision = (decision) => {
    if (gameOver) return;

    const player1Decision = Math.random() < 0.5 ? 'cooperate' : 'betray';
    setPlayer1Choices([...player1Choices, player1Decision]);
    setPlayer2Choices([...player2Choices, decision]);

    calculatePoints(player1Decision, decision);

    setRoundCount(roundCount + 1);

    if (roundCount >= 3) {
      determineWinner();
      setGameOver(true);
 
      const newScore = {
        totalJailYearsPlayer1,
        totalJailYearsPlayer2,
        winner,
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

  const determineWinner = () => {
    const jailYearsPlayer1 = parseInt(totalJailYearsPlayer1, 10);
    const jailYearsPlayer2 = parseInt(totalJailYearsPlayer2, 10);
  
    if (isNaN(jailYearsPlayer1) || isNaN(jailYearsPlayer2)) {
      setWinner("Invalid results");
    } else {
      if (jailYearsPlayer1 < jailYearsPlayer2) {
        setWinner('Player 1');
      } else if (jailYearsPlayer1 > jailYearsPlayer2) {
        setWinner('Player 2');
      } else {
        setWinner("It's a tie!");
      }
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

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="game-container">
      <header>
        <h1>Prison Dilemma Game</h1>
        <button onClick={handleLogout} className="logout-button">
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
            <button onClick={() => makeDecision('cooperate')} disabled={gameOver} className="decision-button">
              Cooperate
            </button>
            <button onClick={() => makeDecision('betray')} disabled={gameOver} className="decision-button">
              Betray
            </button>
          </div>
        </>
      )}
      <button onClick={() => setShowScoresPanel(true)} className="show-scores-button">
        Show Scores
      </button>
      {showScoresPanel && <GameScoresPanel scores={gameScores} onClose={() => setShowScoresPanel(false)} />}
    </div>
  );
};

export default PrisonDilemmaGame;