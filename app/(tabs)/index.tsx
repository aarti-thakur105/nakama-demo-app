// src/screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import NakamaService from './Nakama/NakamaService';
import { SUBJECT_TYPES, AGE_GROUPS } from './Nakama/nakamaConfig';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authenticate = async () => {
      try {
        const result = await NakamaService.authenticate();
        setIsAuthenticated(result);
      } catch (error) {
        console.error('Authentication error:', error);
        Alert.alert('Error', 'Failed to connect to game server');
      }
    };

    authenticate();

    return () => {
      // Cleanup when component unmounts
    };
  }, []);

  const handlePlayWithFriends = async () => {
    // For demo purposes, we're hardcoding values. In a real app, you'd allow users to invite friends
    await startMatchmaking(SUBJECT_TYPES.MATH, AGE_GROUPS.TEEN);
  };

  const handlePlayWithAnyone = async () => {
    // For demo purposes, hardcoding values. In a real app, you might prompt the user
    await startMatchmaking(SUBJECT_TYPES.SCIENCE, AGE_GROUPS.TEEN);
  };

  const startMatchmaking = async (subject, ageGroup) => {
    if (!isAuthenticated) {
      Alert.alert('Not Connected', 'Connecting to server first');
      try {
        await NakamaService.authenticate();
        setIsAuthenticated(true);
      } catch (error) {
        Alert.alert('Error', 'Failed to connect to game server');
        return;
      }
    }

    setIsConnecting(true);
    try {
      Alert.alert('Finding Match', 'Looking for another player...', [
        {
          text: 'Cancel',
          onPress: () => {
            setIsConnecting(false);
            // Cancel matchmaking logic would go here
          },
          style: 'cancel',
        },
      ]);

      // Find a match with the given criteria
      const match = await NakamaService.findMatch(subject, ageGroup);
      console.log('Match found:', match);
      
      setIsConnecting(false);
      
      // Navigate to quiz screen when match is found
      navigation.navigate('Quiz', {
        match: match,
        matchId: match.match_id,
        subject,
        ageGroup,
      });
    } catch (error) {
      console.error('Matchmaking error:', error);
      setIsConnecting(false);
      Alert.alert('Error', 'Failed to find a match. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quiz Battle</Text>
      <Text style={styles.subtitle}>Test your knowledge against others!</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handlePlayWithFriends}
          disabled={isConnecting}
        >
          <Text style={styles.buttonText}>Play with Friends</Text>
          <Text style={styles.buttonSubtext}>(Math Quiz)</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handlePlayWithAnyone}
          disabled={isConnecting}
        >
          <Text style={styles.buttonText}>Play with Anyone</Text>
          <Text style={styles.buttonSubtext}>(Science Quiz)</Text>
        </TouchableOpacity>
      </View>
      
      {isConnecting && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4287f5" />
          <Text style={styles.loadingText}>Finding a match...</Text>
        </View>
      )}
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Server: {isAuthenticated ? '✓ Connected' : '✗ Disconnected'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 50,
    color: '#666',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  button: {
    backgroundColor: '#4287f5',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: '#42adf5',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 5,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4287f5',
  },
  statusContainer: {
    position: 'absolute',
    bottom: 20,
    padding: 10,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
});

export default HomeScreen;