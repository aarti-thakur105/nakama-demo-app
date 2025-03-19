// // src/screens/QuizScreen.js
// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   ActivityIndicator,
//   Animated
// } from 'react-native';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import NakamaService from './Nakama/NakamaService';
// import { QUESTIONS } from './Nakama/nakamaConfig';

// const QuizScreen = () => {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const { matchId, subject, ageGroup } = route.params;

//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [questions1, setQuestions] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [selectedAnswer, setSelectedAnswer] = useState(null);
//   const [scores, setScores] = useState({
//     player: 0,
//     opponent: 0
//   });
//   const [playerAnswers, setPlayerAnswers] = useState({});
//   const [opponentAnswers, setOpponentAnswers] = useState({});
//   const [timeRemaining, setTimeRemaining] = useState(30);
//   const [showResult, setShowResult] = useState(false);
//   const [waitingForOpponent, setWaitingForOpponent] = useState(false);
//   const [gameOver, setGameOver] = useState(false);
//   const [winner, setWinner] = useState(null);

//   const timerAnimation = useRef(new Animated.Value(1)).current;
//   const timerInterval = useRef(null);
//   const [isHost1, setIsHost1] = useState(false);

//   const questions = [
//     {
//       id: 1,
//       question: "What is the value of π (pi) to two decimal places?",
//       options: ["3.10", "3.14", "3.16", "3.18"],
//       correctAnswer: 1, // Index of correct answer (0-based)
//       timeLimit: 30 // seconds
//     },
//     {
//       id: 2,
//       question: "What is the square root of 144?",
//       options: ["10", "12", "14", "16"],
//       correctAnswer: 1,
//       timeLimit: 30
//     },
//     {
//       id: 3,
//       question: "If x + 2y = 10 and x - y = 1, what is the value of y?",
//       options: ["2", "3", "4", "5"],
//       correctAnswer: 1,
//       timeLimit: 30
//     },
//     {
//       id: 4,
//       question: "What is the sum of the angles in a triangle?",
//       options: ["90°", "180°", "270°", "360°"],
//       correctAnswer: 1,
//       timeLimit: 30
//     },
//     {
//       id: 5,
//       question: "What is 25% of 80?",
//       options: ["15", "20", "25", "30"],
//       correctAnswer: 1,
//       timeLimit: 30
//     }
//   ]

//   const currentQuestion = questions[currentQuestionIndex];
//   console.log("Current Index: ", currentQuestionIndex);
//   const isHost = NakamaService.isHost;
//   const questionIndexRef = useRef(0); // Store the latest index

//   useEffect(() => {
//     questionIndexRef.current = currentQuestionIndex;
//   }, [currentQuestionIndex]);

//   useEffect(() => {
//     // if (QUESTIONS[subject] && QUESTIONS[subject][ageGroup]) {
//     //   console.log("true")
//     //   setQuestions(QUESTIONS[subject][ageGroup]);
//     // } else {
//     //   console.log("false")
//     //   // Fallback to default questions if specific subject/age not found
//     //   setQuestions(QUESTIONS.math.teen);
//     // }
//     // Initialize game
//     initializeGame();

//     return () => {
//       // Clean up
//       clearInterval(timerInterval.current);
//       NakamaService.leaveMatch();
//     };
//   }, []);


//   const initializeGame = async () => {
//     try {
//       console.log("Game initialized as:", isHost ? "Host" : "Client");

//       // Setup match listeners
//       NakamaService.listenForMatchUpdates({
//         onAnswerReceived: handleOpponentAnswer,
//         onNextQuestion: handleNextQuestion,
//         onGameResult: handleGameResult,
//         onPlayerLeft: handlePlayerLeft,
//         onHostChanged: handleHostChanged
//       });

//       setIsLoading(false);
//       startTimer();
//     } catch (error) {
//       Alert.alert('Error', 'Failed to initialize game. Please try again.');
//       navigation.goBack();
//     }
//   };

//   const handleHostChanged = (newIsHost) => {
//     setIsHost1(newIsHost);

//     // If we just became the host and we're in the middle of a question, ensure the game continues
//     if (newIsHost && waitingForOpponent && !showResult) {
//       // Force progress to the next question if we're stuck
//       showQuestionResult();
//     }
//   };

//   const startTimer = () => {
//     // Reset timer
//     setTimeRemaining(30);
//     timerAnimation.setValue(1);

//     // Animate timer
//     Animated.timing(timerAnimation, {
//       toValue: 0,
//       duration: 30000,
//       useNativeDriver: false
//     }).start();

//     // Start countdown
//     clearInterval(timerInterval.current);
//     timerInterval.current = setInterval(() => {
//       setTimeRemaining(prevTime => {
//         if (prevTime <= 1) {
//           clearInterval(timerInterval.current);
//           handleTimeUp();
//           return 0;
//         }
//         return prevTime - 1;
//       });
//     }, 1000);
//   };

//   const handleTimeUp = () => {
//     const questionAtCurrentIndex = questions[currentQuestionIndex];

//     if (!questionAtCurrentIndex) {
//       console.error("Current question is undefined in handleTimeUp");
//       return;
//     }

//     showQuestionResult();
//   };


//   const handleOpponentAnswer = (userId, data) => {
//     let updatedAnswersOfOpponents;
//     setOpponentAnswers(prev => {
//       updatedAnswersOfOpponents = { ...prev, [data.questionId]: data.answerId };
//       return updatedAnswersOfOpponents;
//     });

//     setScores((prev) => {
//       const updatedScores = { ...prev, opponent: data.playerScore }; // Ensure opponent's score updates
//       console.log("Updated scores:", updatedScores);
//       return updatedScores;
//     });

//     // Check if both players have answered
//     // checkBothAnswered(data.questionId);
//   };

//   // const handleNextQuestion = (data) => {
//   //   console.log("Next question data: ", data)
//   //   setCurrentQuestionIndex(data.questionIndex);
//   //   setSelectedAnswer(null);
//   //   setWaitingForOpponent(false);
//   //   setShowResult(false);
//   //   startTimer();
//   // };

//   const handleNextQuestion = (data) => {
//     console.log("Next question data: ", data)
//     setCurrentQuestionIndex(data.questionIndex);
//     setSelectedAnswer(null);
//     setWaitingForOpponent(false);
//     setShowResult(false);
//     startTimer();

//     setQuestions((prev) => {
//       const updatedQuestions = [...prev];
//       updatedQuestions[data.questionIndex] = {
//         question: data.question,
//         options: data.options,
//         correctAnswer: data.correctAnswer,
//         timeLimit: data.timeLimit,
//       };
//       return updatedQuestions;
//     });

//   };
//   const handleGameResult = (data) => {
//     setGameOver(true);
//     setWinner(data.winner);

//     // Update final scores
//     setScores({
//       player: data.playerScore,
//       opponent: data.opponentScore
//     });
//   };

//   const handlePlayerLeft = (players) => {
//     Alert.alert('Opponent left', 'Your opponent has left the game.');
//     setGameOver(true);
//     setWinner('player'); // Default win if opponent leaves
//   };

//   const submitAnswer = async (answerId) => {
//     if (waitingForOpponent || showResult) return;

//     // clearInterval(timerInterval.current);

//     const currentQuestion = questions[currentQuestionIndex];
//     let updatedAnswersOfPlayer;
//     // Store player's answer
//     setSelectedAnswer(answerId);
//     setPlayerAnswers(prev => {
//       updatedAnswersOfPlayer = { ...prev, [currentQuestion.id]: answerId };
//       return updatedAnswersOfPlayer;
//     });

//     // Update score if correct
//     let newScore = scores.player;
//     if (answerId === currentQuestion.correctAnswer) {
//       newScore += 1; // Increment score if correct
//       setScores((prev) => ({ ...prev, player: newScore }));
//     }

//     // Send answer to opponent
//     await NakamaService.sendAnswer(
//       currentQuestion.id,
//       answerId,
//       30 - timeRemaining,
//       newScore
//     );
//     setWaitingForOpponent(true);

//     // Check if opponent has already answered
//     // checkBothAnswered(currentQuestion.id);
//   };


//   const checkBothAnswered = (questionId) => {
//     if (playerAnswers[questionId] !== undefined && opponentAnswers[questionId] !== undefined) {
//       showQuestionResult();
//     }
//   };

//   const showQuestionResult = () => {
//     setWaitingForOpponent(false);
//     setShowResult(true);
//     // Only the host should move to the next question
//     if (isHost) {
//       setTimeout(() => {
//         moveToNextQuestion();
//       }, 3000);
//     }
//   };

//   // const showQuestionResult = () => {
//   //   setWaitingForOpponent(false);
//   //   setShowResult(true);

//   //   // Only have one player (e.g., the host) progress to the next question
//   //   // This avoids race conditions with both players sending "next question" events
//   //   if (isHost) { // You need to add a way to determine who's the host
//   //     setTimeout(() => {
//   //       moveToNextQuestion();
//   //     }, 3000);
//   //   }
//   // };

//   // const moveToNextQuestion = () => {
//   //   console.log("moveToNextQuestion called");
//   //   if (currentQuestionIndex < questions.length - 1) {
//   //     const nextIndex = currentQuestionIndex + 1;

//   //     // Send the next question event to all players
//   //     NakamaService.forceNextQuestion(nextIndex);

//   //     // Note: You shouldn't update local state here if you want server-driven updates
//   //     // The state should update when handleNextQuestion is called
//   //   } else {
//   //     // Game over
//   //     endGame();
//   //   }
//   // };

//  const moveToNextQuestion = () => {
//   console.log("Moving to next question. Stored index:", questionIndexRef.current);

//   if (!isHost) {
//     return;
//   }

//   if (questionIndexRef.current < questions.length - 1) {
//     const nextIndex = questionIndexRef.current + 1;
//     console.log("Sending next question index:", nextIndex);
//     const nextQuestion = questions[nextIndex];

//     // Send the updated question index to all players
//     NakamaService.forceNextQuestion({
//       questionIndex: nextIndex,
//       question: nextQuestion.question,
//       options: nextQuestion.options,
//       correctAnswer: nextQuestion.correctAnswer,
//       timeLimit: nextQuestion.timeLimit,
//     });

//     // Update both state and ref
//     setCurrentQuestionIndex(prevIndex => {
//       const newIndex = prevIndex + 1;
//       questionIndexRef.current = newIndex; // Update ref with latest value
//       return newIndex;
//     });

//     setSelectedAnswer(null);
//     setShowResult(false);
//     startTimer();
//   } else {
//     console.log("End of questions. Ending game.");
//     endGame();
//   }
// };



//   const endGame = () => {
//     setGameOver(true);

//     // Determine winner
//     // const winner = scores.player > scores.opponent ? 'player' :
//     //   scores.player < scores.opponent ? 'opponent' : 'tie';
//     if (scores.player > scores.opponent) {
//       setWinner('player');
//     } else if (scores.player < scores.opponent) {
//       setWinner('opponent');
//     } else if (scores.player === scores.opponent) {
//       setWinner('tie');
//     }
//     else{
//       setWinner('Undefined');
//     }

//     console.log("All screoes: ", scores);
//     console.log("Winner: ", winner);
//     console.log("Player score: ", scores.player);
//     console.log("Opponent score: ", scores.opponent);
//     // Only the host should send the game result
//     if (isHost) {
//       NakamaService.endGame({
//         playerScore: scores.player,
//         opponentScore: scores.opponent,
//         winner: winner
//       });
//     }
//   };

//   if (isLoading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#4287f5" />
//         <Text style={styles.loadingText}>Preparing quiz...</Text>
//       </View>
//     );
//   }

//   if (gameOver) {
//     console.log("scores here: ", scores);
//     console.log("Player score1: ", scores.player);
//     console.log("Opponent score1: ", scores.opponent);
//     console.log("winner: ", winner)
//     return (
//       <View style={styles.container}>
//         <Text style={styles.gameOverTitle}>Game Over!</Text>

//         <View style={styles.scoreContainer}>
//           <Text style={styles.scoreText}>Final Score</Text>
//           <Text style={styles.scoreValue}>You: {scores.player}</Text>
//           <Text style={styles.scoreValue}>Opponent: {scores.opponent}</Text>
//         </View>

//         <Text style={[styles.winnerText,
//         winner === 'player' ? styles.winnerTextWin :
//           winner === 'opponent' ? styles.winnerTextLose :
//             styles.winnerTextTie]}>
//           {winner === 'player' ? 'You Won!' :
//             winner === 'opponent' ? 'You Lost!' : 'It\'s a Tie!'}
//         </Text>

//         <TouchableOpacity
//           style={styles.playAgainButton}
//           onPress={() => navigation.navigate('Home')}
//         >
//           <Text style={styles.playAgainButtonText}>Play Again</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }


//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <View style={styles.questionCounter}>
//           <Text style={styles.questionCounterText}>
//             Question {currentQuestionIndex + 1}/{questions.length}
//           </Text>
//         </View>

//         <View style={styles.scoreBoard}>
//           <Text style={styles.scoreText}>You: {scores.player}</Text>
//           <Text style={styles.scoreText}>Opponent: {scores.opponent}</Text>
//         </View>
//       </View>

//       <View style={styles.timerContainer}>
//         <Animated.View
//           style={[
//             styles.timerBar,
//             {
//               width: timerAnimation.interpolate({
//                 inputRange: [0, 1],
//                 outputRange: ['0%', '100%']
//               }),
//               backgroundColor: timerAnimation.interpolate({
//                 inputRange: [0, 0.3, 1],
//                 outputRange: ['#FF4136', '#FF851B', '#2ECC40']
//               })
//             }
//           ]}
//         />
//         <Text style={styles.timerText}>{timeRemaining}s</Text>
//       </View>

//       <View style={styles.questionContainer}>
//         <Text style={styles.questionText}>{currentQuestion.question}</Text>
//       </View>

//       <View style={styles.optionsContainer}>
//         {currentQuestion.options.map((option, index) => (
//           <TouchableOpacity
//             key={index}
//             style={[
//               styles.optionButton,
//               selectedAnswer === index && styles.selectedOption,
//               showResult && index === currentQuestion.correctAnswer && styles.correctOption,
//               showResult && selectedAnswer === index &&
//               selectedAnswer !== currentQuestion.correctAnswer && styles.incorrectOption
//             ]}
//             onPress={() => submitAnswer(index)}
//             disabled={selectedAnswer !== null || waitingForOpponent || showResult}
//           >
//             <Text style={[
//               styles.optionText,
//               showResult && index === currentQuestion.correctAnswer && styles.correctOptionText,
//               showResult && selectedAnswer === index &&
//               selectedAnswer !== currentQuestion.correctAnswer && styles.incorrectOptionText
//             ]}>
//               {option}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {waitingForOpponent && (
//         <View style={styles.waitingContainer}>
//           <ActivityIndicator size="small" color="#4287f5" />
//           <Text style={styles.waitingText}>Waiting for opponent...</Text>
//         </View>
//       )}

//       {showResult && (
//         <View style={styles.resultContainer}>
//           <Text style={styles.resultText}>
//             {selectedAnswer === currentQuestion.correctAnswer ?
//               '✓ Correct!' : '✗ Incorrect!'}
//           </Text>
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//     padding: 20,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: '#4287f5',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   questionCounter: {
//     backgroundColor: '#4287f5',
//     padding: 8,
//     borderRadius: 20,
//   },
//   questionCounterText: {
//     color: 'white',
//     fontWeight: 'bold',
//   },
//   scoreBoard: {
//     flexDirection: 'row',
//     gap: 10,
//   },
//   scoreText: {
//     fontWeight: 'bold',
//   },
//   timerContainer: {
//     height: 30,
//     backgroundColor: '#e0e0e0',
//     borderRadius: 15,
//     marginBottom: 20,
//     overflow: 'hidden',
//     position: 'relative',
//   },
//   timerBar: {
//     height: '100%',
//     position: 'absolute',
//     left: 0,
//     top: 0,
//   },
//   timerText: {
//     position: 'absolute',
//     width: '100%',
//     textAlign: 'center',
//     lineHeight: 30,
//     fontWeight: 'bold',
//   },
//   questionContainer: {
//     backgroundColor: 'white',
//     padding: 20,
//     borderRadius: 10,
//     marginBottom: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   questionText: {
//     fontSize: 18,
//     color: '#333',
//     fontWeight: '500',
//     textAlign: 'center',
//   },
//   optionsContainer: {
//     marginBottom: 20,
//   },
//   optionButton: {
//     backgroundColor: 'white',
//     padding: 15,
//     borderRadius: 10,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: '#ddd',
//   },
//   selectedOption: {
//     backgroundColor: '#E3F2FD',
//     borderColor: '#4287f5',
//   },
//   correctOption: {
//     backgroundColor: '#C8E6C9',
//     borderColor: '#2ECC40',
//   },
//   incorrectOption: {
//     backgroundColor: '#FFCDD2',
//     borderColor: '#FF4136',
//   },
//   optionText: {
//     fontSize: 16,
//     color: '#333',
//   },
//   correctOptionText: {
//     color: '#2ECC40',
//     fontWeight: 'bold',
//   },
//   incorrectOptionText: {
//     color: '#FF4136',
//     fontWeight: 'bold',
//   },
//   waitingContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 10,
//   },
//   waitingText: {
//     marginLeft: 10,
//     color: '#4287f5',
//   },
//   resultContainer: {
//     padding: 15,
//     alignItems: 'center',
//   },
//   resultText: {
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   gameOverTitle: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginBottom: 30,
//     color: '#333',
//   },
//   scoreContainer: {
//     backgroundColor: 'white',
//     padding: 20,
//     borderRadius: 10,
//     marginBottom: 30,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   scoreValue: {
//     fontSize: 18,
//     marginTop: 10,
//     fontWeight: '500',
//   },
//   winnerText: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginBottom: 30,
//   },
//   winnerTextWin: {
//     color: '#2ECC40',
//   },
//   winnerTextLose: {
//     color: '#FF4136',
//   },
//   winnerTextTie: {
//     color: '#4287f5',
//   },
//   playAgainButton: {
//     backgroundColor: '#4287f5',
//     padding: 15,
//     borderRadius: 10,
//     alignItems: 'center',
//   },
//   playAgainButtonText: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
// });

// export default QuizScreen;


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
  const [questions1, setQuestions] = useState([]);
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
  const [isHost1, setIsHost1] = useState(false);

  // Add refs to track current scores reliably
  const playerScoreRef = useRef(0);
  const opponentScoreRef = useRef(0);
  const questionIndexRef = useRef(0); // Store the latest index

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
  ]

  const currentQuestion = questions[currentQuestionIndex];
  const isHost = NakamaService.isHost;

  useEffect(() => {
    questionIndexRef.current = currentQuestionIndex;
  }, [currentQuestionIndex]);

  // Update score refs when scores state changes
  useEffect(() => {
    playerScoreRef.current = scores.player;
    opponentScoreRef.current = scores.opponent;
  }, [scores]);

  useEffect(() => {
    // if (QUESTIONS[subject] && QUESTIONS[subject][ageGroup]) {
    //   console.log("true")
    //   setQuestions(QUESTIONS[subject][ageGroup]);
    // } else {
    //   console.log("false")
    //   // Fallback to default questions if specific subject/age not found
    //   setQuestions(QUESTIONS.math.teen);
    // }
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
      console.log("Game initialized as:", isHost ? "Host" : "Client");

      // Setup match listeners
      NakamaService.listenForMatchUpdates({
        onAnswerReceived: handleOpponentAnswer,
        onNextQuestion: handleNextQuestion,
        onGameResult: handleGameResult,
        onPlayerLeft: handlePlayerLeft,
        onHostChanged: handleHostChanged
      });

      setIsLoading(false);
      startTimer();
    } catch (error) {
      Alert.alert('Error', 'Failed to initialize game. Please try again.');
      navigation.goBack();
    }
  };

  const handleHostChanged = (newIsHost) => {
    setIsHost1(newIsHost);

    // If we just became the host and we're in the middle of a question, ensure the game continues
    if (newIsHost && waitingForOpponent && !showResult) {
      // Force progress to the next question if we're stuck
      showQuestionResult();
    }
  };

  const startTimer = () => {
    // Reset timer
    setTimeRemaining(10);
    timerAnimation.setValue(1);

    // Animate timer
    Animated.timing(timerAnimation, {
      toValue: 0,
      duration: 10000,
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
    const questionAtCurrentIndex = questions[currentQuestionIndex];

    if (!questionAtCurrentIndex) {
      console.error("Current question is undefined in handleTimeUp");
      return;
    }

    showQuestionResult();
  };


  const handleOpponentAnswer = (userId, data) => {
    let updatedAnswersOfOpponents;
    setOpponentAnswers(prev => {
      updatedAnswersOfOpponents = { ...prev, [data.questionId]: data.answerId };
      return updatedAnswersOfOpponents;
    });

    // Update opponent score in both state and ref
    setScores((prev) => {
      const updatedScores = { ...prev, opponent: data.playerScore };
      opponentScoreRef.current = data.playerScore; // Update the ref immediately
      return updatedScores;
    });
  };

  const handleNextQuestion = (data) => {
    setCurrentQuestionIndex(data.questionIndex);
    setSelectedAnswer(null);
    setWaitingForOpponent(false);
    setShowResult(false);
    startTimer();

    setQuestions((prev) => {
      const updatedQuestions = [...prev];
      updatedQuestions[data.questionIndex] = {
        question: data.question,
        options: data.options,
        correctAnswer: data.correctAnswer,
        timeLimit: data.timeLimit,
      };
      return updatedQuestions;
    });
  };

  // const handleGameResult = (data) => {
  //   setGameOver(true);
  //   setWinner(data.winner);

  //   // Update final scores in both state and refs
  //   setScores({
  //     player: data.playerScore,
  //     opponent: data.opponentScore
  //   });

  //   playerScoreRef.current = data.playerScore;
  //   opponentScoreRef.current = data.opponentScore;
  // };

  const handleGameResult = (data) => {
    setGameOver(true);

    const playerUserId = NakamaService.userId;
    const opponentUserId = NakamaService.opponentId;


    setScores({
      player: data.playerScore,
      opponent: data.opponentScore,
    });

    playerScoreRef.current = data.playerScore;
    opponentScoreRef.current = data.opponentScore;

    // Determine winner based on received data
    let winner;
    if (data.winnerUserId === playerUserId) {
      winner = playerUserId;
    } else if (data.winnerUserId === 'tie') {
      winner = 'tie';
    } 
    // else {
    //   winner = 'tie';
    // }

    setWinner(winner);
  };

  const handlePlayerLeft = (players) => {
    Alert.alert('Opponent left', 'Your opponent has left the game.');
    setGameOver(true);
    setWinner('player'); // Default win if opponent leaves
  };

  const submitAnswer = async (answerId) => {
    if (waitingForOpponent || showResult) return;

    const currentQuestion = questions[currentQuestionIndex];
    let updatedAnswersOfPlayer;
    // Store player's answer
    setSelectedAnswer(answerId);
    setPlayerAnswers(prev => {
      updatedAnswersOfPlayer = { ...prev, [currentQuestion.id]: answerId };
      return updatedAnswersOfPlayer;
    });

    // Update score if correct
    let newScore = playerScoreRef.current; // Use ref for current score
    if (answerId === currentQuestion.correctAnswer) {
      newScore += 1; // Increment score if correct
      playerScoreRef.current = newScore; // Update ref immediately
      setScores((prev) => ({ ...prev, player: newScore }));
    }

    // Send answer to opponent - using ref value ensures we send the latest score
    await NakamaService.sendAnswer(
      currentQuestion.id,
      answerId,
      30 - timeRemaining,
      newScore
    );
    setWaitingForOpponent(true);
  };

  const showQuestionResult = () => {
    setWaitingForOpponent(false);
    setShowResult(true);
    // Only the host should move to the next question
    if (isHost) {
      setTimeout(() => {
        moveToNextQuestion();
      }, 3000);
    }
  };

  const moveToNextQuestion = () => {

    if (!isHost) {
      return;
    }

    if (questionIndexRef.current < questions.length - 1) {
      const nextIndex = questionIndexRef.current + 1;
      const nextQuestion = questions[nextIndex];

      // Send the updated question index to all players
      NakamaService.forceNextQuestion({
        questionIndex: nextIndex,
        question: nextQuestion.question,
        options: nextQuestion.options,
        correctAnswer: nextQuestion.correctAnswer,
        timeLimit: nextQuestion.timeLimit,
      });

      // Update both state and ref
      setCurrentQuestionIndex(prevIndex => {
        const newIndex = prevIndex + 1;
        questionIndexRef.current = newIndex; // Update ref with latest value
        return newIndex;
      });

      setSelectedAnswer(null);
      setShowResult(false);
      startTimer();
    } else {
      endGame();
    }
  };

  // const endGame = () => {
  //   setGameOver(true);

  //   // Use refs instead of state for reliable values
  //   const playerCurrentScore = playerScoreRef.current;
  //   const opponentCurrentScore = opponentScoreRef.current;

  //   console.log("All scores from refs: ", { player: playerCurrentScore, opponent: opponentCurrentScore });

  //   // Determine winner using ref values
  //   let currentWinner;
  //   if (playerCurrentScore > opponentCurrentScore) {
  //     currentWinner = 'player';
  //   } else if (playerCurrentScore < opponentCurrentScore) {
  //     currentWinner = 'opponent';
  //   } else {
  //     currentWinner = 'tie';
  //   }

  //   setWinner(currentWinner);

  //   console.log("Winner determined: ", currentWinner);
  //   console.log("Player score from ref: ", playerCurrentScore);
  //   console.log("Opponent score from ref: ", opponentCurrentScore);

  //   // Only the host should send the game result
  //   if (isHost) {
  //     NakamaService.endGame({
  //       playerScore: playerCurrentScore,
  //       opponentScore: opponentCurrentScore,
  //       winner: currentWinner
  //     });
  //   }
  // };

  const endGame = () => {
    setGameOver(true);

    const playerCurrentScore = playerScoreRef.current;
    const opponentCurrentScore = opponentScoreRef.current;

    const playerUserId = NakamaService.userId; // Get player's user ID
    const opponentUserId = NakamaService.opponentId; // Get opponent's user ID

    console.log("Player score: ", playerCurrentScore);
    console.log("Opponent score: ", opponentCurrentScore);
    console.log("Player ID: ", playerUserId);
    console.log("Opponent ID: ", opponentUserId);

    let winnerUserId;
    if (playerCurrentScore > opponentCurrentScore) {
      winnerUserId = playerUserId;
    } else if (playerCurrentScore === opponentCurrentScore) {
      winnerUserId = 'tie';
    } 
    // else {
    //   winnerUserId = 'tie';
    // }

    setWinner(winnerUserId);
    console.log("winner ID: ", winnerUserId);
    if (isHost) {
      NakamaService.endGame({
        playerScore: opponentCurrentScore,
        opponentScore: playerCurrentScore,
        playerUserId: playerUserId,
        opponentUserId: opponentUserId,
        winnerUserId: winnerUserId,
      });
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

  // if (gameOver) {
  //   console.log("scores here: ", scores);
  //   console.log("Player score1: ", scores.player);
  //   console.log("Opponent score1: ", scores.opponent);
  //   console.log("winner: ", winner)
  //   return (
  //     <View style={styles.container}>
  //       <Text style={styles.gameOverTitle}>Game Over!</Text>

  //       <View style={styles.scoreContainer}>
  //         <Text style={styles.scoreText}>Final Score</Text>
  //         <Text style={styles.scoreValue}>You: {scores.player}</Text>
  //         <Text style={styles.scoreValue}>Opponent: {scores.opponent}</Text>
  //       </View>

  //       <Text style={[styles.winnerText,
  //       winner === 'player' ? styles.winnerTextWin :
  //         winner === 'opponent' ? styles.winnerTextLose :
  //           styles.winnerTextTie]}>
  //         {winner === 'player' ? 'You Won!' :
  //           winner === 'opponent' ? 'You Lost!' : 'It\'s a Tie!'}
  //       </Text>

  //       <TouchableOpacity
  //         style={styles.playAgainButton}
  //         onPress={() => navigation.navigate('Home')}
  //       >
  //         <Text style={styles.playAgainButtonText}>Play Again</Text>
  //       </TouchableOpacity>
  //     </View>
  //   );
  // }

  if (gameOver) {
    const playerUserId = NakamaService.userId;
    const winnerId = winner; // Get opponent's user ID
    // const opponentUserId = NakamaService.opponentId; // Get opponent's user ID

    console.log("Player ID: ", playerUserId);
    console.log("Winner ID: ", winnerId);
    // console.log("Opponent ID: ", opponentUserId);
    return (
      <View style={styles.container}>
        <Text style={styles.gameOverTitle}>Game Over!</Text>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>Final Score</Text>
          <Text style={styles.scoreValue}>You: {scores.player}</Text>
          <Text style={styles.scoreValue}>Opponent: {scores.opponent}</Text>
        </View>

        {/* <Text style={[
          styles.winnerText,
          winner === playerUserId ? styles.winnerTextWin :
            winner === 'tie' ? styles.winnerTextTie :
              styles.winnerTextLose
        ]}>
          {winnerText}
        </Text> */}

        <Text style={[styles.winnerText, scores.player === scores.opponent ? styles.winnerTextTie : scores.player > scores.opponent ? styles.winnerTextWin : styles.winnerTextLose]}>
          {scores.player > scores.opponent ? 'You Won!' : scores.player === scores.opponent ? 'It\'s a Tie!' : 'You Lost!'}
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