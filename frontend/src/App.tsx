import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Answer } from './game/types';
import { createInitialState, calculateScore, sortLeaderboard, evaluateVerdict } from './game/gameState';
import { loadScenarios, getRandomScenario } from './game/scenarios';
import Setup from './screens/Setup';
import Game from './screens/Game';
import Results from './screens/Results';

const ID_KEY = 'cybersprint-team-id';

function generateRandomPart(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function generateTeamId(teamName: string): string {
  try {
    const existing = localStorage.getItem(ID_KEY);
    if (existing) return existing;
  } catch {
    // localStorage unavailable; fall through to fresh id
  }
  const slug = teamName.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12) || 'TEAM';
  const id = `${slug}-${generateRandomPart()}`;
  try {
    localStorage.setItem(ID_KEY, id);
  } catch {
    // ignore storage errors
  }
  return id;
}

function App() {
  const [state, setState] = useState<GameState>(createInitialState());
  const [scenariosLoaded, setScenariosLoaded] = useState(false);
  const timerRef = useRef<number | null>(null);
  const gameStartTime = useRef<number>(0);

  useEffect(() => {
    loadScenarios().then(() => setScenariosLoaded(true));
  }, []);

  useEffect(() => {
    if (!scenariosLoaded) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      const websocket = new WebSocket(wsUrl);
      
      websocket.onopen = () => {
        console.log('WebSocket connected');
      };

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'leaderboard') {
            setState(prev => ({
              ...prev,
              leaderboard: sortLeaderboard(data.leaderboard || [])
            }));
          } else if (data.type === 'gameStatus') {
            setState(prev => ({
              ...prev,
              isGameRunning: data.isRunning
            }));
          }
        } catch (e) {
          console.error('WebSocket message error:', e);
        }
      };

      websocket.onclose = () => {
        console.log('WebSocket disconnected');
      };

      return () => {
        websocket.close();
      };
    } catch (error) {
      console.error('WebSocket connection failed:', error);
    }
  }, [scenariosLoaded]);

  const startGame = useCallback(async (teamName: string) => {
    try {
      const teamId = generateTeamId(teamName);
      const response = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, teamName })
      });
      
      if (!response.ok) {
        throw new Error('Failed to join game');
      }

      const startResponse = await fetch('/api/start', {
        method: 'POST'
      });
      
      if (!startResponse.ok) {
        throw new Error('Failed to start game');
      }

      const scenario = getRandomScenario(new Set());
      
      setState(prev => ({
        ...prev,
        phase: 'playing',
        team: {
          id: teamId,
          name: teamName,
          score: 0,
          correctAnswers: 0,
          acceptableAnswers: 0,
          totalAnswers: 0,
          totalResponseTime: 0,
          scenarioIndex: 0,
          answeredIds: new Set()
        },
        currentScenario: scenario,
        score: 0,
        health: 100,
        timeRemaining: 300,
        isGameRunning: true,
        lastAnswer: null,
        showFeedback: false
      }));

      gameStartTime.current = Date.now();
    } catch (error) {
      console.error('Failed to start game:', error);
      alert('Failed to connect to server. Please try again.');
    }
  }, []);

  const handleAction = useCallback(async (actionId: string) => {
    if (!state.currentScenario || !state.team || state.showFeedback) return;

    const responseTime = (Date.now() - gameStartTime.current) / 1000;

    try {
      const response = await fetch('/api/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: state.team.id,
          scenarioId: state.currentScenario.id,
          action: actionId,
          actionTime: responseTime
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit decision');
      }

      const result = await response.json();

      const verdict = (result.verdict || (result.correct ? 'perfect' : 'wrong')) as Answer['verdict'];

      const answer: Answer = {
        scenarioId: state.currentScenario.id,
        action: actionId,
        verdict,
        correct: result.correct,
        pointsEarned: result.pointsEarned,
        explanation: result.explanation,
        consequence: result.consequence
      };

      const { score, health } = calculateScore(
        state,
        state.currentScenario,
        actionId,
        responseTime
      );

      setState(prev => ({
        ...prev,
        score,
        health,
        lastAnswer: answer,
        showFeedback: true,
        team: prev.team ? {
          ...prev.team,
          score,
          correctAnswers: prev.team.correctAnswers + (verdict === 'perfect' ? 1 : 0),
          acceptableAnswers: prev.team.acceptableAnswers + (verdict === 'acceptable' ? 1 : 0),
          totalAnswers: prev.team.totalAnswers + 1,
          answeredIds: new Set([...prev.team.answeredIds, state.currentScenario!.id])
        } : null
      }));

      setTimeout(() => {
        setState(prev => ({
          ...prev,
          showFeedback: false
        }));

        const nextScenario = getRandomScenario(
          state.team ? state.team.answeredIds : new Set()
        );
        
        setState(prev => ({
          ...prev,
          currentScenario: nextScenario
        }));

        gameStartTime.current = Date.now();
      }, 3000);

    } catch (error) {
      console.error('Failed to submit decision:', error);
      
      const verdict = evaluateVerdict(state.currentScenario, actionId);
      const pointsEarned = verdict === 'perfect'
        ? state.currentScenario.points
        : verdict === 'acceptable'
          ? 0
          : -Math.floor(state.currentScenario.points / 3);

      const answer: Answer = {
        scenarioId: state.currentScenario.id,
        action: actionId,
        verdict,
        correct: verdict !== 'wrong',
        pointsEarned,
        explanation: state.currentScenario.explanation,
      };

      const { score, health } = calculateScore(
        state,
        state.currentScenario,
        actionId,
        responseTime
      );

      setState(prev => ({
        ...prev,
        score,
        health,
        lastAnswer: answer,
        showFeedback: true,
        team: prev.team ? {
          ...prev.team,
          score,
          correctAnswers: prev.team.correctAnswers + (verdict === 'perfect' ? 1 : 0),
          acceptableAnswers: prev.team.acceptableAnswers + (verdict === 'acceptable' ? 1 : 0),
          totalAnswers: prev.team.totalAnswers + 1,
          answeredIds: new Set([...prev.team.answeredIds, state.currentScenario!.id])
        } : null
      }));

      setTimeout(() => {
        setState(prev => ({
          ...prev,
          showFeedback: false
        }));

        const nextScenario = getRandomScenario(
          state.team ? state.team.answeredIds : new Set()
        );
        
        setState(prev => ({
          ...prev,
          currentScenario: nextScenario
        }));

        gameStartTime.current = Date.now();
      }, 3000);
    }
  }, [state]);

  useEffect(() => {
    if (!state.isGameRunning || state.timeRemaining <= 0) return;

    timerRef.current = window.setInterval(() => {
      setState(prev => {
        const newTime = prev.timeRemaining - 1;
        
        if (newTime <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          
          fetch('/api/end-game', { method: 'POST' }).catch(console.error);
          
          return {
            ...prev,
            timeRemaining: 0,
            isGameRunning: false,
            phase: 'results'
          };
        }
        
        return {
          ...prev,
          timeRemaining: newTime
        };
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [state.isGameRunning]);

  const handlePlayAgain = useCallback(() => {
    setState(createInitialState());
  }, []);

  if (!scenariosLoaded) {
    return (
      <div className="min-h-screen bg-cyber-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyber-blue mx-auto mb-4"></div>
          <p className="text-cyber-blue text-lg">Loading CyberSprint...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-dark">
      {state.phase === 'setup' && (
        <Setup onStart={startGame} />
      )}
      
      {state.phase === 'playing' && (
        <Game
          state={state}
          onAction={handleAction}
          onEndGame={() => {
            fetch('/api/end-game', { method: 'POST' }).catch(console.error);
            setState(prev => ({ ...prev, phase: 'results', isGameRunning: false }));
          }}
        />
      )}
      
      {state.phase === 'results' && (
        <Results
          state={state}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
}

export default App;
