// // import React, { useState, useEffect, useRef } from 'react';
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   TouchableOpacity,
// //   Alert,
// //   ActivityIndicator,
// //   Animated
// // } from 'react-native';
// // import { useNavigation, useRoute } from '@react-navigation/native';
// // import NakamaService from './Nakama/NakamaService';
// // import { QUESTIONS } from './Nakama/nakamaConfig';

// // const QuizScreen = () => {
// //   const navigation = useNavigation();
// //   const route = useRoute();
// //   const { matchId, subject, ageGroup } = route.params;

// //   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
// //   const [questions1, setQuestions] = useState([]);
// //   const [isLoading, setIsLoading] = useState(true);
// //   const [selectedAnswer, setSelectedAnswer] = useState(null);
// //   const [scores, setScores] = useState({
// //     player: 0,
// //     opponent: 0
// //   });
// //   const [playerAnswers, setPlayerAnswers] = useState({});
// //   const [opponentAnswers, setOpponentAnswers] = useState({});
// //   const [timeRemaining, setTimeRemaining] = useState(30);
// //   const [showResult, setShowResult] = useState(false);
// //   const [waitingForOpponent, setWaitingForOpponent] = useState(false);
// //   const [gameOver, setGameOver] = useState(false);
// //   const [winner, setWinner] = useState(null);

// //   const timerAnimation = useRef(new Animated.Value(1)).current;
// //   const timerInterval = useRef(null);
// //   const [isHost1, setIsHost1] = useState(false);

// //   // Add refs to track current scores reliably
// //   const playerScoreRef = useRef(0);
// //   const opponentScoreRef = useRef(0);
// //   const questionIndexRef = useRef(0); // Store the latest index

// //   const questions = [
// //     {
// //       id: 1,
// //       question: "What is the value of π (pi) to two decimal places?",
// //       options: ["3.10", "3.14", "3.16", "3.18"],
// //       correctAnswer: 1, // Index of correct answer (0-based)
// //       timeLimit: 30 // seconds
// //     },
// //     {
// //       id: 2,
// //       question: "What is the square root of 144?",
// //       options: ["10", "12", "14", "16"],
// //       correctAnswer: 1,
// //       timeLimit: 30
// //     },
// //     {
// //       id: 3,
// //       question: "If x + 2y = 10 and x - y = 1, what is the value of y?",
// //       options: ["2", "3", "4", "5"],
// //       correctAnswer: 1,
// //       timeLimit: 30
// //     },
// //     {
// //       id: 4,
// //       question: "What is the sum of the angles in a triangle?",
// //       options: ["90°", "180°", "270°", "360°"],
// //       correctAnswer: 1,
// //       timeLimit: 30
// //     },
// //     {
// //       id: 5,
// //       question: "What is 25% of 80?",
// //       options: ["15", "20", "25", "30"],
// //       correctAnswer: 1,
// //       timeLimit: 30
// //     }
// //   ]

  
// //   const currentQuestion = questions[currentQuestionIndex];
// //   const isHost = NakamaService.isHost;

// //   useEffect(() => {
// //     questionIndexRef.current = currentQuestionIndex;
// //   }, [currentQuestionIndex]);

// //   // Update score refs when scores state changes
// //   useEffect(() => {
// //     playerScoreRef.current = scores.player;
// //     opponentScoreRef.current = scores.opponent;
// //   }, [scores]);

// //   useEffect(() => {
// //     initializeGame();

// //     return () => {
// //       // Clean up
// //       clearInterval(timerInterval.current);
// //       NakamaService.leaveMatch();
// //     };
// //   }, []);


// //   const initializeGame = async () => {
// //     try {
// //       console.log("Game initialized as:", isHost ? "Host" : "Client");

// //       // Setup match listeners
// //       NakamaService.listenForMatchUpdates({
// //         onAnswerReceived: handleOpponentAnswer,
// //         onNextQuestion: handleNextQuestion,
// //         onGameResult: handleGameResult,
// //         onPlayerLeft: handlePlayerLeft,
// //         onHostChanged: handleHostChanged
// //       });

// //       setIsLoading(false);
// //       startTimer();
// //     } catch (error) {
// //       Alert.alert('Error', 'Failed to initialize game. Please try again.');
// //       navigation.goBack();
// //     }
// //   };

// //   const handleHostChanged = (newIsHost) => {
// //     setIsHost1(newIsHost);

// //     // If we just became the host and we're in the middle of a question, ensure the game continues
// //     if (newIsHost && waitingForOpponent && !showResult) {
// //       // Force progress to the next question if we're stuck
// //       showQuestionResult();
// //     }
// //   };

// //   const startTimer = () => {
// //     // Reset timer
// //     setTimeRemaining(10);
// //     timerAnimation.setValue(1);

// //     // Animate timer
// //     Animated.timing(timerAnimation, {
// //       toValue: 0,
// //       duration: 10000,
// //       useNativeDriver: false
// //     }).start();

// //     // Start countdown
// //     clearInterval(timerInterval.current);
// //     timerInterval.current = setInterval(() => {
// //       setTimeRemaining(prevTime => {
// //         if (prevTime <= 1) {
// //           clearInterval(timerInterval.current);
// //           handleTimeUp();
// //           return 0;
// //         }
// //         return prevTime - 1;
// //       });
// //     }, 1000);
// //   };

// //   const handleTimeUp = () => {
// //     const questionAtCurrentIndex = questions[currentQuestionIndex];

// //     if (!questionAtCurrentIndex) {
// //       console.error("Current question is undefined in handleTimeUp");
// //       return;
// //     }

// //     showQuestionResult();
// //   };


// //   const handleOpponentAnswer = (userId, data) => {
// //     let updatedAnswersOfOpponents;
// //     setOpponentAnswers(prev => {
// //       updatedAnswersOfOpponents = { ...prev, [data.questionId]: data.answerId };
// //       return updatedAnswersOfOpponents;
// //     });

// //     // Update opponent score in both state and ref
// //     setScores((prev) => {
// //       const updatedScores = { ...prev, opponent: data.playerScore };
// //       opponentScoreRef.current = data.playerScore; // Update the ref immediately
// //       return updatedScores;
// //     });
// //   };

// //   const handleNextQuestion = (data) => {
// //     setCurrentQuestionIndex(data.questionIndex);
// //     setSelectedAnswer(null);
// //     setWaitingForOpponent(false);
// //     setShowResult(false);
// //     startTimer();

// //     setQuestions((prev) => {
// //       const updatedQuestions = [...prev];
// //       updatedQuestions[data.questionIndex] = {
// //         question: data.question,
// //         options: data.options,
// //         correctAnswer: data.correctAnswer,
// //         timeLimit: data.timeLimit,
// //       };
// //       return updatedQuestions;
// //     });
// //   };

// //   // const handleGameResult = (data) => {
// //   //   setGameOver(true);
// //   //   setWinner(data.winner);

// //   //   // Update final scores in both state and refs
// //   //   setScores({
// //   //     player: data.playerScore,
// //   //     opponent: data.opponentScore
// //   //   });

// //   //   playerScoreRef.current = data.playerScore;
// //   //   opponentScoreRef.current = data.opponentScore;
// //   // };

// //   const handleGameResult = (data) => {
// //     setGameOver(true);

// //     const playerUserId = NakamaService.userId;
// //     const opponentUserId = NakamaService.opponentId;


// //     setScores({
// //       player: data.playerScore,
// //       opponent: data.opponentScore,
// //     });

// //     playerScoreRef.current = data.playerScore;
// //     opponentScoreRef.current = data.opponentScore;

// //     // Determine winner based on received data
// //     let winner;
// //     if (data.winnerUserId === playerUserId) {
// //       winner = playerUserId;
// //     } else if (data.winnerUserId === 'tie') {
// //       winner = 'tie';
// //     } 
// //     // else {
// //     //   winner = 'tie';
// //     // }

// //     setWinner(winner);
// //   };

// //   const handlePlayerLeft = (players) => {
// //     Alert.alert('Opponent left', 'Your opponent has left the game.');
// //     setGameOver(true);
// //     setWinner('player'); // Default win if opponent leaves
// //   };

// //   const submitAnswer = async (answerId) => {
// //     if (waitingForOpponent || showResult) return;

// //     const currentQuestion = questions[currentQuestionIndex];
// //     let updatedAnswersOfPlayer;
// //     // Store player's answer
// //     setSelectedAnswer(answerId);
// //     setPlayerAnswers(prev => {
// //       updatedAnswersOfPlayer = { ...prev, [currentQuestion.id]: answerId };
// //       return updatedAnswersOfPlayer;
// //     });

// //     // Update score if correct
// //     let newScore = playerScoreRef.current; // Use ref for current score
// //     if (answerId === currentQuestion.correctAnswer) {
// //       newScore += 1; // Increment score if correct
// //       playerScoreRef.current = newScore; // Update ref immediately
// //       setScores((prev) => ({ ...prev, player: newScore }));
// //     }

// //     // Send answer to opponent - using ref value ensures we send the latest score
// //     await NakamaService.sendAnswer(
// //       currentQuestion.id,
// //       answerId,
// //       30 - timeRemaining,
// //       newScore
// //     );
// //     setWaitingForOpponent(true);
// //   };

// //   const showQuestionResult = () => {
// //     setWaitingForOpponent(false);
// //     setShowResult(true);
// //     // Only the host should move to the next question
// //     if (isHost) {
// //       setTimeout(() => {
// //         moveToNextQuestion();
// //       }, 3000);
// //     }
// //   };

// //   const moveToNextQuestion = () => {

// //     if (!isHost) {
// //       return;
// //     }

// //     if (questionIndexRef.current < questions.length - 1) {
// //       const nextIndex = questionIndexRef.current + 1;
// //       const nextQuestion = questions[nextIndex];

// //       // Send the updated question index to all players
// //       NakamaService.forceNextQuestion({
// //         questionIndex: nextIndex,
// //         question: nextQuestion.question,
// //         options: nextQuestion.options,
// //         correctAnswer: nextQuestion.correctAnswer,
// //         timeLimit: nextQuestion.timeLimit,
// //       });

// //       // Update both state and ref
// //       setCurrentQuestionIndex(prevIndex => {
// //         const newIndex = prevIndex + 1;
// //         questionIndexRef.current = newIndex; // Update ref with latest value
// //         return newIndex;
// //       });

// //       setSelectedAnswer(null);
// //       setShowResult(false);
// //       startTimer();
// //     } else {
// //       endGame();
// //     }
// //   };

// //   const endGame = () => {
// //     setGameOver(true);

// //     const playerCurrentScore = playerScoreRef.current;
// //     const opponentCurrentScore = opponentScoreRef.current;

// //     const playerUserId = NakamaService.userId; // Get player's user ID
// //     const opponentUserId = NakamaService.opponentId; // Get opponent's user ID

// //     console.log("Player score: ", playerCurrentScore);
// //     console.log("Opponent score: ", opponentCurrentScore);
// //     console.log("Player ID: ", playerUserId);
// //     console.log("Opponent ID: ", opponentUserId);

// //     let winnerUserId;
// //     if (playerCurrentScore > opponentCurrentScore) {
// //       winnerUserId = playerUserId;
// //     } else if (playerCurrentScore === opponentCurrentScore) {
// //       winnerUserId = 'tie';
// //     } 
// //     // else {
// //     //   winnerUserId = 'tie';
// //     // }

// //     setWinner(winnerUserId);
// //     console.log("winner ID: ", winnerUserId);
// //     if (isHost) {
// //       NakamaService.endGame({
// //         playerScore: opponentCurrentScore,
// //         opponentScore: playerCurrentScore,
// //         playerUserId: playerUserId,
// //         opponentUserId: opponentUserId,
// //         winnerUserId: winnerUserId,
// //       });
// //     }
// //   };

// //   if (isLoading) {
// //     return (
// //       <View style={styles.loadingContainer}>
// //         <ActivityIndicator size="large" color="#4287f5" />
// //         <Text style={styles.loadingText}>Preparing quiz...</Text>
// //       </View>
// //     );
// //   }

// //   if (gameOver) {
// //     const playerUserId = NakamaService.userId;
// //     const winnerId = winner; // Get opponent's user ID
// //     // const opponentUserId = NakamaService.opponentId; // Get opponent's user ID

// //     console.log("Player ID: ", playerUserId);
// //     console.log("Winner ID: ", winnerId);
// //     // console.log("Opponent ID: ", opponentUserId);
// //     return (
// //       <View style={styles.container}>
// //         <Text style={styles.gameOverTitle}>Game Over!</Text>

// //         <View style={styles.scoreContainer}>
// //           <Text style={styles.scoreText}>Final Score</Text>
// //           <Text style={styles.scoreValue}>You: {scores.player}</Text>
// //           <Text style={styles.scoreValue}>Opponent: {scores.opponent}</Text>
// //         </View>

// //         <Text style={[styles.winnerText, scores.player === scores.opponent ? styles.winnerTextTie : scores.player > scores.opponent ? styles.winnerTextWin : styles.winnerTextLose]}>
// //           {scores.player > scores.opponent ? 'You Won!' : scores.player === scores.opponent ? 'It\'s a Tie!' : 'You Lost!'}
// //         </Text>


// //         <TouchableOpacity
// //           style={styles.playAgainButton}
// //           onPress={() => navigation.navigate('Home')}
// //         >
// //           <Text style={styles.playAgainButtonText}>Play Again</Text>
// //         </TouchableOpacity>
// //       </View>
// //     );
// //   }

// //   return (
// //     <View style={styles.container}>
// //       <View style={styles.header}>
// //         <View style={styles.questionCounter}>
// //           <Text style={styles.questionCounterText}>
// //             Question {currentQuestionIndex + 1}/{questions.length}
// //           </Text>
// //         </View>

// //         <View style={styles.scoreBoard}>
// //           <Text style={styles.scoreText}>You: {scores.player}</Text>
// //           <Text style={styles.scoreText}>Opponent: {scores.opponent}</Text>
// //         </View>
// //       </View>

// //       <View style={styles.timerContainer}>
// //         <Animated.View
// //           style={[
// //             styles.timerBar,
// //             {
// //               width: timerAnimation.interpolate({
// //                 inputRange: [0, 1],
// //                 outputRange: ['0%', '100%']
// //               }),
// //               backgroundColor: timerAnimation.interpolate({
// //                 inputRange: [0, 0.3, 1],
// //                 outputRange: ['#FF4136', '#FF851B', '#2ECC40']
// //               })
// //             }
// //           ]}
// //         />
// //         <Text style={styles.timerText}>{timeRemaining}s</Text>
// //       </View>

// //       <View style={styles.questionContainer}>
// //         <Text style={styles.questionText}>{currentQuestion.question}</Text>
// //       </View>

// //       <View style={styles.optionsContainer}>
// //         {currentQuestion.options.map((option, index) => (
// //           <TouchableOpacity
// //             key={index}
// //             style={[
// //               styles.optionButton,
// //               selectedAnswer === index && styles.selectedOption,
// //               showResult && index === currentQuestion.correctAnswer && styles.correctOption,
// //               showResult && selectedAnswer === index &&
// //               selectedAnswer !== currentQuestion.correctAnswer && styles.incorrectOption
// //             ]}
// //             onPress={() => submitAnswer(index)}
// //             disabled={selectedAnswer !== null || waitingForOpponent || showResult}
// //           >
// //             <Text style={[
// //               styles.optionText,
// //               showResult && index === currentQuestion.correctAnswer && styles.correctOptionText,
// //               showResult && selectedAnswer === index &&
// //               selectedAnswer !== currentQuestion.correctAnswer && styles.incorrectOptionText
// //             ]}>
// //               {option}
// //             </Text>
// //           </TouchableOpacity>
// //         ))}
// //       </View>

// //       {waitingForOpponent && (
// //         <View style={styles.waitingContainer}>
// //           <ActivityIndicator size="small" color="#4287f5" />
// //           <Text style={styles.waitingText}>Waiting for opponent...</Text>
// //         </View>
// //       )}

// //       {showResult && (
// //         <View style={styles.resultContainer}>
// //           <Text style={styles.resultText}>
// //             {selectedAnswer === currentQuestion.correctAnswer ?
// //               '✓ Correct!' : '✗ Incorrect!'}
// //           </Text>
// //         </View>
// //       )}
// //     </View>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#f5f5f5',
// //     padding: 20,
// //   },
// //   loadingContainer: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   loadingText: {
// //     marginTop: 10,
// //     fontSize: 16,
// //     color: '#4287f5',
// //   },
// //   header: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     marginBottom: 20,
// //   },
// //   questionCounter: {
// //     backgroundColor: '#4287f5',
// //     padding: 8,
// //     borderRadius: 20,
// //   },
// //   questionCounterText: {
// //     color: 'white',
// //     fontWeight: 'bold',
// //   },
// //   scoreBoard: {
// //     flexDirection: 'row',
// //     gap: 10,
// //   },
// //   scoreText: {
// //     fontWeight: 'bold',
// //   },
// //   timerContainer: {
// //     height: 30,
// //     backgroundColor: '#e0e0e0',
// //     borderRadius: 15,
// //     marginBottom: 20,
// //     overflow: 'hidden',
// //     position: 'relative',
// //   },
// //   timerBar: {
// //     height: '100%',
// //     position: 'absolute',
// //     left: 0,
// //     top: 0,
// //   },
// //   timerText: {
// //     position: 'absolute',
// //     width: '100%',
// //     textAlign: 'center',
// //     lineHeight: 30,
// //     fontWeight: 'bold',
// //   },
// //   questionContainer: {
// //     backgroundColor: 'white',
// //     padding: 20,
// //     borderRadius: 10,
// //     marginBottom: 20,
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 3,
// //     elevation: 2,
// //   },
// //   questionText: {
// //     fontSize: 18,
// //     color: '#333',
// //     fontWeight: '500',
// //     textAlign: 'center',
// //   },
// //   optionsContainer: {
// //     marginBottom: 20,
// //   },
// //   optionButton: {
// //     backgroundColor: 'white',
// //     padding: 15,
// //     borderRadius: 10,
// //     marginBottom: 10,
// //     borderWidth: 1,
// //     borderColor: '#ddd',
// //   },
// //   selectedOption: {
// //     backgroundColor: '#E3F2FD',
// //     borderColor: '#4287f5',
// //   },
// //   correctOption: {
// //     backgroundColor: '#C8E6C9',
// //     borderColor: '#2ECC40',
// //   },
// //   incorrectOption: {
// //     backgroundColor: '#FFCDD2',
// //     borderColor: '#FF4136',
// //   },
// //   optionText: {
// //     fontSize: 16,
// //     color: '#333',
// //   },
// //   correctOptionText: {
// //     color: '#2ECC40',
// //     fontWeight: 'bold',
// //   },
// //   incorrectOptionText: {
// //     color: '#FF4136',
// //     fontWeight: 'bold',
// //   },
// //   waitingContainer: {
// //     flexDirection: 'row',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     padding: 10,
// //   },
// //   waitingText: {
// //     marginLeft: 10,
// //     color: '#4287f5',
// //   },
// //   resultContainer: {
// //     padding: 15,
// //     alignItems: 'center',
// //   },
// //   resultText: {
// //     fontSize: 20,
// //     fontWeight: 'bold',
// //   },
// //   gameOverTitle: {
// //     fontSize: 28,
// //     fontWeight: 'bold',
// //     textAlign: 'center',
// //     marginBottom: 30,
// //     color: '#333',
// //   },
// //   scoreContainer: {
// //     backgroundColor: 'white',
// //     padding: 20,
// //     borderRadius: 10,
// //     marginBottom: 30,
// //     alignItems: 'center',
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 3,
// //     elevation: 2,
// //   },
// //   scoreValue: {
// //     fontSize: 18,
// //     marginTop: 10,
// //     fontWeight: '500',
// //   },
// //   winnerText: {
// //     fontSize: 24,
// //     fontWeight: 'bold',
// //     textAlign: 'center',
// //     marginBottom: 30,
// //   },
// //   winnerTextWin: {
// //     color: '#2ECC40',
// //   },
// //   winnerTextLose: {
// //     color: '#FF4136',
// //   },
// //   winnerTextTie: {
// //     color: '#4287f5',
// //   },
// //   playAgainButton: {
// //     backgroundColor: '#4287f5',
// //     padding: 15,
// //     borderRadius: 10,
// //     alignItems: 'center',
// //   },
// //   playAgainButtonText: {
// //     color: 'white',
// //     fontSize: 18,
// //     fontWeight: 'bold',
// //   },
// // });

// // export default QuizScreen;


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

//   // Add refs to track current scores reliably
//   const playerScoreRef = useRef(0);
//   const opponentScoreRef = useRef(0);
//   const questionIndexRef = useRef(0); // Store the latest index

//   const questions = [ 
//     { 
//       id: 1, 
//       questionStem: "A watermelon weighs 5 kilograms. A pumpkin weighs 3 kilograms. What is the total weight of both fruits?", 
//       options: { A: "8 kilograms", B: "6 kilograms", C: "10 kilograms", D: "7 kilograms" }, 
//       Answer: "8 kilograms", 
//       subject: "Maths", 
//       topic: "Weight of objects", 
//       subtopic: "NA", 
//       ageCohort: 1, 
//       bloomsTag: "NA", 
//       difficultyTag: "NA", 
//       eolDescription: "NA", 
//       medium: "English", 
//       nodeDescription: "NA", 
//       nodeId: "NA", 
//       qImage: "", 
//       qVideoUrl: "", 
//       timeLimit: 20 
//     },
//     { 
//       id: 2, 
//       questionStem: "A book has 120 pages. If Rohan reads 30 pages every day, how many days will he take to finish the book?", 
//       options: { A: "2 days", B: "4 days", C: "5 days", D: "6 days" }, 
//       Answer: "4 days", 
//       subject: "Maths", 
//       topic: "Time and Reading", 
//       subtopic: "NA", 
//       ageCohort: 1, 
//       bloomsTag: "NA", 
//       difficultyTag: "NA", 
//       eolDescription: "NA", 
//       medium: "English", 
//       nodeDescription: "NA", 
//       nodeId: "NA", 
//       qImage: "", 
//       qVideoUrl: "", 
//       timeLimit: 20 
//     },
//     { 
//       id: 3, 
//       questionStem: "Reena bought 3 apples and 2 oranges. If each apple costs 5 rupees and each orange costs 3 rupees, what is the total cost?", 
//       options: { A: "19 rupees", B: "21 rupees", C: "23 rupees", D: "25 rupees" }, 
//       Answer: "21 rupees", 
//       subject: "Maths", 
//       topic: "Money and Cost", 
//       subtopic: "NA", 
//       ageCohort: 1, 
//       bloomsTag: "NA", 
//       difficultyTag: "NA", 
//       eolDescription: "NA", 
//       medium: "English", 
//       nodeDescription: "NA", 
//       nodeId: "NA", 
//       qImage: "", 
//       qVideoUrl: "", 
//       timeLimit: 20 
//     },
//     { 
//       id: 4, 
//       questionStem: "A rope is 15 meters long. If it is cut into 3 equal pieces, how long is each piece?", 
//       options: { A: "3 meters", B: "5 meters", C: "6 meters", D: "7 meters" }, 
//       Answer: "5 meters", 
//       subject: "Maths", 
//       topic: "Division and Measurement", 
//       subtopic: "NA", 
//       ageCohort: 1, 
//       bloomsTag: "NA", 
//       difficultyTag: "NA", 
//       eolDescription: "NA", 
//       medium: "English", 
//       nodeDescription: "NA", 
//       nodeId: "NA", 
//       qImage: "", 
//       qVideoUrl: "", 
//       timeLimit: 20 
//     },
//     { 
//       id: 5, 
//       questionStem: "A car travels 60 kilometers in 2 hours. What is its speed per hour?", 
//       options: { A: "20 km/h", B: "30 km/h", C: "40 km/h", D: "50 km/h" }, 
//       Answer: "30 km/h", 
//       subject: "Maths", 
//       topic: "Speed and Distance", 
//       subtopic: "NA", 
//       ageCohort: 1, 
//       bloomsTag: "NA", 
//       difficultyTag: "NA", 
//       eolDescription: "NA", 
//       medium: "English", 
//       nodeDescription: "NA", 
//       nodeId: "NA", 
//       qImage: "", 
//       qVideoUrl: "", 
//       timeLimit: 20 
//     }
//   ];

  
//   const currentQuestion = questions[currentQuestionIndex];
//   const isHost = NakamaService.isHost;

//   useEffect(() => {
//     questionIndexRef.current = currentQuestionIndex;
//   }, [currentQuestionIndex]);

//   // Update score refs when scores state changes
//   useEffect(() => {
//     playerScoreRef.current = scores.player;
//     opponentScoreRef.current = scores.opponent;
//   }, [scores]);

//   useEffect(() => {
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
//     // Get the time limit from the current question or use a default value
//     const timeLimit = currentQuestion.timeLimit || 20;
    
//     // Reset timer
//     setTimeRemaining(timeLimit);
//     timerAnimation.setValue(1);

//     // Animate timer
//     Animated.timing(timerAnimation, {
//       toValue: 0,
//       duration: timeLimit * 1000,
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

//     // Update opponent score in both state and ref
//     setScores((prev) => {
//       const updatedScores = { ...prev, opponent: data.playerScore };
//       opponentScoreRef.current = data.playerScore; // Update the ref immediately
//       return updatedScores;
//     });
//   };

//   const handleNextQuestion = (data) => {
//     setCurrentQuestionIndex(data.questionIndex);
//     setSelectedAnswer(null);
//     setWaitingForOpponent(false);
//     setShowResult(false);
//     startTimer();

//     setQuestions((prev) => {
//       const updatedQuestions = [...prev];
//       updatedQuestions[data.questionIndex] = {
//         questionStem: data.question, // Map "question" to "questionStem" for the new format
//         options: data.options,
//         Answer: data.correctAnswer, // Map "correctAnswer" to "Answer" for the new format
//         timeLimit: data.timeLimit,
//       };
//       return updatedQuestions;
//     });
//   };

//   const handleGameResult = (data) => {
//     setGameOver(true);

//     const playerUserId = NakamaService.userId;
//     const opponentUserId = NakamaService.opponentId;

//     setScores({
//       player: data.playerScore,
//       opponent: data.opponentScore,
//     });

//     playerScoreRef.current = data.playerScore;
//     opponentScoreRef.current = data.opponentScore;

//     // Determine winner based on received data
//     let winner;
//     if (data.winnerUserId === playerUserId) {
//       winner = playerUserId;
//     } else if (data.winnerUserId === 'tie') {
//       winner = 'tie';
//     } 

//     setWinner(winner);
//   };

//   const handlePlayerLeft = (players) => {
//     Alert.alert('Opponent left', 'Your opponent has left the game.');
//     setGameOver(true);
//     setWinner('player'); // Default win if opponent leaves
//   };

//   // Helper function to find option key (A, B, C, D) by value
//   const getOptionKeyByValue = (options, value) => {
//     const entry = Object.entries(options).find(([key, val]) => val === value);
//     return entry ? entry[0] : null;
//   };

//   const submitAnswer = async (optionKey) => {
//     if (waitingForOpponent || showResult) return;

//     const currentQuestion = questions[currentQuestionIndex];
//     let updatedAnswersOfPlayer;
    
//     // Store player's answer (now storing option key like "A", "B", etc.)
//     setSelectedAnswer(optionKey);
//     setPlayerAnswers(prev => {
//       updatedAnswersOfPlayer = { ...prev, [currentQuestion.id]: optionKey };
//       return updatedAnswersOfPlayer;
//     });

//     // Update score if correct - compare option value with Answer
//     const selectedOptionValue = currentQuestion.options[optionKey];
//     let newScore = playerScoreRef.current;
    
//     if (selectedOptionValue === currentQuestion.Answer) {
//       newScore += 1; // Increment score if correct
//       playerScoreRef.current = newScore; // Update ref immediately
//       setScores((prev) => ({ ...prev, player: newScore }));
//     }

//     // Send answer to opponent - using ref value ensures we send the latest score
//     await NakamaService.sendAnswer(
//       currentQuestion.id,
//       optionKey, // Now sending option key (A, B, C, D) instead of index
//       currentQuestion.timeLimit - timeRemaining,
//       newScore
//     );
//     setWaitingForOpponent(true);
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

//   const moveToNextQuestion = () => {
//     if (!isHost) {
//       return;
//     }

//     if (questionIndexRef.current < questions.length - 1) {
//       const nextIndex = questionIndexRef.current + 1;
//       const nextQuestion = questions[nextIndex];

//       // Send the updated question index to all players
//       NakamaService.forceNextQuestion({
//         questionIndex: nextIndex,
//         question: nextQuestion.questionStem, // Use questionStem instead of question
//         options: nextQuestion.options,
//         correctAnswer: nextQuestion.Answer, // Use Answer instead of correctAnswer
//         timeLimit: nextQuestion.timeLimit,
//       });

//       // Update both state and ref
//       setCurrentQuestionIndex(prevIndex => {
//         const newIndex = prevIndex + 1;
//         questionIndexRef.current = newIndex; // Update ref with latest value
//         return newIndex;
//       });

//       setSelectedAnswer(null);
//       setShowResult(false);
//       startTimer();
//     } else {
//       endGame();
//     }
//   };

//   const endGame = () => {
//     setGameOver(true);

//     const playerCurrentScore = playerScoreRef.current;
//     const opponentCurrentScore = opponentScoreRef.current;

//     const playerUserId = NakamaService.userId; // Get player's user ID
//     const opponentUserId = NakamaService.opponentId; // Get opponent's user ID

//     console.log("Player score: ", playerCurrentScore);
//     console.log("Opponent score: ", opponentCurrentScore);
//     console.log("Player ID: ", playerUserId);
//     console.log("Opponent ID: ", opponentUserId);

//     let winnerUserId;
//     if (playerCurrentScore > opponentCurrentScore) {
//       winnerUserId = playerUserId;
//     } else if (playerCurrentScore === opponentCurrentScore) {
//       winnerUserId = 'tie';
//     } 

//     setWinner(winnerUserId);
//     console.log("winner ID: ", winnerUserId);
//     if (isHost) {
//       NakamaService.endGame({
//         playerScore: opponentCurrentScore,
//         opponentScore: playerCurrentScore,
//         playerUserId: playerUserId,
//         opponentUserId: opponentUserId,
//         winnerUserId: winnerUserId,
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
//     const playerUserId = NakamaService.userId;
//     const winnerId = winner; // Get opponent's user ID

//     console.log("Player ID: ", playerUserId);
//     console.log("Winner ID: ", winnerId);
    
//     return (
//       <View style={styles.container}>
//         <Text style={styles.gameOverTitle}>Game Over!</Text>

//         <View style={styles.scoreContainer}>
//           <Text style={styles.scoreText}>Final Score</Text>
//           <Text style={styles.scoreValue}>You: {scores.player}</Text>
//           <Text style={styles.scoreValue}>Opponent: {scores.opponent}</Text>
//         </View>

//         <Text style={[styles.winnerText, scores.player === scores.opponent ? styles.winnerTextTie : scores.player > scores.opponent ? styles.winnerTextWin : styles.winnerTextLose]}>
//           {scores.player > scores.opponent ? 'You Won!' : scores.player === scores.opponent ? 'It\'s a Tie!' : 'You Lost!'}
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

//   // Extract option keys (A, B, C, D) for rendering
//   const optionKeys = Object.keys(currentQuestion.options);
  
//   // Find the correct answer key
//   const correctAnswerKey = getOptionKeyByValue(currentQuestion.options, currentQuestion.Answer);

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
//         <Text style={styles.questionText}>{currentQuestion.questionStem}</Text>
//       </View>

//       <View style={styles.optionsContainer}>
//         {optionKeys.map((optionKey) => (
//           <TouchableOpacity
//             key={optionKey}
//             style={[
//               styles.optionButton,
//               selectedAnswer === optionKey && styles.selectedOption,
//               showResult && optionKey === correctAnswerKey && styles.correctOption,
//               showResult && selectedAnswer === optionKey &&
//               selectedAnswer !== correctAnswerKey && styles.incorrectOption
//             ]}
//             onPress={() => submitAnswer(optionKey)}
//             disabled={selectedAnswer !== null || waitingForOpponent || showResult}
//           >
//             <Text style={[
//               styles.optionText,
//               showResult && optionKey === correctAnswerKey && styles.correctOptionText,
//               showResult && selectedAnswer === optionKey &&
//               selectedAnswer !== correctAnswerKey && styles.incorrectOptionText
//             ]}>
//               {optionKey}: {currentQuestion.options[optionKey]}
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
//             {selectedAnswer === correctAnswerKey ?
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
import axios from 'axios';

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
  const [isHost1, setIsHost1] = useState(false);

  // Add refs to track current scores reliably
  const playerScoreRef = useRef(0);
  const opponentScoreRef = useRef(0);
  const questionIndexRef = useRef(0); // Store the latest index

  const currentQuestion = questions[currentQuestionIndex];
  const isHost = NakamaService.isHost;

  // API call to get questions
  const getQuestionsBySubjectAndAge = async (subject, ageGroup) => {
    try {
      console.log("Fetching questions for subject:", subject, "age:", ageGroup);
      const response = await axios.get(`http://65.2.160.20/questions?subject=maths&age=1`, {
        headers: {
          Accept: "*/*",
        },
      });
      console.log("Questions fetched from API:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching questions:", error.response?.data || error);
      throw error;
    }
  };

  useEffect(() => {
    questionIndexRef.current = currentQuestionIndex;
  }, [currentQuestionIndex]);

  // Update score refs when scores state changes
  useEffect(() => {
    playerScoreRef.current = scores.player;
    opponentScoreRef.current = scores.opponent;
  }, [scores]);

  useEffect(() => {
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

      // Only host fetches questions
      if (isHost) {
        try {
          const fetchedQuestions = await getQuestionsBySubjectAndAge(subject, ageGroup);
          
          // Format questions if needed
          const formattedQuestions = fetchedQuestions.map(q => ({
            id: q.questionId || Math.random().toString(36).substring(7),
            questionStem: q.questionStem || q.question,
            options: q.options,
            Answer: q.answer || q.correctAnswer,
            subject: q.subject,
            topic: q.topic,
            subtopic: q.subtopic,
            ageCohort: q.ageCohort || q.ageGroup,
            timeLimit: q.timeLimit || 20
          }));
          console.log("Formatted questions:", formattedQuestions);
          setQuestions(formattedQuestions);
          
          // Send first question to client immediately
          if (formattedQuestions.length > 0) {
            const firstQuestion = formattedQuestions[0];
            NakamaService.forceNextQuestion({
              questionIndex: 0,
              question: firstQuestion.questionStem,
              options: firstQuestion.options,
              correctAnswer: firstQuestion.Answer,
              timeLimit: firstQuestion.timeLimit,
            });
          }
        } catch (error) {
          console.error("Error fetching questions:", error);
          Alert.alert('Error', 'Failed to fetch questions. Please try again.');
          navigation.goBack();
          return;
        }
      } else {
        // Non-host players don't fetch questions
        // They'll receive questions from the host via handleNextQuestion
        // Initialize with empty array until first question is received
        setQuestions([]);
      }

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

  useEffect(() => {
    if (questions.length > currentQuestionIndex && questions[currentQuestionIndex]) {
      console.log("Starting timer for question:", questions[currentQuestionIndex]);
      startTimer();
    }
  }, [questions, currentQuestionIndex]);

  const startTimer = () => {
    const question = questions[currentQuestionIndex];

    console.log("Starting timer for question:", currentQuestion)
    // Don't start timer if there's no current question yet
    if (!question) {
      console.log("No current question, cannot start timer");
      return;
    }
    
    // Get the time limit from the current question or use a default value
    const timeLimit = question.timeLimit || 30;
    console.log("Time limit:", timeLimit)
    
    // Reset timer
    setTimeRemaining(timeLimit);
    timerAnimation.setValue(1);

    // Animate timer
    Animated.timing(timerAnimation, {
      toValue: 0,
      duration: timeLimit * 1000 || 30000,
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
    // Update current question index
    setCurrentQuestionIndex(data.questionIndex);
    setSelectedAnswer(null);
    setWaitingForOpponent(false);
    setShowResult(false);
    
    // For non-host, update or add the question to the questions array
    setQuestions(prev => {
      const newQuestions = [...prev];
      // If the question at this index doesn't exist yet, or we're updating it
      newQuestions[data.questionIndex] = {
        id: data.questionIndex + 1, // Generate an ID if none exists
        questionStem: data.question,
        options: data.options,
        Answer: data.correctAnswer,
        timeLimit: data.timeLimit,
      };
      return newQuestions;
    });
    
    // Now that we're sure the question exists, start the timer
    startTimer();
  };

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

    setWinner(winner);
  };

  const handlePlayerLeft = (players) => {
    Alert.alert('Opponent left', 'Your opponent has left the game.');
    setGameOver(true);
    setWinner('player'); // Default win if opponent leaves
  };

  // Helper function to find option key (A, B, C, D) by value
  const getOptionKeyByValue = (options, value) => {
    const entry = Object.entries(options).find(([key, val]) => val === value);
    return entry ? entry[0] : null;
  };

  const submitAnswer = async (optionKey) => {
    if (waitingForOpponent || showResult || !currentQuestion) return;

    let updatedAnswersOfPlayer;
    
    // Store player's answer (now storing option key like "A", "B", etc.)
    setSelectedAnswer(optionKey);
    setPlayerAnswers(prev => {
      updatedAnswersOfPlayer = { ...prev, [currentQuestion.id]: optionKey };
      return updatedAnswersOfPlayer;
    });

    // Update score if correct - compare option value with Answer
    const selectedOptionValue = currentQuestion.options[optionKey];
    let newScore = playerScoreRef.current;
    
    if (selectedOptionValue === currentQuestion.Answer) {
      newScore += 1; // Increment score if correct
      playerScoreRef.current = newScore; // Update ref immediately
      setScores((prev) => ({ ...prev, player: newScore }));
    }

    // Send answer to opponent - using ref value ensures we send the latest score
    await NakamaService.sendAnswer(
      currentQuestion.id,
      optionKey, // Now sending option key (A, B, C, D) instead of index
      currentQuestion.timeLimit - timeRemaining,
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
        question: nextQuestion.questionStem,
        options: nextQuestion.options,
        correctAnswer: nextQuestion.Answer,
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
        <Text style={styles.loadingText}>
          {isHost ? "Fetching questions..." : "Waiting for host to prepare quiz..."}
        </Text>
      </View>
    );
  }

  // Handle case where we're waiting for the host to send the first question
  if (!currentQuestion) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4287f5" />
        <Text style={styles.loadingText}>Waiting for questions...</Text>
      </View>
    );
  }

  if (gameOver) {
    const playerUserId = NakamaService.userId;
    const winnerId = winner; // Get opponent's user ID

    console.log("Player ID: ", playerUserId);
    console.log("Winner ID: ", winnerId);
    
    return (
      <View style={styles.container}>
        <Text style={styles.gameOverTitle}>Game Over!</Text>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>Final Score</Text>
          <Text style={styles.scoreValue}>You: {scores.player}</Text>
          <Text style={styles.scoreValue}>Opponent: {scores.opponent}</Text>
        </View>

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

  // Extract option keys (A, B, C, D) for rendering
  const optionKeys = Object.keys(currentQuestion.options);
  
  // Find the correct answer key
  const correctAnswerKey = getOptionKeyByValue(currentQuestion.options, currentQuestion.Answer);

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
        <Text style={styles.questionText}>{currentQuestion.questionStem}</Text>
      </View>

      <View style={styles.optionsContainer}>
        {optionKeys.map((optionKey) => (
          <TouchableOpacity
            key={optionKey}
            style={[
              styles.optionButton,
              selectedAnswer === optionKey && styles.selectedOption,
              showResult && optionKey === correctAnswerKey && styles.correctOption,
              showResult && selectedAnswer === optionKey &&
              selectedAnswer !== correctAnswerKey && styles.incorrectOption
            ]}
            onPress={() => submitAnswer(optionKey)}
            disabled={selectedAnswer !== null || waitingForOpponent || showResult}
          >
            <Text style={[
              styles.optionText,
              showResult && optionKey === correctAnswerKey && styles.correctOptionText,
              showResult && selectedAnswer === optionKey &&
              selectedAnswer !== correctAnswerKey && styles.incorrectOptionText
            ]}>
              {optionKey}: {currentQuestion.options[optionKey]}
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
            {selectedAnswer === correctAnswerKey ?
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