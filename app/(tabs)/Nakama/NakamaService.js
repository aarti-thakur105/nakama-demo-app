// src/services/NakamaService.js
import { Client } from "@heroiclabs/nakama-js";
import {
  NAKAMA_SERVER_KEY,
  NAKAMA_HOST,
  NAKAMA_PORT,
  NAKAMA_USE_SSL,
} from "../Nakama/nakamaConfig";

// Define op codes as constants
const OP_CODES = {
  ANSWER: 1,
  NEXT_QUESTION: 2,
  GAME_RESULT: 3
};

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
  }
  
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
  
  async sendAnswer(questionId, answerId, timeSpent, isCorrect) {
    try {
      if (!this.matchId) {
        throw new Error("No active match");
      }

      const data = {
        questionId,
        answerId,
        timeSpent,
        isCorrect // Add isCorrect flag to track if answer was correct
      };

      await this.socket.sendMatchState(
        this.matchId,
        OP_CODES.ANSWER, // Op code for answers
        JSON.stringify(data)
      );

      return true;
    } catch (error) {
      console.error("Error sending answer:", error);
      return false;
    }
  }

  async sendNextQuestion(questionIndex) {
    try {
      if (!this.matchId) {
        throw new Error("No active match");
      }

      const data = {
        questionIndex,
      };

      await this.socket.sendMatchState(
        this.matchId,
        OP_CODES.NEXT_QUESTION, // Op code for next question
        JSON.stringify(data)
      );

      return true;
    } catch (error) {
      console.error("Error sending next question:", error);
      return false;
    }
  }

  async sendGameResult(result) {
    try {
      if (!this.matchId) {
        throw new Error("No active match");
      }

      await this.socket.sendMatchState(
        this.matchId,
        OP_CODES.GAME_RESULT, // Op code for game result
        JSON.stringify(result)
      );

      return true;
    } catch (error) {
      console.error("Error sending game result:", error);
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

      const data = JSON.parse(new TextDecoder().decode(matchData.data));

      switch (matchData.op_code) {
        case OP_CODES.ANSWER: // Answer received
          if (callbacks.onAnswerReceived) {
            callbacks.onAnswerReceived(matchData.presence.user_id, data);
          }
          break;
        case OP_CODES.NEXT_QUESTION: // Next question
          if (callbacks.onNextQuestion) {
            callbacks.onNextQuestion(data);
          }
          break;
        case OP_CODES.GAME_RESULT: // Game result
          if (callbacks.onGameResult) {
            callbacks.onGameResult(data);
          }
          break;
      }
    };

    this.socket.onmatchpresence = (presenceEvent) => {
      if (presenceEvent.match_id !== this.matchId) return;

      if (presenceEvent.leaves && presenceEvent.leaves.length > 0) {
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

  async forceNextQuestion(nextQuestionIndex) {
    if (!this.matchId) {
      console.error("No active match");
      return false;
    }
    try {
      await this.socket.sendMatchState(
        this.matchId,
        OP_CODES.NEXT_QUESTION,
        JSON.stringify({
          questionIndex: nextQuestionIndex,
        })
      );
      return true;
    } catch (error) {
      console.error("Error forcing next question:", error);
      return false;
    }
  }
}

export default new NakamaService();