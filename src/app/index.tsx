import axios from "axios";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView, Platform,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from "react-native";

const API_KEY = ""; // 

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(
        "https://api.anthropic.com/v1/messages",
        {
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: updated
        },
        {
          headers: {
            "x-api-key": API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
          }
        }
      );
      const botMsg: Message = { role: "assistant", content: res.data.content[0].text };
      setMessages([...updated, botMsg]);
    } catch (e) {
      setMessages([...updated, { role: "assistant", content: "❌ Error! Check your API key." }]);
    }

    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Text style={styles.header}>🤖 My ChatBot</Text>

      <FlatList
        data={messages}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === "user" ? styles.user : styles.bot]}>
            <Text style={item.role === "user" ? styles.userText : styles.botText}>
              {item.content}
            </Text>
          </View>
        )}
      />

      {loading && <ActivityIndicator color="#6C63FF" size="small" style={{ marginBottom: 8 }} />}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity style={styles.btn} onPress={sendMessage}>
          <Text style={styles.btnText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f0f0f5", paddingTop: 55 },
  header: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 15, color: "#6C63FF" },
  bubble: { padding: 12, borderRadius: 16, marginVertical: 5, maxWidth: "80%" },
  user: { backgroundColor: "#6C63FF", alignSelf: "flex-end" },
  bot: { backgroundColor: "#ffffff", alignSelf: "flex-start", borderWidth: 1, borderColor: "#e0e0e0" },
  userText: { color: "#fff", fontSize: 15 },
  botText: { color: "#333", fontSize: 15 },
  inputRow: { flexDirection: "row", marginTop: 10, marginBottom: 10 },
  input: { flex: 1, backgroundColor: "#fff", borderRadius: 25, paddingHorizontal: 18, paddingVertical: 10, fontSize: 15, borderWidth: 1, borderColor: "#ddd", marginRight: 8 },
  btn: { backgroundColor: "#6C63FF", borderRadius: 25, paddingHorizontal: 22, justifyContent: "center" },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 15 }
});