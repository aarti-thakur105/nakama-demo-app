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
    this.userId = null;
    this.opponentId = null;
  }

  // src/services/NakamaService.js - Updated authenticate method

  async authenticate() {
    try {
      // Get existing device ID from storage or create a new one
      let deviceId = localStorage.getItem("nakamaDeviceId");

      if (!deviceId) {
        // Generate a new device ID if one doesn't exist
        deviceId =
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);
        localStorage.setItem("nakamaDeviceId", deviceId);
      }

      console.log("Using device ID:", deviceId);
      this.session = await this.client.authenticateDevice(deviceId, true);
      this.userId = this.session.user_id;
      console.log("Authenticated with Nakama:", this.userId);

      // Create a socket connection
      this.socket = this.client.createSocket();
      await this.socket.connect(this.session, true);
      console.log("Socket connected");

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
  
      console.log(`Finding match for subject: ${subject}, age group: ${ageGroup}`);
      
      const query =""
      console.log("Query:", query);
      console.log("Socket: ", this.socket);
      console.log("client: ", this.client)
      const minSize = 2;
      const maxSize = 2;
      const stringProperties = {
        subject: subject,
      };

      // Add player to matchmaking pool
      const matchmakerTicket = await this.socket.addMatchmaker(
        query,
        minSize,
        maxSize,
        stringProperties,
      );
  
      console.log("Added to matchmaking with ticket:", matchmakerTicket.ticket);
      
      // Wait for a match
      return new Promise((resolve, reject) => {
        // Listen for matchmaker matched event
        this.socket.onmatchmakermatched = (matched) => {
          console.log("Match found:", matched);
          
          // In Nakama, the match_id comes directly from the matched object
          this.matchId = matched.token;
          console.log("Match ID:", this.matchId);
  
          if (!this.matchId) {
            console.error("No match ID received");
            reject(new Error("No match ID received"));
            return;
          }
  
          // Join the match with the correct parameter
          this.socket.joinMatch(null,this.matchId)
            .then(match => {
              console.log("Joined match:", match);
              
              if (!match.presences || match.presences.length === 0) {
                console.warn("No presences in match data");
                resolve(match); // Continue anyway
                return;
              }
  
              // Find opponent ID
              this.opponentId = match.presences.find(
                presence => presence.user_id !== this.userId
              )?.user_id;
  
              console.log("Opponent ID:", this.opponentId);
              resolve(match);
            })
            .catch(error => {
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

  // async findMatch(subject, ageGroup) {
  //   try {
  //     if (!this.session || !this.socket) {
  //       await this.authenticate();
  //     }

  //     console.log(
  //       `Finding match for subject: ${subject}, age group: ${ageGroup}`
  //     );

  //     // Add player to matchmaking pool
  //     // const query = `+properties.subject:${subject} +properties.ageGroup:${ageGroup}`;
  //     const query =""
  //     console.log("Query:", query);
  //     console.log("Socket: ", this.socket);
  //     console.log("client: ", this.client)
  //     const minSize = 2;
  //     const maxSize = 2;
  //     const stringProperties = {
  //       subject: subject,
  //     };
  //     // const numericProperties = {};
  //     const matchmakerTicket = await this.socket.addMatchmaker(
  //       query,
  //       minSize,
  //       maxSize,
  //       stringProperties,
  //     );

  //     console.log("Added to matchmaking with ticket:", matchmakerTicket.ticket);

  //     this.socket.receivedMatchmakerMatched = (matchmakerMatched) => {
  //       console.log("Match found using receivedMatchmakerMatched!", matchmakerMatched);
        
  //       // Join the match
  //       const matchId = matchmakerMatched.match_id;
  //       this.socket.send({ match_join: { match_id: matchId } });
  //     };
      
  //     // Wait for a match
  //     return new Promise((resolve, reject) => {
  //       // Listen for matchmaker matched event
  //       this.socket.onmatchmakermatched = (matched) => {
  //         console.log("Match found:", matched);
  //         this.matchId = matched.token;
  //         const matchId1 = null;
  //         console.log("Token: ", this.matchId)

  //         // Join the matc

  //         this.socket
  //           .joinMatch(matchId1, this.matchId)
  //           .then((match) => {
  //             console.log("Joined match:", match);

  //             // Find opponent ID
  //             this.opponentId = match.presences.find(
  //               (presence) => presence.user_id !== this.userId
  //             )?.user_id;

  //             console.log("Opponent ID:", this.opponentId);
  //             resolve(match);
  //           })
  //           .catch((error) => {
  //             console.error("Error joining match:", error);
  //             reject(error);
  //           });
  //       };

  //       // Set a timeout for matchmaking
  //       // setTimeout(() => {
  //       //   if (!this.matchId) {
  //       //     reject(new Error("Matchmaking timeout"));
  //       //   }
  //       // }, 53000000000); 
  //     });
  //   } catch (error) {
  //     console.error("Matchmaking error:", error);
  //     throw error;
  //   }
  // }

  async sendAnswer(questionId, answerId, timeSpent) {
    try {
      if (!this.matchId) {
        throw new Error("No active match");
      }

      const data = {
        questionId,
        answerId,
        timeSpent,
      };

      await this.socket.sendMatchState(
        this.matchId,
        /* opCode= */ 1, // Op code for answers
        JSON.stringify(data)
      );

      return true;
    } catch (error) {
      console.error("Error sending answer:", error);
      return false;
    }
  }

  listenForMatchUpdates(callbacks) {
    if (!this.socket) {
      console.error("Socket not connected");
      return;
    }

    this.socket.onmatchdata = (matchData) => {
      if (matchData.match_id !== this.matchId) return;

      const data = JSON.parse(matchData.data);
      console.log("Match data received:", data);

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
    };

    this.socket.onmatchpresence = (presenceEvent) => {
      if (presenceEvent.match_id !== this.matchId) return;

      if (presenceEvent.leaves && presenceEvent.leaves.length > 0) {
        console.log("Player left the match:", presenceEvent.leaves);
        if (callbacks.onPlayerLeft) {
          callbacks.onPlayerLeft(presenceEvent.leaves);
        }
      }

      if (presenceEvent.joins && presenceEvent.joins.length > 0) {
        console.log("Player joined the match:", presenceEvent.joins);
        if (callbacks.onPlayerJoined) {
          callbacks.onPlayerJoined(presenceEvent.joins);
        }
      }
    };
  }

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
}

export default new NakamaService();
