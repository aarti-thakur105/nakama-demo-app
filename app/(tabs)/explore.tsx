// src/screens/QuizScreen.js
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
import { QUESTIONS } from './Nakama/nakamaConfig';

const QuizScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { matchId, subject, ageGroup } = route.params;
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
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
  
  const timerAnimation = useRef(new Animated.Value(1)).current;
  const timerInterval = useRef(null);

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
      // Get questions
      if (QUESTIONS[subject] && QUESTIONS[subject][ageGroup]) {
        setQuestions(QUESTIONS[subject][ageGroup]);
      } else {
        // Fallback to default questions if specific subject/age not found
        setQuestions(QUESTIONS.math.teen);
      }
      
      // Setup match listeners
      NakamaService.listenForMatchUpdates({
        onAnswerReceived: handleOpponentAnswer,
        onNextQuestion: handleNextQuestion,
        onGameResult: handleGameResult,
        onPlayerLeft: handlePlayerLeft
      });
      
      setIsLoading(false);
      startTimer();
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
    // If answer not selected, submit timeout
    if (selectedAnswer === null) {
      submitAnswer(-1);
    }
  };

  const handleOpponentAnswer = (userId, data) => {
    console.log('Opponent answer received:', data);
    
    // Store opponent's answer
    setOpponentAnswers(prev => ({
      ...prev,
      [data.questionId]: data.answerId
    }));
    
    // Check if both players have answered
    checkBothAnswered(data.questionId);
  };

  const handleNextQuestion = (data) => {
    console.log('Next question:', data);
    setCurrentQuestionIndex(data.questionIndex);
    setSelectedAnswer(null);
    setWaitingForOpponent(false);
    setShowResult(false);
    startTimer();
  };

  const handleGameResult = (data) => {
    console.log('Game result:', data);
    setGameOver(true);
    setWinner(data.winner);
    
    // Update final scores
    setScores({
      player: data.playerScore,
      opponent: data.opponentScore
    });
  };

  const handlePlayerLeft = (players) => {
    Alert.alert('Opponent left', 'Your opponent has left the game.');
    setGameOver(true);
    setWinner('player'); // Default win if opponent leaves
  };

  const submitAnswer = async (answerId) => {
    if (waitingForOpponent || showResult) return;
    
    clearInterval(timerInterval.current);
    
    const currentQuestion = questions[currentQuestionIndex];
    
    // Store player's answer
    setSelectedAnswer(answerId);
    setPlayerAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answerId
    }));
    
    // Update score if correct
    if (answerId === currentQuestion.correctAnswer) {
      setScores(prev => ({
        ...prev,
        player: prev.player + 1
      }));
    }
    
    // Send answer to opponent
    await NakamaService.sendAnswer(
      currentQuestion.id,
      answerId,
      30 - timeRemaining
    );
    
    setWaitingForOpponent(true);
    
    // Check if opponent has already answered
    checkBothAnswered(currentQuestion.id);
  };

  const checkBothAnswered = (questionId) => {
    if (playerAnswers[questionId] !== undefined && opponentAnswers[questionId] !== undefined) {
      showQuestionResult();
    }
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
      // Move to next question
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      startTimer();
    } else {
      // Game over
      endGame();
    }
  };

  const endGame = () => {
    setGameOver(true);
    
    // Determine winner
    const winner = scores.player > scores.opponent ? 'player' : 
                   scores.player < scores.opponent ? 'opponent' : 'tie';
    setWinner(winner);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4287f5" />
        <Text style={styles.loadingText}>Preparing quiz...</Text>
      </View>
    );
  }

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
           winner === 'opponent' ? 'You Lost!' : 'It\'s a Tie!'}
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

  const currentQuestion = questions[currentQuestionIndex];

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
      
      {waitingForOpponent && (
        <View style={styles.waitingContainer}>
          <ActivityIndicator size="small" color="#4287f5" />
          <Text style={styles.waitingText}>Waiting for opponent...</Text>
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
  },
});

export default QuizScreen;