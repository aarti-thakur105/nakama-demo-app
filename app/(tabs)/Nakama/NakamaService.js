// src/services/NakamaService.js
import { Client } from "@heroiclabs/nakama-js";
import {
  NAKAMA_SERVER_KEY,
  NAKAMA_HOST,
  NAKAMA_PORT,
  NAKAMA_USE_SSL,
} from "../Nakama/nakamaConfig";

class NakamaService {
  constructor() {
    this.client = new Client(
      NAKAMA_SERVER_KEY,
      NAKAMA_HOST,
      NAKAMA_PORT,
      NAKAMA_USE_SSL
    );
    this.session = null;
    this.socket = null;
    this.matchId = null;
    this.token = null;
    this.userId = null;
    this.opponentId = null;
    this.isHost = false;
    this.hostUserId = null;
  }

  // src/services/NakamaService.js - Updated authenticate method

  async authenticate() {
    try {
      // Get existing device ID from storage or create a new one
      let deviceId = localStorage.getItem("nakamaDeviceId");

      if (!deviceId) {
        // Generate a new device ID if one doesn't exist
        deviceId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        localStorage.setItem("nakamaDeviceId", deviceId);
      }

      this.session = await this.client.authenticateDevice(deviceId, true);
      this.userId = this.session.user_id;

      // Create a socket connection
      this.socket = this.client.createSocket();
      await this.socket.connect(this.session, true);

      return true;
    } catch (error) {
      console.error("Authentication error:", error);
      return false;
    }
  }

  async findMatch(subject, ageGroup) {
    try {
      if (!this.session || !this.socket) {
        await this.authenticate();
      }

      const query = "";
      const minSize = 2;
      const maxSize = 2;
      const stringProperties = {
        subject: subject,
        ageGroup: ageGroup
      };

      // Add player to matchmaking pool
      const matchmakerTicket = await this.socket.addMatchmaker(
        query,
        minSize,
        maxSize,
        stringProperties
      );

      // Wait for a match
      return new Promise((resolve, reject) => {
        // Listen for matchmaker matched event
        this.socket.onmatchmakermatched = (matched) => {
          // In Nakama, the match_id comes directly from the matched object
          this.token = matched.token;

          if (!this.token) {
            console.error("No match ID received");
            reject(new Error("No match ID received"));
            return;
          }

          const sortedUsers = matched.users.sort((a, b) => 
            a.presence.session_id.localeCompare(b.presence.session_id)
          );
          const hostUser = sortedUsers[0];
          this.hostUserId = hostUser.presence.user_id;
          this.isHost = (this.userId === this.hostUserId);
          
          console.log("Host determined:", this.isHost ? "I am the host" : "I am not the host");

          // Join the match with the correct parameter
          this.socket
            .joinMatch(null, this.token)
            .then((match) => {
              this.matchId = match.match_id;

              if (!match.presences || match.presences.length === 0) {
                console.warn("No presences in match data");
                resolve(match); // Continue anyway
                return;
              }

              // Find opponent ID
              this.opponentId = match.presences.find(
                (presence) => presence.user_id !== this.userId
              )?.user_id;

              resolve(match);
            })
            .catch((error) => {
              console.error("Error joining match:", error);
              reject(error);
            });
        };

        // Set a reasonable timeout for matchmaking
        setTimeout(() => {
          if (!this.matchId) {
            reject(new Error("Matchmaking timeout"));
          }
        }, 160000); // 60 seconds timeout
      });
    } catch (error) {
      console.error("Matchmaking error:", error);
      throw error;
    }
  }

  async userId(){
    return this.userId;
  }

  async opponentId(){
    return this.opponentId;
  }
  async sendAnswer(questionId, answerId, timeSpent, playerScore) {
    try {
      if (!this.matchId) {
        throw new Error("No active match");
      }

      const data = {
        questionId,
        answerId,
        timeSpent,
        playerScore
      };

      await this.socket.sendMatchState(
        this.matchId,
        1, // Op code for answers
        JSON.stringify(data)
      );

      return true;
    } catch (error) {
      console.error("Error sending answer:", error);
      return false;
    }
  }

  handleHostChange(match) {
    if (!match.presences || match.presences.length === 0) return;
    
    // Sort presences by session ID
    const sortedPresences = [...match.presences].sort((a, b) => 
      a.session_id.localeCompare(b.session_id)
    );
    
    // The first presence is the host
    const newHostUserId = sortedPresences[0].user_id;
    const hostChanged = this.hostUserId !== newHostUserId;
    
    this.hostUserId = newHostUserId;
    this.isHost = (this.userId === this.hostUserId);
    
    if (hostChanged) {
      console.log("Host changed:", this.isHost ? "I am now the host" : "I am not the host");
      return true;
    }
    return false;
  }

  listenForMatchUpdates(callbacks) {
    if (!this.socket) {
      console.error("Socket not connected");
      return;
    }

    this.socket.onmatchdata = (matchData) => {
      if (matchData.match_id !== this.matchId) return;

      try {
        const data = JSON.parse(new TextDecoder().decode(matchData.data));
        console.log("Received match data:", matchData.op_code, data);

        switch (matchData.op_code) {
          case 1: // Answer received
            if (callbacks.onAnswerReceived) {
              callbacks.onAnswerReceived(matchData.presence.user_id, data);
            }
            break;
          case 2: // Next question
            if (callbacks.onNextQuestion) {
              callbacks.onNextQuestion(data);
            }
            break;
          case 3: // Game result
            if (callbacks.onGameResult) {
              callbacks.onGameResult(data);
            }
            break;
        }
      } catch (error) {
        console.error("Error parsing match data:", error);
      }
    };

    this.socket.onmatchpresence = (presenceEvent) => {
      if (presenceEvent.match_id !== this.matchId) return;

      if (presenceEvent.leaves && presenceEvent.leaves.length > 0) {
        // Check if the host left
        const hostLeft = presenceEvent.leaves.some(presence => 
          presence.user_id === this.hostUserId
        );
        
        if (hostLeft) {
          // We need to recalculate the host
          this.socket.getMatch(this.matchId)
            .then(match => {
              const hostChanged = this.handleHostChange(match);
              if (hostChanged && callbacks.onHostChanged) {
                callbacks.onHostChanged(this.isHost);
              }
            })
            .catch(error => console.error("Error getting match:", error));
        }
        
        if (callbacks.onPlayerLeft) {
          callbacks.onPlayerLeft(presenceEvent.leaves);
        }
      }

      if (presenceEvent.joins && presenceEvent.joins.length > 0) {
        if (callbacks.onPlayerJoined) {
          callbacks.onPlayerJoined(presenceEvent.joins);
        }
      }
    };
  }

  // listenForMatchUpdates(callbacks) {
  //   if (!this.socket) {
  //     console.error("Socket not connected");
  //     return;
  //   }

  //   this.socket.onmatchdata = (matchData) => {
  //     if (matchData.match_id !== this.matchId) return;

  //     const data = JSON.parse(new TextDecoder().decode(matchData.data));

  //     switch (matchData.op_code) {
  //       case 1: // Answer received
  //         if (callbacks.onAnswerReceived) {
  //           callbacks.onAnswerReceived(matchData.presence.user_id, data);
  //         }
  //         break;
  //       case 2: // Next question
  //         if (callbacks.onNextQuestion) {
  //           callbacks.onNextQuestion(data);
  //         }
  //         break;
  //       case 3: // Game result
  //         if (callbacks.onGameResult) {
  //           callbacks.onGameResult(data);
  //         }
  //         break;
  //     }
  //   };

  //   this.socket.onmatchpresence = (presenceEvent) => {
  //     if (presenceEvent.match_id !== this.matchId) return;

  //     if (presenceEvent.leaves && presenceEvent.leaves.length > 0) {
  //       if (callbacks.onPlayerLeft) {
  //         callbacks.onPlayerLeft(presenceEvent.leaves);
  //       }
  //     }

  //     if (presenceEvent.joins && presenceEvent.joins.length > 0) {
  //       if (callbacks.onPlayerJoined) {
  //         callbacks.onPlayerJoined(presenceEvent.joins);
  //       }
  //     }
  //   };
  // }

  async leaveMatch() {
    if (this.socket && this.matchId) {
      try {
        await this.socket.leaveMatch(this.matchId);
        this.matchId = null;
        this.opponentId = null;
        return true;
      } catch (error) {
        console.error("Error leaving match:", error);
        return false;
      }
    }
    return true;
  }

  async disconnect() {
    if (this.socket) {
      await this.socket.disconnect();
      this.socket = null;
    }
    this.session = null;
  }

  async forceNextQuestion(nextQuestionData) {
    if (!this.matchId) {
      console.error("No active match");
      return false;
    }
  
    try {
      await this.socket.sendMatchState(
        this.matchId,
        2, // Op code for next question
        JSON.stringify(nextQuestionData)
      );
    } catch (error) {
      console.error("Error forcing next question:", error);
    }
  }

  async endGame(finalScores) {
    if (!this.matchId || !this.isHost) {
      return false;
    }
    
    try {
      await this.socket.sendMatchState(
        this.matchId,
        3, // Op code for game result
        JSON.stringify(finalScores)
      );
      return true;
    } catch (error) {
      console.error("Error ending game:", error);
      return false;
    }
  }

}

export default new NakamaService();
