import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import NakamaService from './Nakama/NakamaService';

const QuizScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { matchId, subject, ageGroup } = route.params;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [scores, setScores] = useState({
    player: 0,
    opponent: 0
  });
  const [playerAnswers, setPlayerAnswers] = useState({});
  const [opponentAnswers, setOpponentAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [showResult, setShowResult] = useState(false);
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [bothAnswered, setBothAnswered] = useState(false);

  const timerAnimation = useRef(new Animated.Value(1)).current;
  const timerInterval = useRef(null);

  const questions = [
    {
      id: 1,
      question: "What is the value of π (pi) to two decimal places?",
      options: ["3.10", "3.14", "3.16", "3.18"],
      correctAnswer: 1, // Index of correct answer (0-based)
      timeLimit: 30 // seconds
    },
    {
      id: 2,
      question: "What is the square root of 144?",
      options: ["10", "12", "14", "16"],
      correctAnswer: 1,
      timeLimit: 30
    },
    {
      id: 3,
      question: "If x + 2y = 10 and x - y = 1, what is the value of y?",
      options: ["2", "3", "4", "5"],
      correctAnswer: 1,
      timeLimit: 30
    },
    {
      id: 4,
      question: "What is the sum of the angles in a triangle?",
      options: ["90°", "180°", "270°", "360°"],
      correctAnswer: 1,
      timeLimit: 30
    },
    {
      id: 5,
      question: "What is 25% of 80?",
      options: ["15", "20", "25", "30"],
      correctAnswer: 1,
      timeLimit: 30
    }
  ];

  useEffect(() => {
    // Initialize game
    initializeGame();

    return () => {
      // Clean up
      clearInterval(timerInterval.current);
      NakamaService.leaveMatch();
    };
  }, []);

  const initializeGame = async () => {
    try {
      // Setup match listeners
      NakamaService.listenForMatchUpdates({
        onAnswerReceived: handleOpponentAnswer,
        onNextQuestion: handleNextQuestion,
        onGameResult: handleGameResult,
        onPlayerLeft: handlePlayerLeft
      });

      setIsLoading(false);
      startTimer();
      console.log("Questions: ", questions);
    } catch (error) {
      console.error('Error initializing game:', error);
      Alert.alert('Error', 'Failed to initialize game. Please try again.');
      navigation.goBack();
    }
  };

  const startTimer = () => {
    // Reset timer
    setTimeRemaining(30);
    timerAnimation.setValue(1);

    // Animate timer
    Animated.timing(timerAnimation, {
      toValue: 0,
      duration: 30000,
      useNativeDriver: false
    }).start();

    // Start countdown
    clearInterval(timerInterval.current);
    timerInterval.current = setInterval(() => {
      setTimeRemaining(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timerInterval.current);
          handleTimeUp();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const handleTimeUp = () => {
    // Get the current question directly from the questions array using currentQuestionIndex
    const questionAtCurrentIndex = questions[currentQuestionIndex];
    
    // Check if the question exists
    if (!questionAtCurrentIndex) {
      console.error("Current question is undefined in handleTimeUp", { currentQuestionIndex, questionsLength: questions.length });
      // If we're at the end, just show game over
      if (currentQuestionIndex >= questions.length) {
        endGame();
      }
      return;
    }
    
    // If answer was not selected, treat as incorrect
    if (selectedAnswer === null) {
      const questionId = questionAtCurrentIndex.id;
      setPlayerAnswers(prev => ({ ...prev, [questionId]: -1 })); // -1 indicates no answer
      
      // Send a timeout response to opponent
      NakamaService.sendAnswer(
        questionId,
        -1,  // -1 indicates no answer
        30,  // Full time elapsed
        false // Not correct
      );
    }
    
    // Show result after timer is up
    showQuestionResult();
  };

  const handleOpponentAnswer = (userId, data) => {
    console.log("Opponent data received: ", data);
    setOpponentAnswers(prev => {
      const updatedAnswers = { ...prev, [data.questionId]: data.answerId };
      return updatedAnswers;
    });
    
    // Update opponent score if their answer was correct
    if (data.isCorrect) {
      setScores(prev => ({
        ...prev,
        opponent: prev.opponent + 1
      }));
    }
    
    // Check if both players have answered
    checkBothAnswered();
  };
  
  const checkBothAnswered = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;
    
    const playerHasAnswered = playerAnswers[currentQuestion.id] !== undefined;
    const opponentHasAnswered = opponentAnswers[currentQuestion.id] !== undefined;
    
    if (playerHasAnswered && opponentHasAnswered) {
      setBothAnswered(true);
      
      // Continue timer until it expires naturally
      // Do not show result yet until timer completes
    }
  };

  const handleNextQuestion = (data) => {
    setCurrentQuestionIndex(data.questionIndex);
    setSelectedAnswer(null);
    setWaitingForOpponent(false);
    setShowResult(false);
    setBothAnswered(false);
    startTimer();
  };

  const handleGameResult = (data) => {
    console.log("Game result received: ", data);
    clearInterval(timerInterval.current);
    setGameOver(true);
    setWinner(data.winner === 'player' ? 'opponent' : 
              data.winner === 'opponent' ? 'player' : 'tie');
  
    // Update final scores - swap player and opponent scores
    setScores({
      player: data.opponentScore,  // This was the issue
      opponent: data.playerScore   // This was the issue
    });
  };

  const handlePlayerLeft = (players) => {
    clearInterval(timerInterval.current);
    Alert.alert('Opponent left', 'Your opponent has left the game.');
    setGameOver(true);
    setWinner('player'); // Default win if opponent leaves
  };

  const submitAnswer = async (answerId) => {
    if (selectedAnswer !== null || waitingForOpponent || showResult) return;

    const currentQuestion = questions[currentQuestionIndex];
    
    // Store player's answer
    setSelectedAnswer(answerId);
    setPlayerAnswers(prev => {
      const updatedAnswers = { ...prev, [currentQuestion.id]: answerId };
      return updatedAnswers;
    });
    
    // Check if answer is correct
    const isCorrect = answerId === currentQuestion.correctAnswer;
    
    // Update score if correct
    if (isCorrect) {
      setScores(prev => ({
        ...prev,
        player: prev.player + 1
      }));
    }

    // Send answer to opponent with correct/incorrect status
    await NakamaService.sendAnswer(
      currentQuestion.id,
      answerId,
      30 - timeRemaining,
      isCorrect
    );
    
    setWaitingForOpponent(true);
    
    // Check if opponent has already answered
    checkBothAnswered();
    
    // Do NOT show result yet - wait for the timer to complete
  };

  const showQuestionResult = () => {
    setWaitingForOpponent(false);
    setShowResult(true);

    // Wait 3 seconds before moving to next question
    setTimeout(() => {
      moveToNextQuestion();
    }, 3000);
  };

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setBothAnswered(false);
      startTimer();
    } else {
      // Game over - call endGame to transition to results screen
      endGame();
    }
  };

  const endGame = async () => {
    clearInterval(timerInterval.current);
    
    // Determine winner based on scores
    let gameWinner;
    if (scores.player > scores.opponent) {
      gameWinner = 'player';
    } else if (scores.player < scores.opponent) {
      gameWinner = 'opponent';
    } else {
      gameWinner = 'tie';
    }
    
    // Set these states
    setWinner(gameWinner);
    setGameOver(true);
  
    // Send game result to Nakama
    try {
      await NakamaService.sendGameResult({
        winner: gameWinner,
        playerScore: scores.player,
        opponentScore: scores.opponent
      });
    } catch (error) {
      console.error('Error sending game result:', error);
    }
  };
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4287f5" />
        <Text style={styles.loadingText}>Preparing quiz...</Text>
      </View>
    );
  }

  // Show game over screen if gameOver is true
  if (gameOver) {
    return (
      <View style={styles.container}>
        <Text style={styles.gameOverTitle}>Game Over!</Text>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>Final Score</Text>
          <Text style={styles.scoreValue}>You: {scores.player}</Text>
          <Text style={styles.scoreValue}>Opponent: {scores.opponent}</Text>
        </View>

        <Text style={[styles.winnerText,
          winner === 'player' ? styles.winnerTextWin :
          winner === 'opponent' ? styles.winnerTextLose :
          styles.winnerTextTie]}>
          {winner === 'player' ? 'You Won!' :
           winner === 'opponent' ? 'You Lost!' : 
           'It\'s a Tie!'}
        </Text>

        <TouchableOpacity
          style={styles.playAgainButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.playAgainButtonText}>Play Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Fallback for index out of bounds
  if (currentQuestionIndex >= questions.length) {
    setTimeout(() => endGame(), 0);
    
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4287f5" />
        <Text style={styles.loadingText}>Calculating results...</Text>
      </View>
    );
  }

  // Get the current question
  const currentQuestion = questions[currentQuestionIndex];
  console.log("Current question:", currentQuestion);
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.questionCounter}>
          <Text style={styles.questionCounterText}>
            Question {currentQuestionIndex + 1}/{questions.length}
          </Text>
        </View>

        <View style={styles.scoreBoard}>
          <Text style={styles.scoreText}>You: {scores.player}</Text>
          <Text style={styles.scoreText}>Opponent: {scores.opponent}</Text>
        </View>
      </View>

      <View style={styles.timerContainer}>
        <Animated.View
          style={[
            styles.timerBar,
            {
              width: timerAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%']
              }),
              backgroundColor: timerAnimation.interpolate({
                inputRange: [0, 0.3, 1],
                outputRange: ['#FF4136', '#FF851B', '#2ECC40']
              })
            }
          ]}
        />
        <Text style={styles.timerText}>{timeRemaining}s</Text>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
      </View>

      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              selectedAnswer === index && styles.selectedOption,
              showResult && index === currentQuestion.correctAnswer && styles.correctOption,
              showResult && selectedAnswer === index &&
              selectedAnswer !== currentQuestion.correctAnswer && styles.incorrectOption
            ]}
            onPress={() => submitAnswer(index)}
            disabled={selectedAnswer !== null || waitingForOpponent || showResult}
          >
            <Text style={[
              styles.optionText,
              showResult && index === currentQuestion.correctAnswer && styles.correctOptionText,
              showResult && selectedAnswer === index &&
              selectedAnswer !== currentQuestion.correctAnswer && styles.incorrectOptionText
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {waitingForOpponent && !bothAnswered && (
        <View style={styles.waitingContainer}>
          <ActivityIndicator size="small" color="#4287f5" />
          <Text style={styles.waitingText}>Waiting for opponent...</Text>
        </View>
      )}

      {bothAnswered && !showResult && (
        <View style={styles.waitingContainer}>
          <ActivityIndicator size="small" color="#4287f5" />
          <Text style={styles.waitingText}>Both answered. Waiting for timer...</Text>
        </View>
      )}

      {showResult && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>
            {selectedAnswer === currentQuestion.correctAnswer ?
              '✓ Correct!' : '✗ Incorrect!'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4287f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  questionCounter: {
    backgroundColor: '#4287f5',
    padding: 8,
    borderRadius: 20,
  },
  questionCounterText: {
    color: 'white',
    fontWeight: 'bold',
  },
  scoreBoard: {
    flexDirection: 'row',
    gap: 10,
  },
  scoreText: {
    fontWeight: 'bold',
  },
  timerContainer: {
    height: 30,
    backgroundColor: '#e0e0e0',
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  timerBar: {
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  timerText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    lineHeight: 30,
    fontWeight: 'bold',
  },
  questionContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  questionText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedOption: {
    backgroundColor: '#E3F2FD',
    borderColor: '#4287f5',
  },
  correctOption: {
    backgroundColor: '#C8E6C9',
    borderColor: '#2ECC40',
  },
  incorrectOption: {
    backgroundColor: '#FFCDD2',
    borderColor: '#FF4136',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  correctOptionText: {
    color: '#2ECC40',
    fontWeight: 'bold',
  },
  incorrectOptionText: {
    color: '#FF4136',
    fontWeight: 'bold',
  },
  waitingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  waitingText: {
    marginLeft: 10,
    color: '#4287f5',
  },
  resultContainer: {
    padding: 15,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  gameOverTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  scoreContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  scoreValue: {
    fontSize: 18,
    marginTop: 10,
    fontWeight: '500',
  },
  winnerText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  winnerTextWin: {
    color: '#2ECC40',
  },
  winnerTextLose: {
    color: '#FF4136',
  },
  winnerTextTie: {
    color: '#4287f5',
  },
  playAgainButton: {
    backgroundColor: '#4287f5',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  playAgainButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  }
});

export default QuizScreen;